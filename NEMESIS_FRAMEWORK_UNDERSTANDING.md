# 🧠 Nemesis Framework — Complete Understanding

> **Repo:** https://github.com/jarir2020/jarir-nemesis
> **Package:** `jarir/nemesis-framework` v7.1.0
> **Author:** Jarir Ahmed
> **License:** MIT
> **PHP:** >= 8.2
> **Local clone:** `/tmp/nemesis-framework/`

This document captures the full framework understanding gathered via parallel exploration of 4 agents (core architecture, routing/middleware, ORM/DB, auth/plugins/security/views).

---

## 1. What it is & what it solves

**Nemesis v7.1.0** — High-performance, zero-dependency-core PHP framework for SaaS + APIs.

The "zero-dependency" claim is **mostly marketing**: `composer.json` still pulls in PHPMailer, Flysystem, AWS SDK, Swagger-php, and ~20 first-party `jarir-ahmed/*` packages. The *core* (`src/Core`) is self-contained; the rest of `src/` and the package providers auto-load lazily.

**Key Features (per README):**
- Enterprise Plugin System with sandboxed, permission-based sidecar architecture
- Eloquent-style ORM with ACID-compliant ActiveRecord and full relationships
- Advanced Routing: groups, named routes, middleware, fallbacks
- Security: built-in CSRF, RBAC, HMAC, native encryption
- Zero-dependency core
- Developer Experience: real-time DebugBar, automatic Swagger generation, rich CLI

**Changelog highlights:**
- v7.1.0 (2026-07-06): IP allow/block helper, `ip` middleware alias
- v7.0.3 (2026-07-06): Isolated `examples/` gallery, `examples:list` CLI
- v5.1.1 (2026-04-06): SQLite as default (zero-config install)
- v5.0.0 (2026-04-04): Ground-up rewrite, 769/769 tests
- v4.0.0 (2026-03-01): Plugin system, DebugBar, Swagger, CloudStorage
- v3.0.0 (2025-12-01): Initial public release

---

## 2. Request lifecycle (HTTP)

```
Browser → public/index.php (or root index.php)
  → autoload → Config::load → View::addPath
  → PluginManager::discover() → Bootstrap::check() (fail-fast)
  → Container (Request, Router, Mailer as singletons)
  → PackageManifest providers (register/boot, lazy)
  → ErrorHandler wired
  → Database::connect(config)
  → App\Http\Kernel → middleware Pipeline
  → routes/route.php (+ web.php, api.php)
  → Router::dispatch($uri, $method)
  → Controller → Response
```

**Front controllers:**
- `/index.php` (root) — loads only `route.php` (legacy single-file mode)
- `/public/index.php` — loads `route.php` + `web.php` + `api.php` (preferred split mode)

**`bin/nemesis` CLI** is a single ~2300-line `switch($argv[1])` script that bootstraps via `index.php` then dispatches ~75+ commands.

**CORS handling:** `index.php` sets CORS headers at the top, short-circuits OPTIONS with 200.

**URI normalization:** Strips `dirname(SCRIPT_NAME)` base path before dispatch so the app works under subfolders.

---

## 3. Core subsystems (mapped)

| Subsystem | Location | Key classes |
|---|---|---|
| **Bootstrap & DI** | `src/Core/` | `Container` (singleton), `Bootstrap`, `ServiceProvider`, `PackageManifest`, `ErrorHandler` |
| **Config** | `src/Config/` | `AppConfig`, `DatabaseConfig`, `CacheConfig`, `MailConfig`, `QueueConfig`, `SessionConfig`, `ConfigFactory` |
| **Router** | `src/Router/` | `Router` (890 lines, **single class, no Route object** — routes are arrays) + `RouteModelBinder` |
| **HTTP** | `src/Http/` | `Request`, `Response`, `ApiResponse`, `Pipeline`, `Session`, `JsonResource`, `ResourceResponse` |
| **Middleware** | `app/Http/Middleware/` (app layer!) | `Authenticate`, `ApiKeyAuthenticate`, `StartSession`, `VerifyCsrfToken`, `ThrottleRequests`, `CorsMiddleware`, `SecurityHeadersMiddleware`, `FrontendFrameworkMiddleware`, `DebugBarMiddleware`, `IpAccessMiddleware`, `CheckForMaintenanceMode`, `ApiVersionMiddleware`, `TenantMiddleware`, `TestMiddleware` |
| **Kernel** | `app/Http/Kernel.php` | Global middleware list + groups (`web`, `api`) + aliases (`auth`, `throttle:60,1`, `cors`, etc.) |
| **Controllers** | `app/Controllers/` + `src/Core/Controller.php` | Base class with `authorize()`, `render()`, DI via container |
| **ORM** | `src/Core/Model.php` | `abstract class Model implements \ArrayAccess` — Eloquent-style AR |
| **Query layer** | `src/Core/Fluent.php` + `src/Core/Builder.php` | `Fluent` = raw QB, `Builder` = model-facing layer |
| **Relations** | `src/Core/{HasOne,HasMany,BelongsTo,BelongsToMany}.php` | Lazy-loaded via `__get` magic |
| **DB connection** | `src/Core/Database.php` | Static, multi-driver (mysql/pgsql/sqlite), PDO pool, transactions |
| **Schema/Migrations** | `src/Database/` | `Schema`, `Blueprint`, `Migration` (abstract), `MigrationManager`, `Grammars/{MySql,Postgres,SQLite}Grammar` |
| **Seeder/Factories** | `src/Database/{Seeder,SeederManager,Factories}/` | Standard pattern |
| **Auth** | `src/Auth/` | `AuthManager`, `JWT` (HS256, JTI blacklist, refresh tokens hashed in DB), `ApiKey`, `Gate` (RBAC + policy), `Policy` (abstract) |
| **RBAC** | `database/migrations/...create_rbac_tables.php` + `src/Auth/Traits/HasRoles.php` | 4 tables: `roles`, `permissions`, `role_permissions`, `user_roles` |
| **Security** | `src/Security/` | `Crypt` (AES-256-CBC, static key, no AEAD), `PasswordStrength` |
| **CSRF** | `app/Http/Middleware/VerifyCsrfToken.php` + `Session::token()` | Not a class — middleware-only |
| **Sessions** | `src/Http/Session.php` | Static facade over `$_SESSION`; only `get/set/has/remove/token/regenerateToken` |
| **Validation** | `src/Core/Validator.php` | ~40 rules (required, email, unique, exists, regex, between, etc.) |
| **View engine** | `src/View/{Engine,Compiler,DirectiveRegistry}.php` + `src/Tokenizer/` | **Blade-compatible** — `@if/@foreach/@yield/@extends/@section/@csrf/@vite` |
| **Plugins** | `src/Core/{Plugin,PluginManager,PluginManifest,PluginSandbox}.php` + `plugins/` | Manifest-driven, permission-declared, sandboxed registration |
| **Modules** | `app/Modules/*/routes.php` | Self-contained feature bundles |
| **CLI** | `bin/nemesis` | ~75 commands: make:*, migrate, db:*, route:*, cache:*, plugin:*, ip:*, etc. |
| **Search** | `src/Search/` | `Searchable` trait + drivers (Null, Database, MeiliSearch) |
| **Notifications** | `src/Notifications/` | Multi-channel, `Notifiable` trait |
| **Queue** | `src/Queue/` | Job queue with driver pattern |
| **Tenancy** | `src/Tenancy/` | Multi-tenant resolver + scope |
| **WebSockets/Broadcasting** | `src/Broadcasting/` | Channel manager, SSE, WS server |
| **GraphQL** | `src/GraphQL/` | `GraphQLServer` |
| **Caching** | `src/Core/Cache.php` | With `src/Core/Cache/` drivers |
| **Pagination** | `src/Core/Paginator.php` | `paginate($perPage, $page)` |
| **Frontend integration** | `src/Frontend/FrontendManager.php` + middleware | React/Vue/Alpine/Ghost/server-rendered |
| **i18n** | `src/I18n/` | Language loader, Translator |
| **Events** | `src/Events/` | `Event` + `EventDispatcher` |
| **Hooks** | `src/Hooks/HookDispatcher.php` | CMS-style hooks/filters |
| **CMS** | `src/CMS/` | Content types, menus, taxonomies, meta |
| **Admin** | `src/Admin/` | Admin panel builder |
| **Media** | `src/Media/` | Library, attachments, image processor, PDF, spreadsheet |
| **E-commerce** | `src/Cart/`, `src/Catalog/`, `src/Orders/`, `src/Payment/`, `src/Inventory/` | Full commerce stack |
| **Telemetry** | `src/Telemetry/` | (empty placeholder) |
| **Testing** | `src/Testing/` | `TestCase`, `HttpTestClient`, `Fakes/{EventFake,QueueFake,MailFake}` |
| **Docs** | `docs/` (52 markdown files) | Installation, Routing, ORM, Auth, Plugins, Modules, Tenancy, etc. |

