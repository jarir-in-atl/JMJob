# 🐛 Nemesis Framework — Known Gaps & Bug Tracker

> **Purpose:** Track all known issues, gaps, and inconsistencies discovered while exploring the Nemesis Framework. To be referenced for future bug fixes.
>
> **Repo:** https://github.com/jarir2020/jarir-nemesis
> **Version:** v7.1.0
> **Local clone:** `/tmp/nemesis-framework/`
> **Last updated:** 2026-08-30

---

## 🔴 Critical (will cause runtime failures)

### Gap 1: `Session` class is missing methods that are called

- **Class:** `src/Http/Session.php`
- **Issue:** `Session` only defines `get`, `set`, `has`, `remove`, `token`, `regenerateToken`. But the following call sites expect methods that don't exist:
  - `Gate::checkAcl()` calls `Session::all()`
  - Global `flash()` helper calls `Session::flash()`
  - Global `old()` helper calls `Session::getOldInput()`
- **Impact:** Any flow that hits RBAC ACL checks, flash messages, or old-input repopulation will fatal with `BadMethodCallException` / `Error: Call to undefined method`.
- **Files involved:**
  - `src/Http/Session.php` (missing methods)
  - `src/Auth/Gate.php` (caller)
  - `src/Helpers/Helpers.php` (caller — `flash()`, `old()`, `getOldInput()`)
- **Fix direction:** Add `all(): array`, `flash(string $key, $value): void`, `getOldInput(string $key, $default = null): mixed` to `Session`. Also add `pull($key, $default = null)`, `reflash()`, `keep($keys)`.

---

## 🟠 High (security or architectural)

### Gap 2: `Crypt` lacks AEAD authentication

- **Class:** `src/Security/Crypt.php`
- **Issue:** `Crypt::encrypt()` produces AES-256-CBC ciphertext with an IV but **no HMAC** over the ciphertext. The format is `base64(ciphertext :: iv)` with no integrity tag. If the IV is tampered with or ciphertext is flipped bit-by-bit, decryption will either garbage-out or, in the worst case, produce a valid-looking plaintext via padding-oracle attacks.
- **Impact:** Any value encrypted via `Crypt` is vulnerable to bit-flipping and (depending on usage) padding-oracle attacks. JWT independently signs its own payload, so JWT is safe — but raw `Crypt` usage is not.
- **Fix direction:** Use `sodium_crypto_secretbox` (XSalsa20-Poly1305) or AES-256-GCM with `hash_hmac('sha256', $iv.$ciphertext, $key)` and constant-time compare on decrypt. Format: `version || iv || ciphertext || hmac`.

### Gap 3: `PluginSandbox` is "soft" — no real isolation

- **Class:** `src/Core/PluginSandbox.php`
- **Issue:** The sandbox declares permissions and runs plugins inside `setupSandbox()`/`teardownSandbox()` try/finally, but the production-grade stream-wrapper / error-handler enforcement is a TODO comment in the code:
  > "In production, this would use PHP's stream wrappers and error handlers"
- **Impact:** A misbehaving plugin can read/write any file the PHP process can access, escape via `eval`, `include`, `system`, etc. The "sandbox" is currently a permission-check helper, not isolation.
- **Fix direction:** Apply `open_basedir`-style restrictions via custom stream wrappers, register an error handler that masks sensitive paths, optionally use `disable_functions` per-plugin via a separate PHP-FPM pool, and namespace globals via a scoped `Closure::bind`.

### Gap 4: `Builder::with()` does not actually eager-load

- **Class:** `src/Core/Builder.php` (lines 481–488)
- **Issue:** `$query->with(['comments', 'author'])` stores the relation names in an `$eagerLoad` array, but the array is **never read** during query execution. Each relation is still lazy-loaded via `__get`, triggering N+1 queries.
- **Impact:** Developers expecting Eloquent-style eager loading will silently get N+1.
- **Fix direction:** After fetching hydrated models, iterate `$eagerLoad` and call `$model->getRelationValue($name)` for each one. Cache the loaded relation in `$relations` as today. For `BelongsToMany`, do an IN-batch query keyed on the parent IDs.

---

## 🟡 Medium (functional / DX)

### Gap 5: Two coexisting model styles — scaffolder emits the wrong one

- **Classes:** `src/Core/Model.php` (AR, advertised) vs `src/Core/Fluent.php` (raw QB)
- **Issue:** The framework advertises an "Eloquent-style ORM" via `Nemesis\Core\Model`, but the `make:model` CLI scaffolder currently generates a `Fluent`-extending stub. Several shipped app "models" (`app/Models/User.php`, `Product.php`, `Applications.php`) also bypass `Model` entirely and use raw `Fluent`/PDO.
- **Impact:** New developers following the `make:model` command get a different API than the documentation shows. Confusion, code-style inconsistency.
- **Files to fix:**
  - `bin/nemesis` — `make:model` handler
  - `src/Scaffolder/stubs/model.stub` — should emit `extends Model`, not `extends Fluent`
  - `app/Models/User.php`, `Product.php`, `Applications.php` — refactor to `extends Model`
- **Fix direction:** Update the model stub to generate `extends \Nemesis\Core\Model` with `$table`, `$fillable`, and constructor. Add a `make:ar-model` alias or deprecate `Fluent`-extending in app code.

### Gap 6: `SessionConfig` DTO exists but isn't wired

