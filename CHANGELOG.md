# Changelog

All notable changes to StationX are documented here.

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
