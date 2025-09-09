import { IncomingMessage, ServerResponse } from "http";

// Define a type for HTTP methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

// Create a type for route handlers that ensures type safety
export type RouteHandler = {
  [Method in HttpMethod]?: (ctx: Context) => Promise<void>;
};


interface Route {
  path: string;
  handler: RouteHandler;
}

type ContentTypes = {
  [key: string]: string;
};
type StatusCodes = {
  [key: string]: number;
};

const StatusCodes: StatusCodes = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
};

const contentTypes: ContentTypes = {
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  ico: "image/x-icon",
  css: "text/css",
  js: "text/javascript",
  json: "application/json",
};


interface ServerOptions {
  publicDir?: string | null;
  staticDir?: string | null;
  mediaDir?: string | null;
}

/**
 * Represents the context object used in the application, providing access to
 * the request, response, and other utilities for handling HTTP interactions.
 */
interface Context {
  /**
   * The incoming HTTP request object.
   */
  req: IncomingMessage;

  /**
   * The outgoing HTTP response object.
   */
  res: ServerResponse;

  /**
   * A record of route parameters extracted from the URL.
   */
  params: Record<string, string>;

  /**
   * A record of query parameters from the URL.
   */
  query: Record<string, string>;

  /**
   * The parsed body of the HTTP request.
   */
  body: any;

  /**
   * The current HTTP status code.
   */
  statusCode: StatusCodes[keyof StatusCodes];

  /**
   * Sets the HTTP status code for the response.
   * @param code - The HTTP status code to set.
   * @returns The current context object for chaining.
   */
  status: (code: StatusCodes[keyof StatusCodes]) => Context;

  /**
   * Sends a JSON response.
   * @param data - The data to send as a JSON response.
   */
  json: (data: any) => void;

  /**
   * Sends a plain text response.
   * @param data - The string data to send in the response.
   * @param contentType - Optional content type for the response. Defaults to "text/plain".
   */
  send: (data: string, contentType?: string) => void;
}

type handlerResult =  {
  body: JSON,
  status: number
}


export { StatusCodes, contentTypes, Context, ServerOptions, Route };