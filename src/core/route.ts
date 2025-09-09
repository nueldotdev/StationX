import { IncomingMessage } from "http";
import { parseRequest } from './parse.js';
import { Context, HttpMethod, Route, RouteHandler } from '../utils/types.js';
import { registerRoute, registry } from "./registry.js";



/**
 * Defines a route with a specified path and associated handlers.
 *
 * @param path - The URL path for the route.
 * @param handlers - The handlers responsible for processing requests to the route.
 * @returns An object representing the route, including its path and handlers.
 */
function route(path: string, handlers: RouteHandler): Route {
  const r = {
    path,
    handler: handlers
  }
  registerRoute(r)
  return r
}

/**
 * Defines a path to be used specifically within the array of the `use` grouped routes
 *
 * @param path - The URL path for the route.
 * @param handlers - The handlers responsible for processing requests to the route.
 * @returns An object representing the route, including its path and handlers.
 */
function path(path: string, handler: RouteHandler): Route {
  const r = {
    path,
    handler
  }
  return r
}


/**
 * Combines a base path with an array of route definitions, adjusting each route's path
 * to include the base path. If a route's path is `/`, it is treated as the base path itself.
 *
 * @param basePath - The base path to prepend to each route's path.
 * @param routes - An array of route objects, each containing a `path` and a `handler`.
 * @returns A new array of routes with updated paths that include the base path.
 */
function use(basePath: string, routes: Route[]): Route[] {
  const paths = routes.map(({ path: childPath, handler }) => ({
    path: `${basePath}${childPath === '/' ? '' : childPath}`,
    handler: handler,
  }));

  for (const r of paths) {
    registerRoute(r)
  }

  return paths
}

/**
 * Matches a given request path against a route path and extracts dynamic parameters if they match.
 *
 * @param routePath - The route path to match against. Static segments are matched literally,
 * and dynamic segments are prefixed with `@` (e.g., `/users/@id`).
 * @param requestPath - The request path to be matched against the route path.
 * @returns An object containing the extracted parameters as key-value pairs if the paths match,
 * or `null` if they do not match.
 *
 * @example
 * ```typescript
 * const result = matchPath('/users/@id', '/users/123');
 * // result: { params: { id: '123' } }
 *
 * const noMatch = matchPath('/users/@id', '/products/123');
 * // noMatch: null
 * ```
 */
function matchPath(routePath: string, requestPath: string): { params: Record<string, string> } | null {
  const routeSegments = routePath.split('/').filter(Boolean); // Break route path into segments
  const requestSegments = requestPath.split('/').filter(Boolean); // Break request path into segments

  if (routeSegments.length !== requestSegments.length) {
    return null; // Paths with different segment counts don't match
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < routeSegments.length; i++) {
    const routeSegment = routeSegments[i];
    const requestSegment = requestSegments[i];

    if (routeSegment.startsWith('@')) {
      // Dynamic parameter
      const paramName = routeSegment.slice(1); // Remove the leading '@'
      params[paramName] = requestSegment; // Assign the value to the parameter name
    } else if (routeSegment !== requestSegment) {
      // Static segment doesn't match
      return null;
    }
  }

  return { params }; // Return matched parameters if all segments match
}

/**
 * Matches an incoming HTTP request to a predefined set of routes and returns the corresponding handler and route parameters.
 *
 * @param req - The incoming HTTP request object.
 * @param routes - An array of route definitions to match against. Each route contains a path and a handler.
 * @returns An object containing the matched route handler and extracted route parameters if a match is found, or `null` if no match is found.
 *
 * The returned handler can either be a single-method function or a method-specific handler object.
 * The `params` object contains key-value pairs of route parameters extracted from the matched path.
 */
function matchRoute(req: IncomingMessage): 
  { handler: (ctx: Context) => Promise<void>; params: Record<string, string> } | null {
  const routes = registry.routes;
  const { pathname, method } = parseRequest(req);

  for (const route of routes) {
    if (!pathname) {
      continue; 
    }
    const match = matchPath(route.path, pathname);
    if (match) {
      const methodHandler = route.handler[method as HttpMethod];

      if (typeof methodHandler === 'function') {
        return { 
          handler: methodHandler, 
          params: match.params 
        };
      }
    }
  }

  return null;
}

export { route, use, path, matchRoute };
