# Session `open_basedir` Failure and Framework Patch

**Date:** 2026-09-06
**Project:** JMJob / Nemesis
**Status:** Framework fix applied locally; deployment still requires validation

## Problem

Web requests failed with:

```text
session_start(): open_basedir restriction in effect.
File(/tmp) is not within the allowed path(s): (/home/jarir-ahmed/Downloads/JMJob/)
```

The failure occurred in `src/Http/Session.php` when `session_start()` was called.

## Root cause

There were two independent framework defects:

1. `config/session.php` declared `storage/session` as the session path, but
   `Nemesis\Http\Session` never applied that value to PHP's
   `session.save_path`. PHP therefore used its server default, commonly `/tmp`.
2. `Nemesis\Core\PluginSandbox` temporarily set `open_basedir` to the
   project root. `open_basedir` is request-wide, and PHP could not relax it
   again when the sandbox finished. The restriction leaked into the rest of
   the request. The next session start then attempted `/tmp`, which was outside
   the leaked restriction.

The leak was reproduced locally: after a sandbox callback completed,
`ini_get('open_basedir')` still contained the project-root restriction even
though it was empty before the callback.

## Fix applied

### Session storage

- Added a configurable `path` to `SessionConfig`.
- Added optional `SESSION_PATH`; the default is the deployed application's
  `storage/session` directory.
- `Session` now creates/checks the directory and applies it with
  `session.save_path` before `session_start()`.
- `StartSession` now boots `SessionConfig` before creating the session.
- Added `storage/session/.gitkeep` so the deployment includes the directory.

### Plugin sandbox

- Removed runtime mutation of `open_basedir` from `PluginSandbox`.
- Preserved explicit `checkFileAccess()` path validation.
- Canonicalized the sandbox base path before prefix checks.
- Added regression coverage ensuring the sandbox does not leak
  request-wide `open_basedir` state.

## Deployment requirements

1. Deploy the framework changes and `storage/session/.gitkeep`.
2. Ensure the deployed `storage/session` directory is writable by the PHP
   process, normally with owner/group permissions appropriate to the hosting
   account.
3. If the hosting provider sets `open_basedir` at the PHP-FPM or account
   level, ensure the deployed application directory and its `storage/session`
   directory are allowed.
4. Do not use `/tmp` as the application session path when the host restricts
   access to the project directory.
5. Verify a web request that uses the `web` middleware, then verify login,
   CSRF, logout, and session persistence across two requests.

## Validation performed

- PHP syntax checks should pass for the changed framework classes.
- Plugin sandbox regression test verifies no `open_basedir` leak.
- Session regression test verifies PHP uses the project-local save path.
- Existing unrelated working-tree changes were preserved.

## Scope note

This patch prevents the framework from changing a request-wide PHP setting as
if it were safely nestable. If stronger plugin isolation is required later,
it should use a separate PHP process/pool or a deliberate capability-based
filesystem API; it should not rely on restoring a tightened `open_basedir`
value inside the same request.
