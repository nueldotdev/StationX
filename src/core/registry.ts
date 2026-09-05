import { Route } from "../utils/types.js";

export const registry = {
    routes: [] as Route[]
}


export function registerRoute(r:Route) {
    // registry.routes.push(r)
    var existingRoute = registry.routes.find(route => route.path === r.path);
    if (existingRoute) {
        // if route already exists, raise an error
        throw new Error(`Route "${r.path} already within the registry. Please use a different path or remove the existing route before adding a new one.`);
    }  else  {
        registry.routes.push(r);
    }
}