---

## 4. Composer / autoload

**Package Name:** `jarir/nemesis-framework`

**PSR-4 Autoload:**
| Namespace | Directory |
|---|---|
| `Nemesis\` | `src/` |
| `Nemesis\Contracts\` | `src/Contracts/` |
| `Nemesis\Exceptions\` | `src/Exceptions/` |
| `Nemesis\Attributes\` | `src/Attributes/` |
| `App\` | `app/` |

**Files autoloaded on every request:** `src/Helpers/Helpers.php`

**Composer Bin:** `bin/nemesis`

**External dependencies (non-author):**
- `phpmailer/phpmailer` ^6.8 — email
- `league/flysystem` ^3.31 — filesystem abstraction
- `league/flysystem-aws-s3-v3` ^3.31 — S3 storage driver
- `aws/aws-sdk-php` ^3.372.0 — AWS services
- `zircote/swagger-php` ^6.0 — OpenAPI generation

**First-party `jarir-ahmed/*` packages (20):**
- `auth-token-maker`, `cache`, `data-encryption-utility`, `file`, `form-generator`, `hash-helper`, `http-response`, `message-broker`, `notification-system`, `password-generator`, `php-llm`, `registration-data-checker`, `search`, `server-stats`, `time-helper`, `uncensored-search`, `universal-cors`, `universal-spa`, `user-info-capture`, `auth-microservice`

**Post-create-project scripts:**
1. Copy `.env.example` → `.env` if missing
2. Run `php bin/nemesis key:generate` for `APP_KEY`
3. Print "ready" message

---

## 5. Routing system (Router.php — 890 lines, single class)

**No separate `Route` class** — routes stored as associative arrays in `Router::$routes`.

**Route registration methods:**
```php
public function add(string $method, string $uri, mixed $action, array $middleware = []): static
public function get/post/put/patch/delete/options(string $uri, mixed $action): static
// Note: get/post/etc. do NOT accept middleware; use add() or group()
```

**Internal route array shape:**
```php
[
    'method'      => 'GET',
    'uri'         => '/product/{id}',
    'action'      => [ProductController::class, 'view'],
    'middleware'  => ['web'],
    'name'        => 'product.view',
    'constraints' => ['id' => '\d+'],
    'domain'      => null,
    'meta'        => ['framework' => 'react', 'layout' => 'layouts.app'],
]
```

**URL pattern compilation (buildRoutePattern):**
1. Custom constraints first — `{param}` → `(?P<param>REGEX)`
2. Optional `{param?}` → `(?P<param>[^/]*)`
3. Required `{param}` → `(?P<param>[^/]+)`
4. Anchored: `#^...$#`

**Matching (findMatchingRoute + evaluateRoute):**
1. Domain regex (if set)
2. Method match (or `ANY`)
3. URI regex match — named captures become route params

**Group syntax:**
```php
$router->group(['prefix' => 'api', 'middleware' => 'web'], function(Router $r) {
    // routes here inherit prefix + middleware
});
```
Attributes: `prefix`, `middleware`, `domain`, `framework`, `layout`.

**Frontend groups (specialized):**
```php
$router->frontendGroup('react', 'layouts.app', function(Router $r) {
    // routes get framework=react + layout=layouts.app metadata
}, ['middleware' => 'web']);
```

**Named routes:**
```php
$router->add('GET', '/products/{id}', [...])->name('product.show');
route('product.show', ['id' => 5]); // global helper
```

**Constraints (fluent):**
```php
$router->add('GET', '/throttle-test', ...)->where('fallback', '.*');
```

**Route model binding (two flavors):**
- **Static (global):** `RouteModelBinder::bind('user', fn($v) => User::find($v))`
- **Instance:** `$router->bind('user', fn($v) => User::find($v))`

**PHP 8 attribute-based routing:**
```php
#[Route('GET', '/products/{id}', name: 'product.show', middleware: ['auth'])]
public function show(Request $request, string $id): Response { ... }
$router->scanAttributes(ProductController::class);
```

**Fallback:**
```php
$router->fallback(fn() => response('404'));
```

**Dispatch flow:**
1. Strip query string
2. Find matching route (skip fallbacks)
3. Set route metadata on Request
4. Resolve model binders (static first, then instance)
5. Merge global + route middleware, resolve aliases through Kernel
6. Run Pipeline: `$request → through($middleware) → then(...)`
7. No match → try fallback → 404

**Route cache:**
```php
$router->warmCache() / cache() / static clearCache()
```
Cache file: `storage/framework/routes.php` (closures prevent caching).

**Diagnostics/export:** `routeSummary()`, `diagnostics()`, `matchDiagnostics()`, `exportRoutes($path, $format='json|php|yaml')`

---

## 6. Middleware system

**Contract:** `Nemesis\Contracts\MiddlewareInterface`
```php
public function handle(Request $request, callable $next): Response;
```

**Pipeline** (`src/Http/Pipeline.php`):
- `send($request)`, `through($middleware)`, `then(Closure $destination): Response`
- `terminate($request, $response)` — calls `terminate()` on any pipe that has one
- Built via `array_reduce` on reversed middleware array
- Pipes can be: string class name, callable, or object with `handle()`

**Kernel** (`app/Http/Kernel.php`) — three arrays:
- `$middleware` (global): every request
- `$middlewareGroups`: `web`, `api` (referenced by string)
- `$routeMiddleware` (aliases): `auth`, `throttle`, `csrf`, `session`, `api.key`, `cors`, `security`, `api.version`, `debugbar`, `framework`, `ip`

**Middleware resolution (Router::resolveMiddleware):**
1. Match group name → recursively expand
2. Parse `alias:arg1,arg2` syntax
3. Look up alias in Kernel
4. Create closure: `fn($req, $next) => (new $class())->handle($req, $next, ...$args)`
5. Non-string pass-through

**Built-in middleware inventory (all in `app/Http/Middleware/`):**
| Alias | Class | Purpose |
|---|---|---|
| (global) | `CheckForMaintenanceMode` | 503 if `storage/framework/down` exists |
| (global/web) | `StartSession` | Starts PHP session; terminable (flushes in `terminate()`) |
| (global/web) | `VerifyCsrfToken` | CSRF check on non-GET/HEAD/OPTIONS; supports `_token` and `X-CSRF-Token`; `$except` array with `*` wildcards; 419 on mismatch |
| `auth` | `Authenticate` | JWT Bearer validation; optional role guard `auth:admin` |
| `api.key` | `ApiKeyAuthenticate` | `X-Api-Key` header; optional scope `api.key:write` |
| `throttle` | `ThrottleRequests` | Per-IP + per-URI rate limit via Cache; `throttle:60,1` |
| `cors` | `CorsMiddleware` | CORS headers + OPTIONS preflight; configurable |
| `security` | `SecurityHeadersMiddleware` | X-Content-Type-Options, X-Frame-Options, X-XSS, CSP, HSTS, Referrer-Policy, Permissions-Policy |
| `api.version` | `ApiVersionMiddleware` | Version from URL or `X-Api-Version` header; default `v1` |
| `debugbar` | `DebugBarMiddleware` | Injects debug bar (timing/memory/queries) into HTML |
| `framework` | `FrontendFrameworkMiddleware` | Sets active frontend; terminable |
| `ip` | `IpAccessMiddleware` | IP allow/block via `config/ip.php` (CIDR + wildcards) |

**Middleware pattern (uniform):**
```php
class FooMiddleware implements MiddlewareInterface {
    public function handle(Request $request, callable $next, ...$extraArgs): Response {
        // Before: short-circuit return Response::json([...], 4xx) OR
        $response = $next($request);
        // After: modify $response
        return $response;
    }
}
```

---

## 7. Controllers

**Base class:** `src/Core/Controller.php`
```php
namespace Nemesis\Core;

class Controller {
    protected $container;  // DI container
    public function __construct() { $this->container = \Nemesis\Core\Container::getInstance(); }
    protected function authorize($ability, $arguments = []) { /* Gate::allows() + 403 */ }
    protected function render($view, $data = []) { \Nemesis\Core\View::render($view, $data); }
    protected function passwordProtectedDelete(Request $request, string $modelClass, int $companyId, int $id): mixed { ... }
}
```

**Controller locations:**
- `app/Controllers/` — main app controllers (9 shipped: Applications, Category, Email, Frontend, OpenApi, Product, Tag, Test, User)
- `app/Modules/{ModuleName}/Controllers/` — module controllers (e.g. `app/Modules/Blog/Controllers/BlogController.php`)

**Convention:** Controllers extend `Nemesis\Core\Controller`. No abstract action contract — methods are free-form. Methods receive `Request` first, then route parameters.

**Router's `callAction()` (line 822):**
- For `'Controller@method'` strings → split on `@`
- For `[Controller::class, 'method']` arrays → resolve class via DI Container
- Closures called directly

**Example real route definitions (from `routes/route.php`):**
```php
$router->frontendGroup('react', 'layouts.app', function (Router $router) use ($frontendController): void {
    $router->add('GET', '/login', [$frontendController, 'login'], ['web'])->name('login.page');
    $router->add('GET', '/profile', [$frontendController, 'profile'], ['web'])->name('profile.page');
}, ['middleware' => 'web']);

