import chalk from "chalk";
import { readFile } from "fs/promises";
import { createServer as _createServer } from "http";
import path from "path";
import { getMiddlewares, middlewareRegistry } from "../middlewares/middleware.js";
import { contentTypes, Context, ServerOptions, StatusCodes } from "../utils/types.js";
import { parseRequestBody } from "./parse.js";
import { matchRoute } from "./route.js";
import { HttpError } from "./errors.js";



/**
 * Creates a server instance with customizable routes and options for serving static, media, and public files.
 *
 * @param {Route[]} routes - An array of route definitions, each containing a path and a handler function.
 * @param {ServerOptions} [options] - Configuration options for the server.
 * @param {string | null} [options.publicDir=null] - Directory for serving public HTML files (default: "views").
 * @param {string | null} [options.staticDir=null] - Directory for serving static files (default: "static").
 * @param {string | null} [options.mediaDir=null] - Directory for serving media files (default: "media").
 * @returns {object} - An object with methods to control the server:
 *   - `listen(port: number, ...args: any[]): void` - Starts the server on the specified port.
 *   - `error(callback: (err: Error) => void): void` - Registers an error handler.
 *   - `close(): void` - Stops the server.
 *   - `on(event: string, callback: (...args: any[]) => void): void` - Registers an event listener.
 *   - `emit(event: string): void` - Emits a custom event.
 *
 */
function createServer(
  options: ServerOptions = { publicDir: null, staticDir: null, mediaDir: null }
): object {
  const publicDir = path.join(options.publicDir || "views");
  const staticDir = path.join(options.staticDir || "static");
  const mediaDir = path.join(options.mediaDir || "media");

  const server = _createServer(async (req, res) => {
    // gotta load em middlewares gang!
    await getMiddlewares();

    const ctx: Context = {
      req,
      res,
      params: {},
      query: {},
      body: null,
      statusCode: 200,

      status(code: StatusCodes[keyof StatusCodes]) {
        this.statusCode = code;
        return this;
      },

      json(data: any) {
        this.res.writeHead(this.statusCode, {
          "Content-Type": "application/json",
        });
        this.res.end(JSON.stringify(data));
      },

      send(data: string, contentType = "text/plain") {
        this.res.writeHead(this.statusCode, { "Content-Type": contentType });
        this.res.end(data);
      },
    };

    // Execute middlewares
    const middlewares = middlewareRegistry.map((middleware) => middleware);

    let index = -1;

    const next = async () => {
      index++;
      if (index < middlewares.length) {
        const middleware = middlewares[index];
        if (middleware.ignore && middleware.ignore.includes(req.url)) {
          return next(); // Skip this middleware and call the next one
        }
        const shouldContinue = await middleware.handler(ctx, next);
        if (!shouldContinue) {
          return; // Stop processing if middleware signals to stop
        }
      }
    };

    await next(); // Start middleware chain

    // Parse the body
    if (["POST", "PUT", "PATCH", "UPDATE"].includes(req.method || "")) {
      ctx.body = await parseRequestBody(req);
    }

    // Match route
    const match = matchRoute(req);
    if (match) {
      try {
        ctx.params = match.params as Record<string, string>;
        await match.handler(ctx);
        // console.log(result)
        // ctx.send(result.data, "application/json")
        return;
      } catch (err: unknown) {
        const errorSource = (err instanceof HttpError && err.source) ? err.source : "server error";
        const stackInfo = (err instanceof Error && err.stack) ? `\nStack Trace:\n${chalk.gray(err.stack)}` : "";
        const errorMessage = (err instanceof Error) ? err.message : "An unknown error occurred";
        const errorStatus = (err instanceof HttpError) ? err.status : 500;
        console.error(
          `[ERROR] [${errorSource.toUpperCase()}]` +
          `\n${chalk.bgRed(" ")}  ${req.method} - ${req.url}` +
          `\n${chalk.bgRed(" ")}  STATUS: ${errorStatus}` +
          `\n${chalk.bgRed(" ")}  MESSAGE: ${chalk.redBright(errorMessage)}` +
          stackInfo
        );
        ctx.status(errorStatus);
        ctx.send(errorMessage);
        return;
      }
    }

    // File serving
    const urlPath = req.url || "";
    const getPath = urlPath.split("/");

    const pathDir = getPath[1];
    let fileType = path.extname(urlPath);
    fileType = fileType.replace(".", "")

    let filePath: string

    if (pathDir === "static") {
      try {
        getPath.splice(1, 1);
        const filePath = path.join(process.cwd(), staticDir, getPath.join("/"));
        const absPath = path.resolve(filePath);

        const content = await readFile(absPath);


        const mimeType = contentTypes[fileType] || "application/octet-stream";

        ctx.res.writeHead(200, { "Content-Type": mimeType });
        ctx.res.end(content);
        console.info(`${chalk.bgBlueBright('[INFO]')} ${req.method} - ${req.url} - STATUS ${ctx.statusCode || 200}`)
        return;
      } catch (error) {
        console.error(
          `[ERROR] ${req.method} - ${req.url} - STATUS ${error.status || 500
          } - MESSAGE \n${chalk.redBright(error.message)}`
        );
        ctx.res.writeHead(404, { "Content-Type": "text/plain" });
        ctx.res.end(`404: Static file not found on server \n${error}`);
        return;
      }
    }
    if (pathDir === "media") {
      try {
        getPath.splice(1, 1);
        const filePath = path.join(process.cwd(), mediaDir, getPath.join("/"));
        const absPath = path.resolve(filePath);

        const content = await readFile(absPath);

        const mimeType = contentTypes[fileType] || "application/octet-stream";

        ctx.res.writeHead(200, { "Content-Type": mimeType });
        ctx.res.end(content);
        console.info(`${chalk.bgBlueBright('[INFO]')} ${req.method} - ${req.url} - STATUS ${ctx.statusCode
          || 200}`)
        return;
      } catch (error) {
        console.error(
          `[ERROR] ${req.method} - ${req.url} - STATUS ${error.status || 500
          } - MESSAGE \n${chalk.redBright(error.message)}`
        );
        ctx.res.writeHead(404, { "Content-Type": "text/plain" });
        ctx.res.end(`404: Media file not found on server \n${error}`);
        return;
      }
    }
    if (fileType) {
      filePath = path.join(process.cwd(), urlPath)
    } else {
      filePath = path.join(
        process.cwd(),
        publicDir,
        req.url === "/" ? "index.html" : `${req.url}.html`
      );
    }
    try {
      const absPath = path.resolve(filePath);
      const content = await readFile(absPath);

      ctx.res.writeHead(200, { "Content-Type": "text/html" });
      ctx.res.end(content);
      console.info(`${chalk.bgBlueBright('[INFO]')} ${req.method} - ${req.url} - STATUS ${ctx.statusCode || 200}`)
    } catch (error) {
      console.error(
        `[ERROR] ${req.method} - ${req.url} - STATUS ${error.status || 404
        } - MESSAGE \n${chalk.redBright(error.message)}`
      );
      ctx.res.writeHead(404, { "Content-Type": "text/html" });
      ctx.res.end("404: Page not found!");
    }
  });

  return {
    listen: (...args: any[]) => {
      console.log(
        chalk.blue(`🌌 Station is active at http://localhost:${args[0]}`)
      );
      server.listen(...args);
    },
    error: (callback: (err: Error) => void) => server.on("error", callback),
    close: () => server.close(),
    on: (event: string, callback: (...args: any[]) => void) =>
      server.on(event, callback),
    emit: (event: string) => server.emit(event),
  };
}

export default createServer;