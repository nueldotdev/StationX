import createServer from "./core/server.js";
import { hotReload } from "./utils/reload.js";
import { route, use, path } from "./core/route.js";
import { sxEnv } from "./core/env.js";
import { createMiddleware } from "./middlewares/middleware.js";
import { sx } from "./sx/sx.js";
import chalk from "chalk";
import { Context } from "./utils/types.js";

const log = {
    info: chalk.blue,
    error: chalk.red,
    warning: chalk.yellow,
    success: chalk.green,
    debug: chalk.gray,
    title: chalk.bgBlueBright,
    subtitle: chalk.bgYellowBright,
}




export { 
    // Core and server related exports
    createServer, hotReload, route, use,  path,
    // Middleware exports
    createMiddleware, 
    // Logger exports
    log, 
    // Env exports
    sxEnv,

    sx, Context
};
