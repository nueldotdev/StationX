import { Route } from "../utils/types";

export const registry = {
    routes: [] as Route[]
}


export function registerRoute(r:Route) {
    registry.routes.push(r)
}