- **Class:** `src/Config/SessionConfig.php` (typed DTO) + `src/Http/Session.php`
- **Issue:** `SessionConfig` is a `readonly class` with `driver`, `lifetime`, `cookieName`, `secure`, `sameSite` fields, and a `fromEnv()` factory. But `Session` (the actual implementation) reads `config/session.php` directly, not via the DTO.
- **Impact:** Two parallel config systems. Anyone updating `SessionConfig::fromEnv()` won't affect runtime behavior.
- **Fix direction:** Refactor `Session` to consume `SessionConfig` from the container, or remove the unused DTO.

### Gap 7: Two front controllers with different route loading

- **Files:** `index.php` (root) vs `public/index.php`
- **Issue:**
  - `index.php` loads only `routes/route.php`
  - `public/index.php` loads `routes/route.php` + `routes/web.php` + `routes/api.php`
- **Impact:** Apps deployed with root as document root will silently miss `web.php` and `api.php` route definitions. Inconsistent behavior depending on deployment.
- **Fix direction:** Make both front controllers load the same set of route files. Or document this clearly and deprecate one of them.

### Gap 8: `src/Middleware/` is empty

- **Directory:** `src/Middleware/`
- **Issue:** The directory exists with only `Contracts\MiddlewareInterface` and a trivial `src/Core/Middleware.php`. All real middleware (Auth, CSRF, Session, Throttle, etc.) lives in `app/Http/Middleware/`. This contradicts the "core" framing of the framework.
- **Impact:** Framework code is split between `src/` and `app/` in non-obvious ways. New developers expect framework middleware in `src/`.
- **Fix direction:** Either:
  - Move built-in middleware classes to `src/Http/Middleware/` (or `src/Middleware/`) and ship a default Kernel that includes them
  - Or clearly document that `app/Http/Middleware/` is the canonical home and that `src/Middleware/` is reserved for framework-extension middleware

### Gap 9: `make:model` and `make:controller` need to align with advertised ORM

- **Files:** `bin/nemesis` scaffolder handlers, `src/Scaffolder/stubs/*.stub`
- **Issue:** The scaffolder emits `Fluent`-extending models and basic controllers. The shipped example code in `app/Models/Post.php` shows the *intended* AR style, but a `php nemesis make:model Post` doesn't produce that.
- **Fix direction:** Rewrite the model stub to extend `Nemesis\Core\Model` with `$table` and `$fillable` properties. Update controller stub to extend `Nemesis\Core\Controller`.

---

## 🟢 Low (cosmetic / minor)

### Gap 10: `src/Interceptors/`, `src/Serializer/`, `src/Telemetry/` are empty placeholders

- **Directories:** `src/Interceptors/`, `src/Serializer/`, `src/Telemetry/`
- **Issue:** Empty folders that imply functionality that doesn't exist yet. README/structure docs reference them in some places.
- **Fix direction:** Remove the empty dirs or add a `.gitkeep` + comment explaining the future purpose.

### Gap 11: Inconsistent middleware registration

- **Files:** `app/Http/Kernel.php`
- **Issue:** `VerifyCsrfToken` and `StartSession` are listed in BOTH the global `$middleware` array AND the `web` middleware group. This means they're applied twice for routes inside the `web` group.
- **Impact:** Double session-start attempt (which `Session` defends against), double CSRF check (idempotent but wasteful).
- **Fix direction:** Remove from global list and rely on the `web` group. Or remove from `web` group and rely on global.

### Gap 12: `bin/nemesis` is a 2300-line `switch` statement

- **File:** `bin/nemesis`
- **Issue:** All ~75 commands live in a single `switch($argv[1])` block. Hard to maintain, no plugin command discovery, no help system beyond `--help` switch.
- **Fix direction:** Refactor to a `Symfony\Console`-style command registry. `CommandInterface` already exists in `src/Contracts/`. Auto-discover commands in `app/Console/Commands/` and `plugins/*/commands/`.

---

## 📋 Summary table

| # | Severity | Subsystem | One-line fix |
|---|---|---|---|
| 1 | 🔴 Critical | Session | Add `all()`, `flash()`, `getOldInput()` to `Session` |
| 2 | 🟠 High | Security/Crypt | Switch to AEAD (AES-GCM or `sodium_crypto_secretbox`) |
| 3 | 🟠 High | Plugins | Implement real sandbox isolation (stream wrappers) |
| 4 | 🟠 High | ORM/Builder | Make `Builder::with()` actually eager-load |
| 5 | 🟡 Medium | Scaffolder | `make:model` should emit `extends Model` |
| 6 | 🟡 Medium | Config | Wire `SessionConfig` DTO into `Session` or remove |
| 7 | 🟡 Medium | Bootstrap | Unify route file loading between front controllers |
| 8 | 🟡 Medium | Architecture | Move built-in middleware to `src/` or document split |
| 9 | 🟡 Medium | Scaffolder | Align controller/model stubs with advertised style |
| 10 | 🟢 Low | Repo hygiene | Remove or document empty placeholder dirs |
| 11 | 🟢 Low | Middleware | Don't double-register CSRF/Session globally + in `web` group |
| 12 | 🟢 Low | CLI | Refactor `bin/nemesis` to command registry |

---

## 🔧 How to use this file

When starting a new feature or bugfix:
1. Search this file for the subsystem you're touching.
2. If a gap is listed, fix it as part of your work (or open an issue).
3. When you find a new gap, add it here with the same format: severity, class, issue, impact, files, fix direction.
4. Strike through resolved gaps with `~~...~~` and link the commit/PR.