$router->add('DELETE', '/email/{id}', [$emailController, 'delete']);
$router->add('GET', '/product/{id}', [$productController, 'view']);
$router->add('GET', '/test', function () { echo 'Test route hit'; });
$router->add('POST', '/login', [$userController, 'login'], ['web'])->name('login.submit');
$router->get('/_health', [\Nemesis\Http\HealthCheck::class, 'handle'])->name('health');
```

---

## 8. ORM & Database

### 8.1 Two model styles coexist ⚠️

This is a **non-obvious gotcha**:
- **Modern (advertised AR):** `Nemesis\Core\Model` — `extends Model`, get AR methods
- **Legacy/current scaffolder output:** `Nemesis\Core\Fluent` — raw query builder

**When building new things, prefer the `Model` AR style.** Cleanest references: `app/Models/Post.php`, `Tag.php`, `Comment.php`, `UserModel.php`.

### 8.2 Model base class API (`src/Core/Model.php`)

**Static query/persistence (lines 141–236):**
```php
public static function query(): Builder
public static function find(mixed $id): ?static
public static function findOrFail(mixed $id): static  // throws NotFoundException
public static function all(): Collection
public static function where(string $col, mixed $op, mixed $val = null): Builder
public static function whereNull/whereNotNull/whereIn(string, array): Builder
public static function latest(string $col='created_at'): Builder
public static function oldest(string $col='created_at'): Builder
public static function create(array $attributes = []): Model
```

**Instance methods:**
```php
protected $table; protected $primaryKey='id'; protected ?string $connection=null;
protected $fillable=[]; protected $guarded=['*'];
protected $attributes=[]; protected $relations=[];
public $exists = false;

