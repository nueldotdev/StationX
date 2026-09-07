# Changelog

All notable changes to StationX are documented here.

## [3.1.0]

### Added

- Added `route.group()` for Express-style grouped routing with fluent methods such as `group.get()` and `group.post()`.
- Grouped routes now merge methods for the same path before registration.
- Added `ctx.error(message)` for consistent JSON error responses, using the status set with `ctx.status()`.
- Synchronous route handlers are now supported alongside asynchronous handlers.

### Fixed

- Duplicate HTTP methods on the same grouped route now fail with a clear route-specific error instead of silently replacing the previous handler.
- Replaced deprecated `url.parse()` usage with the WHATWG `URL` API.
- Prevented secondary `ERR_HTTP_HEADERS_SENT` crashes when an error occurs after a response has started.

### Changed

- Refreshed the generated home and how-to pages with a production-ready graphite, teal, coral, and amber visual system.
- Improved template page structure with semantic navigation, accessible logo text, responsive spacing, and dedicated code typography.
- Refreshed terminal request errors with compact colored status lines and the first actionable user-code source location.
- Prevented secondary `ERR_HTTP_HEADERS_SENT` crashes when an error occurs after a response has started.
- Improved hot-reload process messages so unexpected runtime exits are distinguished from startup failures.
- Improved startup failures with concise messages and the first actionable user-code source location.

## [3.0.3]

### Fixed

- How-to page content is no longer clipped by the shared fixed-height layout and can scroll normally.

## [3.0.2]

### Added

- Duplicate route protection now rejects registration when a route path is already present in the registry.

### Fixed

- Middleware ignore rules now handle requests without a URL safely.
- Server error handling now supports unknown thrown values and consistently derives an error message and status code for view, media, and static-file requests.
- TypeScript schema modifiers now preserve the correct parent type when using `optional()`, `nullable()`, and `default()`.
- Node.js ESM imports now resolve correctly by using explicit `.js` extensions.
- TypeScript compilation now uses Node's native module and module-resolution settings and includes Node.js type definitions.

### Changed

- Updated the generated template to use explicit local ESM imports and the current `ctx.status().json()` response API.
- Updated template route examples to use `path()` for grouped routes and `createServer(options)`.
- Aligned scaffolded projects with the published `station-x` `3.0.1` dependency and the exposed `station start` CLI command.
- Refreshed the how-to page with clearer section hierarchy, readable code blocks, and responsive mobile styling.

## [3.0.1]

- Documentation and usage guidance refreshed.
