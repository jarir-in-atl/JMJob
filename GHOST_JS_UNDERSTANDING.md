# 🧠 Ghost.js — Complete Framework Understanding

> **Repo:** https://github.com/jarir2020/ghost-js
> **CLI package:** `@ghost-js/cli` (version `1.0.2`)
> **Local clone:** `/tmp/ghost-js/`
> **Install:** `npx @ghost-js/cli create my-app`
> **Last updated:** 2026-08-30

This document captures the full understanding of Ghost.js — the framework we're using for the frontend of our Nemesis-based project.

---

## 1. What is Ghost.js?

**Ghost.js** is a **compiler-first, high-performance reactive frontend framework** — NOT just a build tool. It is unopinionated about syntax and provides a complete frontend stack in **under 5KB gzipped** (core + runtime).

### Core Pillars (9)

| Pillar | What it does |
|---|---|
| **Ghost Core (Reactivity)** | Fine-grained signals with glitch-free updates |
| **Ghost Bundler (Compiler)** | esbuild integration with maximum tree-shaking |
| **Ghost Data (Async)** | Automatic async state management (`loading`, `error`, `data`) |
| **Ghost HTTP (Network)** | Native JSON/XML API support with `ghostFetch` |
| **Ghost Bridge (Persistence)** | Reactive `localStorage` syncing with `persistSignal` |
| **Ghost Mediator (Communication)** | Global Signal-driven Event Bus |
| **Ghost Router (Structure)** | File-based routing with nested layouts |
| **Active Style (Style)** | Direct CSS-variable binding (zero runtime re-styling) |
| **Ghost Inspector (Dev)** | Real-time visual overlay for Render Graph health |

---

## 2. The "props setup" model (not API setup)

This is what the user means by **"props setup, like Laravel mix or vite"**. Each component is a **function returning a plain `{tag, props, children}` object** — declarative, not imperative:

```javascript
// A Ghost component is just a function returning this shape:
const App = () => ({
    tag: 'main',
    props: { class: 'app' },
    children: [
        { tag: 'h1', props: {}, children: ['Hello, world!'] },
        {
            tag: 'button',
            props: { onclick: () => count.set(count.get() + 1) },
            children: ['Increment']
        }
    ]
});

mount(App(), document.body);
```