public function getTable()/setTable($t)
public function getKey()/getKeyName()/getAttributes()/getOriginal()
public function save(array $options=[]): bool       // fires saving/creating|updating/created|updated/saved
public function update(array $attributes=[]): bool
public function delete(): bool                      // fires deleting/deleted
public function fill(array $attributes): static; setAttribute($k, $v)
public function syncOriginal(); getChanges()
public function toArray(): array; toJson(int $flags=0): string; jsonSerialize(): mixed
public function setConnection(?string $c); getConnectionName(): ?string
public static function addGlobalScope($scope, $impl=null)
public static function observe($class)
// event registerers: creating/created/updating/updated/deleting/deleted/saving/saved(callable)
```

**Relationship factory methods (protected, lines 355–395):**
```php
$this->hasOne($related, $foreignKey=null, $localKey='id')
$this->hasMany($related, $foreignKey=null, $localKey='id')
$this->belongsTo($related, $foreignKey=null, $ownerKey='id')
$this->belongsToMany($related, $table=null, $foreignPivotKey=null, $relatedPivotKey=null)
```
Each returns a relation object with `get()` (and `attach()/detach()` on BelongsToMany).

**Wiring:** `Model::query()` creates `new Builder($instance)`. `Builder` wraps `Fluent` and hydrates raw rows into `new static($row)` with `->exists = true`. Static calls fall through to `Builder` via `__callStatic` (Model.php:448).

### 8.3 Database connection (`src/Core/Database.php`)

Static, multi-driver (mysql/pgsql/sqlite), PDO-based with connection pool.

```php
connect(?array $config, ?string $connection): PDO
connection(?string $connection): PDO     // lazy-connect, cached in $pdoPool
configure(array $config, ?string $defaultConnection=null)  // pool shape or single
view($sql, $params)     // SELECT → assoc arrays
create/update/delete/statement
unprepared($sql)
// ACID transactions:
beginTransaction() / commit() / rollback() / transaction(callable)
// Query logging:
enableQueryLog() / getQueryLog() / flushQueryLog()
// Grammar (driver-aware):
getGrammar(): MySqlGrammar | PostgresGrammar | SQLiteGrammar
// Entry to query builder:
Database::table($table): Fluent
```

### 8.4 Query builder (`src/Core/Fluent.php`)

PDO-parameterized SQL builder, **raw** (returns assoc arrays, not models):
```php
Fluent::table(string $table, ?string $connection=null): static
// WHERE: where, orWhere, whereNull/whereNotNull, whereIn/whereNotIn,
//        whereBetween/whereNotBetween, whereLike/whereNotLike/orWhereLike/orWhereNotLike, whereNested
// JOINs: join, leftJoin, rightJoin
// ORDER/GROUP/HAVING: orderBy, latest, oldest, groupBy, having
// READ: get(): Collection, first(), find($id), all(), count/max/min/sum/avg
// WRITE: insert(array): int|string (lastInsertId), update(array), delete()
// Pagination: paginate($perPage=15, $page=null): Paginator
// limit, offset
```

### 8.5 Model-facing Builder (`src/Core/Builder.php`)

Wraps `Fluent`, returns **hydrated Models**:
```php
search(), when(), filter(), sort(), paginate(), with()  // with() is currently a stub — no real eager loading
```

### 8.6 Migrations & schema

**Migration base:** `src/Database/Migration.php` — `abstract class Migration { abstract up(); abstract down(); }`

**MigrationManager** — tracks applied files in `migrations` table (driver-aware DDL: SQLite vs MySQL). Class name derived from filename by stripping `Y_m_d_His_` prefix and PascalCasing. Methods: `migrate()`, `rollback()`.

**Seeder / SeederManager** — `seed()`, `runSeeder()`.

**Schema DSL** (`src/Database/Schema.php`):
```php
Schema::create/table/drop/dropIfExists/rename/hasTable/hasColumn/raw
```

**Blueprint column types** (`src/Database/Blueprint.php`):
```php
id, integer, bigInteger, string, text, json, timestamp, boolean, ...
// Chainable: ->nullable(), ->unique(), ->default(), ->index(), ->unsigned()
// Plus: timestamps(), softDeletes(), foreign()->references()->on()->cascadeOnDelete()
// Alter: dropColumn, renameColumn, ...
```

**Grammars** — `src/Database/Grammars/GrammarInterface.php` + impls for MySQL, Postgres, SQLite.

**Existing migrations** in `database/migrations/`: users, jobs, rbac, categorys, tags (+ plugin migrations under `plugins/*/migrations/`).

### 8.7 Concrete model example (cleanest reference)

```php
// app/Models/Post.php
namespace App\Models;
use Nemesis\Core\Model;

class Post extends Model {
    protected $table = 'posts';
    protected $fillable = ['title', 'body', 'user_id'];

    public function comments() { return $this->hasMany(Comment::class, 'post_id', 'id'); }
    public function author()   { return $this->belongsTo(UserModel::class, 'user_id', 'id'); }
    public function tags()     { return $this->belongsToMany(Tag::class, 'post_tag', 'post_id', 'tag_id'); }
}
```

**Usage idioms:**
```php
(new Product)->all();                    // Collection of Models
(new Product)->find($id);                // Model or null
Product::create($request->all());        // Model::create
$post->comments;                         // lazy load via __get, cached in $relations
$post->save();
$post->delete();
```

### 8.8 Supporting traits

- `src/Core/Traits/SoftDeletes.php` — `delete()` sets `deleted_at`, `forceDelete()`, `restore()`, `withTrashed()/onlyTrashed()`, `trashed()`; boots global scope filtering `deleted_at IS NULL`
- `src/Core/Traits/HasRevisions.php` — per-save revisions into `nemesis_revisions` with in-memory fallback
- `src/Notifications/Notifiable.php` — notification recipient trait
- `src/Activity/Activity.php` (RecordsActivity) — activity log trait
- `src/Auth/Traits/Socialable.php` — social auth
- `src/Auth/Traits/HasRoles.php` — `roles()`, `permissions()`, `hasRole($slug)`, `hasPermission($slug)`

### 8.9 Factories

`src/Database/Factories/Factory.php` — abstract `definition()`, `count()`, `state()`, `make()`, `create()` (persists via `Database::table(...)->insert(...)` then `model::find`), static `new()`.
Concrete: `app/Database/Factories/UserModelFactory.php`.

### 8.10 Search layer (`src/Search/`)

Not the ORM — full-text search abstraction:
- `Searchable` trait (attach to a Model): exposes `searchIndex()`, `searchRemove()`, `static search($term): SearchQuery`, `flushSearchIndex()`, overridable `toSearchArray()`
- `SearchEngine` — facade `search/query/index/remove/flush`, driver selection (`setDriver('database'|'meilisearch'|'null')`)
- `SearchQuery` — fluent `->in([Model::class])->limit(n)->where(field, val)->get()/first()/count()`
- `SearchDriverInterface` + `Drivers/{NullDriver,DatabaseDriver,MeiliSearchDriver}`
- Hooked into Model lifecycle via `bootSearchable()` → `saved → searchIndex()`, `deleted → searchRemove()`

---

## 9. Authentication & RBAC

### 9.1 Authentication flow

`AuthManager::attempt(array $credentials, array $extraPayload = []): ?array` (`AuthManager.php:33`):
1. Pulls `email`/`username` + `password`
2. Queries `users` table (raw SQL via `Database::view`), `password_verify()`s bcrypt
3. On success: builds JWT payload `['sub' => id, 'email', 'role']`
4. Returns `JWT::issueTokenPair($payload)` → `{access, refresh, expires_in, token_type}`

`AuthManager::user(Request): ?array`:
1. Bearer JWT via `JWT::verify`, OR
2. `X-Api-Key` header via `ApiKey::verify`
3. Memoized in static `$resolvedUser`

`JWT` (`src/Auth/JWT.php`):
- **HS256** (`hash_hmac('sha256', ...)`), secret from `JWT_SECRET` / `APP_KEY` (min 32 chars)
- Claims: `iat`, `exp`, `jti`
- **DB-backed blacklist** (`jwt_blacklist`, keyed by JTI)
- **Refresh tokens hashed in DB** (`jwt_refresh_tokens`, `hash('sha256', $refresh)`) — never plaintext

**Route-guard middleware** (`Authenticate.php`):
```php
$a->middleware('auth');         // any valid JWT
$a->middleware('auth:admin');   // JWT role claim must == 'admin'
```
Attaches payload to `$request->setMeta('auth', $payload)`.

### 9.2 RBAC — three overlapping mechanisms

**1. DB role/permission tables** (from `create_rbac_tables` migration):
- `roles`, `permissions`, `role_permissions`, `user_roles`
- Enforced via `HasRoles` trait on the user model
- `roles()`, `permissions()`, `hasRole($slug)`, `hasPermission($permissionSlug)`

**2. `Gate` policy/ability registry** (`src/Auth/Gate.php`) — static, Laravel-style:
```php
Gate::define($ability, $callback);     // register ability check
Gate::policy($class, $policy);         // bind policy to model class
Gate::allows($ability, ...$args);      // resolves: direct ability → policy → RBAC fallback (if $args[0] has hasPermission())
Gate::checkAcl(Request, array $acl);   // session-based ACL using user_type/user_level
```
**Controller helper:** `Controller::authorize($ability, $arguments)` aborts with 403 if `Gate::allows()` is false.

**3. JWT `role` claim** — `auth:role` inline guard in `Authenticate` middleware.

**Example policy** (`app/Policies/PostPolicy.php`) extends abstract `Nemesis\Auth\Policy`, defines `view()` / `update($user, $model)`.

---

## 10. Plugin system

### 10.1 Files

| Class | Path |
|---|---|
| `Plugin` (facade) | `src/Core/Plugin.php` |
| `PluginManager` | `src/Core/PluginManager.php` |
| `PluginManifest` | `src/Core/PluginManifest.php` |
| `PluginSandbox` | `src/Core/PluginSandbox.php` |
| Real plugins | `plugins/{Audit,CloudStorage,DebugBar,IdeHelper,Swagger,TestPlugin}/` |

### 10.2 Plugin structure

A plugin is a self-contained directory under `plugins/`:
- **`plugin.json`** — manifest. Required: `name`, `version` (semver), `entry` (usually `bootstrap.php`). Optional: `permissions`, `provides`, `tags`, `conflicts`, `autoload` (PSR-4), `requires` (php version)
- **`bootstrap.php`** — executed by sandbox; registers routes/hooks/middleware
- Optional: `src/`, `views/`, `migrations/`, `commands/`, `README.md`

### 10.3 Discovery & lifecycle

`PluginManager::discover()`:
1. Globs `plugins/*`
2. Reads each `plugin.json` into a `PluginManifest`
3. Validates
4. **Only bootstraps plugins in the persisted active list** (`storage/plugins.json`)
5. `PluginManager::enable()/disable()` mutates that state file

`bootstrap()`:
1. Conflict detection (aborts if `conflicts` plugin is active)
2. `checkCompatibility()` — PHP version
3. Registers a Composer PSR-4 autoloader
4. Creates a `PluginSandbox`
5. Runs bootstrap in sandbox
6. Auto-discovers CLI commands in `Commands/` dir
7. Fires `plugin.loaded` hook

### 10.4 The "sandboxed sidecar" architecture

`PluginSandbox` is a **thin security wrapper** (not OS isolation):
- `run(callable)` invokes callback inside `setupSandbox()`/`teardownSandbox()` try/finally
- **Declared permission model** — sandbox is configured with plugin's declared `permissions` from manifest
- Enforces via `hasPermission()`, `requirePermission()`, `checkFileAccess()` (prevents paths escaping `base_path()`), `checkDatabaseAccess()`, `checkNetworkAccess()`

⚠️ **TODO in code:** "In production, this would use PHP's stream wrappers and error handlers" — currently soft, not OS-isolated.

### 10.5 Concrete example — Audit plugin

```
plugins/Audit/
├── plugin.json
├── bootstrap.php
├── src/Controllers/AuditController.php
├── src/Models/Audit.php
├── src/Traits/AuditTrait.php
├── views/index.php, show.php
└── migrations/…_create_audits_table.php
```

`plugin.json`:
```json
{
    "name": "audit",
    "version": "1.0.0",
    "entry": "bootstrap.php",
    "autoload": { "psr-4": { "Nemesis\\Plugins\\Audit\\": "src/" } },
    "permissions": ["routes", "middleware", "events"]
}
```

`bootstrap.php`:
```php
Plugin::register('audit', function ($plugin) {
    \Nemesis\Core\View::addNamespace('audit', __DIR__ . '/views');
    $plugin->route('audit', function () {
        $router = \Nemesis\Core\Container::getInstance()->make(\Nemesis\Router\Router::class);
        $router->add('GET', '/audit', [AuditController::class, 'index']);
        $router->add('GET', '/audit/{id}', [AuditController::class, 'show']);
    });
});
```

Controller extends `Nemesis\Core\Controller`, renders `audit::index` / `audit::show`.

**`Plugin` facade** (`src/Core/Plugin.php`): `register($name, $callback)`, `hook($event, $callback)`, `fire($event, ...$args)`; instance methods `middleware()`, `route()`, `command()`; static getters.

---

## 11. Security — CSRF, HMAC, Encryption

### 11.1 CSRF (no dedicated class)

- **Token generation:** `Session::token()` → `bin2hex(random_bytes(32))`, stored in `$_SESSION['_token']`; global helper `csrf_token()`
- **Verification:** `app/Http/Middleware/VerifyCsrfToken.php`
  - Skips safe methods (HEAD/GET/OPTIONS via `isReading()`)
  - Skips URIs in configurable `$except` (supports `*` wildcard suffix)
  - Compares `$_POST['_token']` / `X-CSRF-TOKEN` header against `Session::token()` via `hash_equals()`
  - Returns **419 JSON** on mismatch
- **Form helper:** `@csrf` directive compiled in `src/View/Compiler.php:138`
- Registered globally in `app/Http/Kernel.php` (also in `web` group, aliased `csrf`)

### 11.2 HMAC

- **Primary/structural use:** `JWT::sign()` → `hash_hmac('sha256', $data, $secret, true)` (`src/Auth/JWT.php:270`)
- **Generic utility:** `Nemesis\Support\Codec::hmac($data, $key, $algo='sha256')` — `hash_hmac` wrapper alongside base32/58/85, md4/md5/sha1/sha2, ntlm, lanman, tiger, skein helpers
- Also referenced in `Totp.php`, `URL.php`, `StripeDriver.php`, `WebSocketServer.php`

### 11.3 Encryption

`Nemesis\Security\Crypt` (`src/Security/Crypt.php`) — **AES-256-CBC** with static key:
- `Crypt::setKey($key)`, `Crypt::encrypt($value)` → base64(`ciphertext :: iv`)
- `Crypt::decrypt($payload)`
- Static singleton-style key; no key rotation, no AEAD (no HMAC in payload)

⚠️ Crypt and JWT operate independently — JWT signs its own payloads but `Crypt` does not add authentication to its ciphertext.

**Related:** `Nemesis\Security\PasswordStrength` — scores passwords 0–100 (`score()`, `label()`, `suggestions()`, `check()`).

---

## 12. Sessions

| Class | Path |
|---|---|
| `Nemesis\Http\Session` (real impl) | `src/Http/Session.php` |
| `StartSession` middleware | `app/Http/Middleware/StartSession.php` |
| `SessionConfig` (typed DTO) | `src/Config/SessionConfig.php` |
| `config/session.php` | runtime config |

`Session` is a static facade over native `$_SESSION`:
- Constructor ensures one `session_start()` if not already active
- `get/set/has/remove`
- `token()` / `regenerateToken()` for CSRF

`StartSession` (global + in `web` group) — instantiates `Session` in `handle()`, calls `session_write_close()` in `terminate()` (invoked by `Http\Pipeline::terminate()`).

`SessionConfig` — `readonly class`, fields: `driver`, `lifetime`, `cookieName`, `secure`, `sameSite` (from `SESSION_*` env).

⚠️ **Known gap:** `Gate::checkAcl()`, `flash()`, `old()`, `getOldInput()` helpers call `Session::all()`, `flash()`, `getOldInput()` — **these methods don't exist in `Session.php`** (only `get, set, has, remove, token, regenerateToken`). Will fatal if hit.

---

## 13. Validation (`src/Core/Validator.php`)

```php
$v = new \Nemesis\Core\Validator();
$v->validate(array $data, array $rules): bool
$v->passes() / fails()
$v->setMessages(array $messages)  // keyed "{field}.{rule}"
$v->errors()
```

**Rules** (`applyRule()` switch, ~40 rules): pipe-delimited strings or arrays, `:` for params, `,` for multi-args.

**Coverage:** `sometimes, present, nullable, required, filled, string, integer, numeric, boolean, array, email, url, alpha, alpha_num, accepted, accepted_if, in, not_in, same, different, required_if/unless/with/with_all/without/without_all, date, before, after, digits, digits_between, uuid, min, max, between, regex, array_keys/required_array_keys, present_if/unless, prohibited(_if/_unless), prohibits, confirmed, unique, exists`.

`unique` and `exists` run DB lookups against the `users` table pattern via `\Nemesis\Core\Database::view`. Also `Nemesis\Support\FileValidator` for file-type checks.

```php
$v->validate($_POST, [
    'email'    => 'required|email',
    'password' => 'required|min:8|confirmed',
]);
```

**ValidationException:** `src/Core/ValidationException.php`

---

## 14. Views / Templating — Blade-compatible

### 14.1 Files

| Class | Path |
|---|---|
| `Engine` | `src/View/Engine.php` |
| `Compiler` | `src/View/Compiler.php` |
| `Lexer` / `Token` / `TokenType` | `src/Tokenizer/` |
| `DirectiveRegistry` | `src/View/DirectiveRegistry.php` |
| `View` facade | `src/Core/View.php` |

### 14.2 Engine (NOT plain PHP)

`Engine::getInstance()` — singleton.
- `findView($view)` — resolves **dot notation** (`admin.dashboard`) and **namespaced** (`audit::index`), searches `.blade.php` then `.php`, across frontend paths → registered `$paths` → legacy `app/Views/`
- `compile($viewPath)` — md5-hash cache in `storage/views/`, invalidated by mtime
- `render($view, $data)` — executes compiled PHP in **isolated scope** (`extract($__data, EXTR_SKIP)`), exposes `$__engine`, `$__data`, plus extracted keys
- **Layout inheritance:** child runs first, sections captured, then `@extends`'d parent renders with `@yield`

**Section helpers:** `startSection/endSection/setSection/yieldSection/hasSection/yieldParentSection/setLayout`, plus `resetState()` for tests.

`Core\View` is a thin static facade: `render()` (echoes), `make()` (returns string), `exists()`, `addNamespace()`, `addPath()`. Global `view()` helper wraps it (`Helpers.php:166`).

### 14.3 Syntax (Blade-compatible)

**Echo:** `{{ $expr }}` → `htmlspecialchars(..., ENT_QUOTES)`; `{!! $expr !!}` → raw; `{{-- --}}` comments stripped.

**Control:** `@if/@elseif/@else/@endif`, `@unless/@endunless`

**Loops:** `@foreach/@endforeach`, `@for/@endfor`, `@while/@endwhile`, `@break`, `@continue`

**Layout:** `@extends`, `@section`, `@endsection`, `@stop`, `@show`, `@yield`, `@parent`, `@hasSection`

**Includes:** `@include`, `@includeIf`

**Forms:** `@csrf` (emits hidden `_token` input via `csrf_token()`), `@method`

**Assets:** `@vite`, `@asset`

**PHP:** `@php`/`@endphp`

**Misc:** `@empty`, `@isset`, `@dump`, `@dd`

**Custom directives:** `DirectiveRegistry::register('name', fn($args) => phpSnippet)` — custom take priority. Example: `@datetime($ts)`.

### 14.4 Concrete example

`views/layouts/app.blade.php`:
```blade
<html>
<head><title>{{ $title ?? 'Nemesis' }}</title></head>
<body>
@if(!empty($canSeeAdmin))
    <a href="{{ route('admin.dashboard') }}">Admin</a>
@endif
@yield('content')

<form method="POST" action="/logout">@csrf<button>Logout</button></form>
</body>
</html>
```

⚠️ `views/errors/*.php` are **plain-PHP views** (e.g. `404.php` uses `<?= htmlspecialchars($message) ?>`). Both `.blade.php` and `.php` coexist — engine treats `.php` as raw pass-through (lexer leaves them untouched).

---

## 15. Configuration files

| File | Purpose |
|---|---|
| `config.php` | **Master config** — database (driver, host, port, dbname, credentials); SQLite default; MySQL/PostgreSQL; multi-connection (`default`, `analytics`) |
| `app.php` | app name, env, debug, URL, timezone |
| `api.php` | API versioning, response format defaults |
| `assets.php` | Vite/Webpack paths, HMR settings |
| `cache.php` | Cache driver, file/Redis |
| `cors.php` | CORS rules, allowed origins |
| `ecommerce.php` | payment gateways, catalog, cart, inventory, orders |
| `filesystems.php` | Storage disks (local, S3) for Flysystem |
| `frontend.php` | Frontend framework config (React, Vue, Alpine, Ghost, server-rendered) |
| `ip.php` | `allow_all`, `allow`, `block`, `trusted_proxies` (CIDR + wildcards) |
| `logging.php` | Log channels and levels |
| `mail.php` | SMTP/PHPMailer settings |
| `media.php` | Image processing, allowed types, storage paths |
| `notifications.php` | Notification channels and defaults |
| `queue.php` | Queue driver, retry limits, failed job handling |
| `search.php` | Search engine (MeiliSearch, etc.) |
| `session.php` | Session driver, lifetime, cookie settings |
| `social.php` | OAuth provider credentials (Google, GitHub, etc.) |
| `tenancy.php` | Multi-tenancy resolution, domain mapping |

---

## 16. CLI — `bin/nemesis` (~75+ commands)

| Category | Commands |
|---|---|
| **Scaffolding (make:\*)** | `make:controller`, `make:model`, `make:middleware`, `make:migration`, `make:seeder`, `make:job`, `make:policy`, `make:event`, `make:listener`, `make:trait`, `make:repository`, `make:entity`, `make:dto`, `make:transformer`, `make:manager`, `make:handler`, `make:interface`, `make:factory`, `make:filter`, `make:widget`, `make:library`, `make:helper`, `make:view`, `make:layout`, `make:admin-view`, `make:profile-view`, `make:settings-view`, `make:frontend-component`, `make:admin-component`, `make:profile-component`, `make:settings-component`, `make:plugin`, `make:module`, `make:resource` |
| **Auth scaffolding** | `make:auth`, `make:social-auth` |
| **Database** | `migrate:run`, `migrate:rollback`, `db:seed`, `db:dump`, `db:truncate`, `db:restore`, `db:list-connections`, `model:health` |
| **Routing** | `route:cache`, `route:clear`, `route:list`, `route:export`, `route:diagnose` |
| **Caching** | `cache:clear`, `config:cache`, `view:clear` (also `configs cache clear`, `views cache clear`, `all cache clear`) |
| **API** | `api:format`, `api:format:examples`, `api:probe`, `api:docs` |
| **Environment** | `env:doctor`, `env`, `key:generate`, `auth:rotate` |
| **Server** | `serve`, `down`, `up`, `debug:on`, `debug:off` |
| **Queue/Schedule** | `schedule:run`, `schedule:list`, `queue:work` |
| **WebSocket** | `websocket:start`, `websocket:serve` |
| **Plugins** | `plugin:list`, `plugin:enable`, `plugin:disable`, `plugin:create` |
| **Frontend** | `frontend:list` |
| **Storage** | `storage:link` |
| **Documentation** | `docs:sync` |
| **Data** | `data:sync` |
| **IP Access** | `ip:list`, `ip:allow`, `ip:block`, `ip:unallow`, `ip:unblock`, `ip:reset` |
| **Code Quality** | `deadcode:find`, `syntax:check`, `optimize` |
| **App** | `app:mirror`, `tinker`, `test` |
| **Examples** | `examples:list` |
| **Vendor** | `vendor:compress` (safe vendor tree reduction — dry run, report, archive, restore) |

**Root `nemesis`** is a one-liner: `require __DIR__ . '/bin/nemesis'`. So `php nemesis` and `php bin/nemesis` are equivalent.

---

## 17. Routes — file structure

| File | Purpose |
|---|---|
| `route.php` | **Main/legacy** — loaded by both front controllers. Instantiates `Router`, loads module routes (`app/Modules/*/routes.php`), loads plugin routes, defines app routes. Uses `frontendGroup()` for React/Vue/server/Ghost/Alpine. Registers resource routes, test routes, `/_health` |
| `web.php` | Browser/session routes, `web` middleware group (session + CSRF). Currently commented-out examples |
| `api.php` | JSON API routes, `api` middleware group (throttle). Commented examples |
| `console.php` | CLI schedule definitions, run via `schedule:run` |
| `channels.php` | WebSocket channel auth for `Broadcaster` |

**Load order in root `index.php`:** only `route.php`
**Load order in `public/index.php`:** `route.php` → `web.php` → `api.php`

---

## 18. Documentation (`docs/`)

52 markdown files + 2 HTML viewers.

| Category | Files |
|---|---|
| **Getting Started** | `INSTALLATION.md`, `STRUCTURE.md`, `REQUIREMENTS.md`, `LEARNING_GUIDE.md` |
| **Architecture** | `FRAMEWORK_ANALYSIS.md`, `PLUGINS.md`, `MODULES.md`, `ROUTING.md`, `MIDDLEWARE.md`, `DEPENDENCY_INJECTION.md`, `CONTROLLERS.md` |
| **Database/ORM** | `DATABASE.md`, `DATABASE_SETUP.md`, `MODELS.md`, `RELATIONSHIPS.md`, `QUERY_BUILDER.md`, `MIGRATIONS.md`, `SEEDING.md`, `SCOPES.md` |
| **Security** | `SECURITY.md`, `AUTHENTICATION.md`, `AUTHORIZATION.md`, `CSRF.md`, `ENCRYPTION.md` |
| **Features** | `CMS.md`, `ADMIN.md`, `MEDIA.md`, `NOTIFICATIONS.md`, `SEARCH.md`, `ECOMMERCE.md`, `QUEUES.md`, `SCHEDULING.md`, `WEBSOCKETS.md`, `BROADCASTING.md`, `TENANCY.md`, `MULTI_TENANCY.md` |
| **API** | `API_STANDARDS.md`, `TEMPLATE_ENGINE.md`, `VALIDATION.md` |
| **CLI** | `CLI.md`, `CLI_COMMANDS.md` |
| **Plugins** | `PLUGIN_AUDIT.md`, `PLUGIN_CLOUD.md`, `PLUGIN_DEBUGBAR.md`, `PLUGIN_IDE.md`, `PLUGIN_SWAGGER.md` |
| **Testing** | `TESTING.md`, `TEST_SUMMARY.md` |
| **Misc** | `RELEASE.md`, `EXAMPLES.md`, `packages.md` |
| **HTML Viewers** | `index.html`, `viewer.html` — interactive doc browser |
| **Index** | `README.md` — doc hub |

---

## 19. Examples gallery (`examples/`) — 31 starters

Optional, copy-only, NOT autoloaded. Browsable via `php nemesis examples:list`.

| Category | Count | Examples |
|---|---|---|
| **MVC** | 8 | blog, dashboard, admin-panel, cms-blog, commerce-dashboard, ecommerce, landing-page, profile-center |
| **API** | 7 | users-api, content-api, analytics-api, auth-api, billing-api, cms-api, login-api |
| **Plugin** | 6 | audit-plugin, seo-plugin, auth-plugin, cache-plugin, cms-plugin, notifications-plugin |
| **Extension** | 4 | frontend-bridge, storage-adapter, payment-adapter, search-adapter |
| **Module** | 6 | blog-module, shop-module, academy-module, cms-module, ecommerce-module, forum-module |

---

## 20. Code idioms — how to write for Nemesis

**Route:**
```php
$router->add('GET', '/users/{id}', [UserController::class, 'show']);
$router->add('POST', '/login', [UserController::class, 'login'], ['web'])->name('login.submit');
```

**Controller:**
```php
class UserController extends \Nemesis\Core\Controller {
    public function show(Request $request, string $id): Response {
        $user = User::findOrFail($id);
        return Response::json($user->toArray());
    }
    public function login(Request $request): Response {
        $v = new \Nemesis\Core\Validator();
        if (!$v->validate($request->all(), ['email' => 'required|email', 'password' => 'required'])) {
            return Response::json(['errors' => $v->errors()], 422);
        }
        $token = \Nemesis\Auth\AuthManager::attempt($request->all());
        return Response::json($token);
    }
}
```

**Model (AR style — preferred):**
```php
class Post extends \Nemesis\Core\Model {
    protected $table = 'posts';
    protected $fillable = ['title', 'body', 'user_id'];
    public function comments() { return $this->hasMany(Comment::class); }
    public function author()   { return $this->belongsTo(UserModel::class, 'user_id', 'id'); }
    public function tags()     { return $this->belongsToMany(Tag::class, 'post_tag', 'post_id', 'tag_id'); }
}
```

**Migration:**
```php
class CreatePostsTable extends \Nemesis\Database\Migration {
    public function up() {
        \Nemesis\Database\Schema::create('posts', function (\Nemesis\Database\Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->text('body');
            $t->unsignedBigInteger('user_id');
            $t->timestamps();
            $t->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
    public function down() { \Nemesis\Database\Schema::drop('posts'); }
}
```

**View (Blade-compatible):**
```blade
@extends('layouts.app')
@section('content')
    @if($user)
        <h1>Hello, {{ $user->name }}</h1>
        @foreach($user->posts as $post)
            <article>{{ $post->title }}</article>
        @endforeach
    @endif
@endsection
```

**Auth in route:**
```php
$router->add('POST', '/login', [UserController::class, 'login'], ['web'])->name('login.submit');
$router->add('GET', '/admin', [AdminController::class, 'index'], ['auth:admin']);
```

**Plugin (`plugins/foo/`):**
- `plugin.json` — manifest
- `bootstrap.php` — registers routes/hooks via `Plugin::register('foo', fn($p) => ...)`

---

## 21. Notable gaps / things to be aware of

1. **`Session` is incomplete** — `Gate::checkAcl()`, `flash()`, `old()`, `getOldInput()` helpers call `Session::all()`, `flash()`, `getOldInput()` which **don't exist** in `src/Http/Session.php`. ⚠️ Will fatal if hit.
2. **`Crypt` lacks AEAD** — AES-256-CBC with static key, no HMAC. JWT signs its own payloads but the `Crypt` class does not.
3. **`PluginSandbox` is "soft"** — declared permission checks, no stream-wrapper / OS isolation (TODO in code).
4. **No eager loading** — `Builder::with()` stores relation names but never actually eager-loads.
5. **Mixed app code** — some "models" (`User`, `Product`, `Applications`) bypass `Model` and use raw `Fluent`/PDO.
6. **`make:model` generates legacy style** — uses `Fluent`, not `Model`. Manually write `Model` subclasses for AR benefits.
7. **`SessionConfig` DTO not wired** — exists but isn't read by `Session` class; config loaded via `config/session.php` at runtime.
8. **Two front controllers with different route loading** — `index.php` (root) loads only `route.php`; `public/index.php` loads `route.php` + `web.php` + `api.php`.
9. **`Middleware/src/` is empty** — only `Contracts\MiddlewareInterface` and a trivial `Core\Middleware`. All real middleware lives in `app/Http/Middleware/`.

---

## 22. Where to look for examples

- `app/Models/Post.php` + `Tag.php` + `Comment.php` — clean AR model with relations
- `app/Models/UserModel.php` — `User` with `HasRoles` trait
- `app/Controllers/UserController.php` — controller + auth flow
- `app/Http/Middleware/Authenticate.php` — JWT guard with role param
- `app/Policies/PostPolicy.php` — policy
- `app/Modules/Blog/` — complete module structure
- `examples/mvc/blog/` — complete starter
- `plugins/Audit/` — real plugin
- `routes/route.php` — all the in-app routes
- `database/migrations/2026_02_04_090103_create_rbac_tables.php` — RBAC schema

---

## 23. Summary architecture diagram

```
Request Flow:
  Browser → public/.htaccess → public/index.php (or root index.php)
    → autoload → Config → Container → PluginManager
    → PackageManifest → service providers (register + boot)
    → ErrorHandler → Database::connect
    → App\Http\Kernel middleware pipeline
    → routes/route.php (+ routes/web.php, routes/api.php)
    → Router::dispatch($uri, $method)
    → Controller → Response

CLI Flow:
  php nemesis <command>
    → bin/nemesis → autoload → Config → switch ($argv[1]) → command handler

Three-Layer Architecture:
  1. Core (src/)    — zero-dependency framework engine
  2. App (app/)     — user business logic (controllers, models, middleware)
  3. Plugins (plugins/) — sandboxed sidecar extensions
```

---

## ✅ Ready for requirements

I now have a working mental model of:
- How requests enter and dispatch
- How to define routes, middleware, controllers
- How to write models (AR style) and run migrations
- How to use auth, RBAC, validation, sessions
- How the Blade-compatible view engine works
- How to build plugins and modules
- The CLI and its commands
- The gotchas to avoid

**Tell me your actual requirements** and I'll build on top of Nemesis correctly from the first line.