This is **NOT API-based** (where you'd call `createElement(...)` etc. imperatively). It's a **declarative object format** — closer to a virtual-DOM descriptor. The "props" are the `props` object on each node.

### Children can be reactive

Children can be strings, numbers, `{tag, props, children}` objects, or **functions (reactive getters)**:

```javascript
{
    tag: 'p',
    props: {},
    children: [() => `Count: ${count()}`]  // function = reactive getter
}
```

### `defineComponent` — props-based reusable components

```javascript
import { defineComponent, createNode } from '@ghost-js/core';

const Button = defineComponent((props) =>
    createNode('button', { onclick: props.onClick }, [props.label])
);

// Usage:
Button({ label: 'Click me', onClick: () => doSomething() })
```

---

## 3. Monorepo Structure

```
/tmp/ghost-js/
├── README.md
├── package.json           monorepo root (npm workspaces "packages/*")
├── demo-app/              working example consumer app
├── docs/                  8 markdown files
├── packages/              monorepo sub-packages
│   ├── core/              @ghost-js/core — reactivity + render graph
│   ├── compiler/          @ghost-js/compiler — esbuild plugin, .ghost template parser
│   ├── paradigms/         @ghost-js/paradigms — React/Vue/Angular/Svelte adapters
│   ├── router/            @ghost-js/router — file-based routing, nested layouts
│   ├── database/          @ghost-js/database — ORM / query builder / models
│   ├── events/            @ghost-js/events — event bus + queued jobs
│   └── ghost-cli/         @ghost-js/cli — the CLI (this is what `npx @ghost-js/cli` invokes)
├── scripts/               publish scripts per package, size checker
├── src/                   root scaffolding (components/, views/ dirs)
└── tests/                 30+ Jest tests
```

### Package details

| Package | Export name | Purpose | Key files |
|---|---|---|---|
| `core` | `@ghost-js/core` | Reactivity + render graph + SSR/HTTP/etc. | `signals.js`, `render-graph.js`, `async.js`, `http.js`, `ssr.js`, `bridge.js`, `mediator.js`, `style.js`, `hydration.js`, `i18n.js`, `devtools.js`, `state.js`, `testing.js`; barrel in `index.js` |
| `compiler` | `@ghost-js/compiler` | `.ghost` template → DOM parser, esbuild plugin | `compiler.js`, `ghost-plugin.js` |
| `paradigms` | `@ghost-js/paradigms` | React/Vue/Angular/Svelte adapters | `react.js`, `vue.js`, `angular.js`, `svelte.js`, `index.js` |
| `router` | `@ghost-js/router` | Manual + file-based routing, guards, nested layouts | `router.js`, `file-router.js`, `index.js` |
| `ghost-cli` | `@ghost-js/cli` | Build tool, devserver, generator, scaffolding | `cli.js`, `bundler.js`, `starter-templates.js`, `project-scaffold.js`, `backend-generators.js`, `style-generators.js`, `help-content.js`, `asset-pipeline.js`, `size-monitor.js` |
| `database` | `@ghost-js/database` | ORM / query builder / models / migrations | `index.js`, `query-builder.js`, `model.js`, `schema.js`, `migrations.js`, `dialects.js`, `response.js` |
| `events` | `@ghost-js/events` | Event bus + queued jobs | `index.js` |

Every package is `"type": "module"` (ESM). The core package is not bundled — `main` points at `src/index.js`, and cross-package imports use **relative paths into core's src** (e.g. router does `import { signal, batch } from '../../core/src/index.js'`).

### Core reactivity (`packages/core/src/signals.js`)

```javascript
signal(initial)   → { get(), set(v) }       // with subscriber tracking
computed(fn)      → { get() }                // derived signal
effect(fn)        → disposer                // side effect, with global onError() boundary
batch(fn)                                     // batch updates
```

### Render graph (`packages/core/src/render-graph.js`)

```javascript
mount(node, parentEl)                       // walks {tag,props,children} tree, creates real DOM
createList(getItems, keyFn, renderFn)        // keyed diffing
when(cond, trueFn, falseFn)                  // conditionals
defineComponent(setup)                       // props normalization
memo(factory, deps)                          // memoization
lazyNode(importFn, fallback)                 // code splitting
```

Props keys starting with `on` become event handlers. Function-valued non-event props are wrapped in `effect()` and re-set as attributes on change.

---

## 4. CLI Commands (the `ghost` binary)

### Project lifecycle

| Command | Purpose |
|---|---|
| `ghost create <name>` | Scaffold a new project (alias: `ghost init`, `ghost make:starter`) |
| `ghost dev` | Dev server with HMR (`http://127.0.0.1:3000`) |
| `ghost build` | Production build to `dist/build/bundle.js` |
| `ghost start` | Build + preview (production) |
| `ghost preview` | Serve built artifacts (port 4173) |
| `ghost watch` | File watcher (outputs to `dist/watch/`) |
| `ghost serve` | Static serve (alias for preview) |
| `ghost clean` | Remove `dist/*` and `.ghost/cache`, `.ghost/manifests` |
| `ghost doctor` (+ `--fix`, `--memory`, `--json`) | Project health / repair |
| `ghost generate <component\|view> <name>` | Quick source file |
| `ghost help` (or `--help`, `-h`) | Help (supports `--guided`, `--topic=<cmd>`, `--json`) |

### Backend-style code generators (Laravel-like for JS)

| Command | Generates |
|---|---|
| `ghost make:controller <name>` | Controller (JS class) |
| `ghost make:model <name>` | Model (JS class) |
| `ghost make:migration <name>` | Migration |
| `ghost make:seeder <name>` | Seeder |
| `ghost make:factory <name>` | Factory |
| `ghost make:request <name>` | Request (FormRequest-style) |
| `ghost make:dto <name>` | Data Transfer Object |
| `ghost make:transformer <name>` | Transformer |
| `ghost make:resource <name>` | API Resource |
| `ghost make:middleware <name>` | Middleware |
| `ghost make:server-action <name>` | Server Action |
| `ghost make:event <name>` | Event |
| `ghost make:listener <name>` | Event listener |
| `ghost make:job <name>` | Background job |
| `ghost make:events <name>` | Events bundle (with `--with-auth`, `--with-crud`, `--with-notifications`) |
| `ghost make:view <name>` | View template |
| `ghost make:crud <name>` | Full CRUD surface |
| `ghost make:auth` | Auth flow (controller, middleware, login, register) |
| `ghost make:route <name>` | Route group |
| `ghost make:api <name>` | API surface |

### Routing / introspection

| Command | Purpose |
|---|---|
| `ghost route:list` | List all routes |
| `ghost route:export <name> --format=json\|php` | Export route manifest |
| `ghost route:diagnose` | Health check for routes |

### Visual builder / admin tools

| Command | Purpose |
|---|---|
| `ghost make:css-editor <name>` | CSS editor component |
| `ghost make:form-builder <name>` | Form builder component |
| `ghost make:style-inline <component>` | Inline style helper |

### CLI options pattern

Each generator accepts:
- `--app=<name>` — target app scope
- `--force` — overwrite existing files
- `--json` / `--brief` / `--pretty` — output format
- Plus generator-specific options (e.g. `--template=`, `--middleware=`, `--with-auth`)

---

## 5. `ghost create` flow

The scaffolding flow (`packages/ghost-cli/src/cli.js` lines 120-158):

1. `command === 'create' | 'init' | 'make:starter'` — all three are aliases
2. `resolveStarterSelection()` resolves template + name (optionally `--guided` prompts)
3. `scaffoldStarter(projectRoot, projectName, templateName, args, {...})` writes files
4. On success prints:
   ```
   Project created successfully!
   Template: <template>
   Generated files: <count>
   Next steps:
     cd <name>
     npm install
     npm run dev
   ```

### No `templates/` directory

There is **no `packages/ghost-cli/templates/` directory** — the entire scaffolding system is generated in-memory as JS template functions inside a single file: `/tmp/ghost-js/packages/ghost-cli/src/starter-templates.js` (965 lines). It exports **~75 starter templates**.

### ~75 starter templates available

**8 native ghost templates** (defined inline):
`blog`, `admin-panel`, `saas`, `crm`, `landing-page`, `ecommerce`, `docs`, `portfolio`

**12 "stack" templates** (for React/Vue/Next/etc.):
`react-dashboard`, `react-commerce`, `vue-admin`, `vue-marketing`, `next-docs`, `next-ssr`, `nuxt-portal`, `svelte-studio`, `angular-enterprise`, `alpine-minimal`, `preact-lite`, `lit-ui`

**~55 example templates**:
`marketing-site`, `startup-launch`, `app-shell`, `dashboard-lite`, `analytics-board`, `admin-lite`, `ops-center`, `support-center`, `knowledge-base`, `documentation-site`, `blog-magazine`, `podcast-show`, `newsletter`, `course-platform`, `school-portal`, `forum-hub`, `community-hub`, `social-feed`, `marketplace`, `storefront`, `booking-app`, `event-site`, `restaurant-site`, `travel-guide`, `real-estate`, `fitness-tracker`, `music-studio`, `photo-gallery`, `video-channel`, `jobs-board`, `finance-dashboard`, `healthcare-portal`, `portfolio-modern`, etc.

### Generated project structure (default `blog` template)

```
myapp/
├── package.json
├── README.md
├── index.html                       loads /dist/dev/bundle.js
├── src/
│   ├── index.js                     signal counter app (entry)
│   ├── routes/home.js               export const homeRoute = { path: '/', component: 'BlogHome' }
│   ├── layouts/admin.js             blog only
│   └── admin/
│       ├── modules/{AdminDashboard,FormBuilder,CssEditor}.js
│       └── forms/post.schema.json
└── .ghost/starter-manifest.json
```

---

## 6. Generated `package.json`

```json
{
  "name": "<projectName>",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@ghost-js/core": "0.2.0",
    "@ghost-js/events": "0.2.0",
    "@ghost-js/database": "0.2.0",
    "@ghost-js/paradigms": "0.2.0",
    "@ghost-js/router": "0.2.0",
    "@ghost-js/cli": "0.2.1"
  },
  "scripts": {
    "dev": "ghost dev",
    "build": "ghost build",
    "doctor": "ghost doctor"
  }
}
```

---

## 7. Configuration

**Important finding: there is no `ghost.config.js`.** Ghost is not configuration-file driven (unlike Vite or Laravel Mix). Configuration is via:

1. **The generated `package.json`** (built by `starter-templates.js`)
2. **The `index.html` shell** — points at `/dist/dev/bundle.js` or `/dist/build/bundle.js`
3. **CLI flags / env vars at runtime** — port/host via `--port`/`--host` or `GHOST_PORT`/`GHOST_HOST`/`PORT`/`HOST` (see `bundler.js` lines 246-251)

The component model is **props-based** (`defineComponent`, function components returning node objects / `.ghost` templates), **not** an object-config/JSON schema API.

---

## 8. Demo App reference (`demo-app/`)

The minimal canonical example:

```
demo-app/
├── index.html          entry point — loads /dist/dev/bundle.js or /dist/build/bundle.js
├── package.json          deps + dev/build scripts
└── src/
    ├── index.js          mounts the App
    ├── components/
    │   └── TestButton.js   trivial component
    └── views/
        └── TestPage.js     trivial view
```

**`index.html`** (25 lines):
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ghost Demo</title>
</head>
<body>
    <script type="module">
        const candidates = ['/dist/dev/bundle.js', '/dist/build/bundle.js'];
        for (const source of candidates) {
            try {
                await import(source);
                break;
            } catch {
                // Try the next isolated output directory.
            }
        }
    </script>
</body>
</html>
```

**`src/index.js`** (full minimal app using React paradigm):
```javascript
import { React } from '@ghost-js/paradigms';
import { mount, initDevTools } from '@ghost-js/core';

initDevTools();

const [count, setCount] = React.useState(0);

const App = () => {
    return {
        tag: 'div',
        props: { style: 'text-align: center; margin-top: 50px;' },
        children: [
            { tag: 'h1', props: {}, children: ['Ghost.js App'] },
            { tag: 'p', props: {}, children: [() => `Count: ${count()}`] },
            {
                tag: 'button',
                props: { onclick: () => setCount(c => c + 1) },
                children: ['Increment']
            }
        ]
    };
};

mount(App(), document.body);
```

---

## 9. Data fetching: `ghostFetch` + `asyncSignal`

### `ghostFetch(url, options)` — fetch wrapper

Lives in `packages/core/src/http.js`. Features:
- Automatic JSON/XML parsing by Content-Type
- In-memory cache (`cache: 'memory'` for GETs)
- Request/response **interceptors** (`ghostFetch.interceptors.request` / `.response`)

```javascript
import { ghostFetch } from '@ghost-js/core';

// Auto-JSON for PHP endpoints
const data = await ghostFetch('/api/user/1');

// Auth header via interceptor
ghostFetch.interceptors.request.push(cfg => {
    cfg.headers = { ...cfg.headers, Authorization: `Bearer ${token}` };
    return cfg;
});
```

### `asyncSignal(fetcher)` — reactive async state

Lives in `packages/core/src/async.js`. Turns any async fetcher into a reactive `{ data, loading, error, refetch }` triple — designed to pair with `ghostFetch`:

```javascript
import { asyncSignal } from '@ghost-js/core';
import { ghostFetch } from '@ghost-js/core';

const userFetcher = async () => ghostFetch('/api/users/me');
const user = asyncSignal(userFetcher);
// user.data(), user.loading(), user.error(), user.refetch()
```

### `persistSignal` — localStorage sync

Lives in `packages/core/src/bridge.js`. Reactive signal that automatically syncs to `localStorage`:

```javascript
import { persistSignal } from '@ghost-js/core';
const theme = persistSignal('theme', 'light');
// theme.get() reads from localStorage, theme.set() writes back
```

---

## 10. PHP backend integration (the Nemesis story)

There are **two distinct** integration stories:

### (a) Drop-in via docs/DEPLOYMENT.md

`docs/DEPLOYMENT.md` lines 40-44 explicitly mention PHP integration:
> "If you are integrating Ghost with a PHP/Laravel project: Include the Ghost bundle in your `resources/js/app.js`. Ghost's HTTP Pillar (XML/JSON support) makes it perfect for communicating with Laravel/Symfony controllers."

The pattern for our **Nemesis** project:
1. Build Ghost frontend: `ghost build` → outputs `dist/build/bundle.js`
2. Copy built bundle into Nemesis project (e.g. `public/js/app.js` or `resources/js/app.js`)
3. Include in a Blade template: `<script type="module" src="/js/app.js"></script>`
4. Have Nemesis serve JSON via `routes/api.php` (using `ApiResponse::json(...)`)
5. Ghost components call Nemesis endpoints via `ghostFetch('/api/...')` + `asyncSignal(...)`

### (b) Built-in data-fetching via `ghostFetch` + `asyncSignal`

Already covered in section 9.

### (c) Route manifest export (for PHP routers)

`route:export <name> --format=php` produces a real PHP array file via `buildRouteExportPhp()` (in `backend-generators.js` lines 1114-1120):

```php
<?php
return [
    'kind' => 'ghost.route.cache',
    'schemaVersion' => 1,
    'name' => '<name>',
    'prefix' => '...',
    'routes' => [
        ['method' => 'GET', 'path' => '/api/...', 'handler' => '...Controller.index', 'middleware' => ['api']]
    ]
];
```

The `createApiArtifacts` function generates a JSON API surface with a cached route manifest (`storage/api/<entity>.json`) that can be exported/consumed by Nemesis's router.

---

## 11. Framework paradigms (syntax adapters)

Ghost is unopinionated about syntax. Pick your favorite:

```javascript
// React paradigm
import { useState, useEffect } from '@ghost-js/paradigms/react';

// Vue paradigm
import { reactive, computed } from '@ghost-js/paradigms/vue';

// Angular paradigm
import { Injectable, Form } from '@ghost-js/paradigms/angular';
```

The **React paradigm** is the most common choice for typical web apps.

---

## 12. `.ghost` template files (compiler-authored)

Beyond `{tag, props, children}` objects, Ghost has a template language with `.ghost` files:

```html
<div class="counter">
    <p>Count: {{ count }}</p>
    <button :onclick="increment">+1</button>
</div>
```

These are compiled by `packages/compiler/src/compiler.js`:
- `{{expr}}` — interpolation
- `:onclick="handlerName"` — event binding
- `g-bind:attr="value"` — attribute binding

Loaded via esbuild's `ghostPlugin` (`compiler/src/ghost-plugin.js`). The compiled output is a factory:
```javascript
(state) => createNode('div', {}, [...])
```
exported as an ES module (default + named `template`).

---

## 13. Dev server behavior

`ghost dev` → `serve()` in `bundler.js` (lines 244-301):
- esbuild dev server at `http://127.0.0.1:3000` (or `GHOST_PORT`/`--port`)
- HMR via `EventSource('/esbuild')` (server-sent events)
- Outputs `dist/dev/bundle.js`
- Watches files for changes

`ghost build` → `build()` (lines 202-242):
- Production build to `dist/build/bundle.js`
- Minified, code-split (`splitting: true`)
- Uses `ghostPlugin` + `ghostAssetPlugin`
- Runs `checkSize` after (5KB budget check)

`ghost start` → `build()` then `preview()` (port 4173)
`ghost preview` → static server on `dist/build/` (port 4173)
`ghost watch` → file watcher with output to `dist/watch/`

---

## 14. Performance targets

- **Zero-JS Fallback**: Built-in SSR with state-aware hydration
- **5KB Limit**: Framework core + runtime strictly capped at 5KB gzipped
- **Infinite Rendering**: Fast, deterministic DOM updates without Virtual DOM

---

## 15. Code idioms — how to write for Ghost.js

**Counter component (React paradigm):**
```javascript
import { React } from '@ghost-js/paradigms';
import { mount } from '@ghost-js/core';

const [count, setCount] = React.useState(0);

const App = () => ({
    tag: 'main',
    children: [
        { tag: 'h1', children: ['Counter'] },
        { tag: 'p', children: [() => `Count: ${count()}`] },
        {
            tag: 'button',
            props: { onclick: () => setCount(c => c + 1) },
            children: ['Increment']
        }
    ]
});

mount(App(), document.body);
```

**Reusable component (defineComponent):**
```javascript
import { defineComponent, createNode } from '@ghost-js/core';

const Button = defineComponent((props) =>
    createNode('button', { onclick: props.onClick }, [props.label])
);

// Usage
Button({ label: 'Save', onClick: handleSave })
```

**Data fetching (asyncSignal + ghostFetch):**
```javascript
import { asyncSignal, ghostFetch } from '@ghost-js/core';

const users = asyncSignal(() => ghostFetch('/api/users'));
// users.data(), users.loading(), users.error(), users.refetch()
```

**HTTP interceptor (auth):**
```javascript
ghostFetch.interceptors.request.push(cfg => {
    const token = localStorage.getItem('token');
    if (token) cfg.headers = { ...cfg.headers, Authorization: `Bearer ${token}` };
    return cfg;
});
```

**localStorage sync:**
```javascript
import { persistSignal } from '@ghost-js/core';
const theme = persistSignal('theme', 'light');
```

**Form event handling:**
```javascript
{
    tag: 'form',
    props: {
        onsubmit: (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            handleSubmit(Object.fromEntries(formData));
        }
    },
    children: [
        { tag: 'input', props: { name: 'email', type: 'email' } },
        { tag: 'button', props: { type: 'submit' }, children: ['Submit'] }
    ]
}
```

---

## 16. Integration with Nemesis (this project)

The recommended architecture:

```
┌──────────────────────────────────────────────┐
│  Browser                                     │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ Ghost.js Frontend                    │    │
│  │ - {tag, props, children} components  │    │
│  │ - Signals (signal, computed, effect) │    │
│  │ - ghostFetch → /api/*                │    │
│  │ - asyncSignal for reactive data      │    │
│  │ - Bundle: dist/build/bundle.js       │    │
│  └──────────────┬───────────────────────┘    │
│                 │ JSON over HTTP             │
└─────────────────┼────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────┐
│  Nemesis v7.1.1 (PHP 8.2)                    │
│  ┌──────────────────────────────────────┐    │
│  │ routes/api.php                        │    │
│  │ - GET  /api/users      → list         │    │
│  │ - POST /api/users      → create       │    │
│  │ - GET  /api/users/{id} → show         │    │
│  └──────────────────────────────────────┘    │
│  ┌──────────────────────────────────────┐    │
│  │ Controllers (App\Http\Controllers)    │    │
│  │ - UserController, PostController, etc.│    │
│  └──────────────────────────────────────┘    │
│  ┌──────────────────────────────────────┐    │
│  │ Models (Nemesis\Core\Model)          │    │
│  │ - User extends Model                  │    │
│  │ - Post extends Model                  │    │
│  └──────────────────────────────────────┘    │
│  ┌──────────────────────────────────────┐    │
│  │ Database (SQLite default, MySQL/PG)   │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

**Dev workflow:**
1. Backend: `php -S 127.0.0.1:8000 -t public/` (Nemesis)
2. Frontend: `ghost dev --port 3000` (Ghost with proxy to backend)
3. OR: Build Ghost → copy `dist/build/bundle.js` → `public/js/app.js` → serve everything from Nemesis

**Auth integration:**
- Login: `ghostFetch('/api/auth/login', { method: 'POST', body: { email, password } })` → returns JWT
- Store: `persistSignal('auth_token', response.access)`
- Interceptor: Add `Authorization: Bearer <token>` to all requests
- Logout: clear `persistSignal`

**Auth state via asyncSignal:**
```javascript
const currentUser = asyncSignal(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    return await ghostFetch('/api/auth/me');
});
```

---

## 17. Summary cheat sheet

| Concept | What to use | Where it lives |
|---|---|---|
| Component | `() => ({ tag, props, children })` | `packages/core/src/render-graph.js` |
| State | `signal(initial)` → `{get, set}` | `packages/core/src/signals.js` |
| Computed | `computed(() => ...)` | `packages/core/src/signals.js` |
| Effect | `effect(() => ...)` | `packages/core/src/signals.js` |
| Mount | `mount(node, parentEl)` | `packages/core/src/render-graph.js` |
| Reusable component | `defineComponent(setup)` | `packages/core/src/render-graph.js` |
| HTTP | `ghostFetch(url, opts)` | `packages/core/src/http.js` |
| Async state | `asyncSignal(fetcher)` | `packages/core/src/async.js` |
| localStorage | `persistSignal(key, initial)` | `packages/core/src/bridge.js` |
| Event bus | `mediator` / `createBus` | `packages/core/src/mediator.js` |
| CSS var binding | `activeStyle` | `packages/core/src/style.js` |
| File-based router | `src/views/*` + `ghost build` | `packages/router/src/file-router.js` |
| Manual router | `createRouter({ routes })` | `packages/router/src/router.js` |
| Dev server | `ghost dev` | `packages/ghost-cli/src/bundler.js` |
| Production build | `ghost build` | `packages/ghost-cli/src/bundler.js` |
| Templates | `.ghost` files | `packages/compiler/src/compiler.js` |

---

## ✅ Ready to build

I now have a working mental model of:
- The "props setup" component model
- The full CLI command catalog
- The data fetching story (`ghostFetch` + `asyncSignal`)
- How to integrate with Nemesis (PHP backend)
- The dev → build → preview pipeline
- The signal-based reactivity
- The framework paradigms (React/Vue/Angular syntax)

**Tell me what to build and I'll architect it correctly with:**
- **Backend:** Nemesis v7.1.1 (PHP 8.2)
- **Frontend:** Ghost.js (signals + props-based components)
- **Wiring:** `ghostFetch` + `asyncSignal` against Nemesis JSON API
