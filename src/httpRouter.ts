import { Server, ServerOptions, ServerRequest } from "srvx";
import { serve as serveBun } from "srvx/bun";
import { serve as serveDeno } from "srvx/deno";
import { serve as serveNode } from "srvx/node";

import { BaseCtx, bindHttpRouter, HttpMethod } from "./httpGroup";
import { memo } from "./utils";

type RequestCtx<T extends object = object> = BaseCtx & {
  request: ServerRequest;
  url: URL;
  json: <T extends unknown>() => Promise<T>;
  text: () => Promise<string>;
  blob: () => Promise<Blob>;
  bytes: () => Promise<Uint8Array>;
  formData: () => Promise<FormData>;
  arrayBuffer: () => Promise<ArrayBuffer>;
  store: T;
};

type Handler<T extends object = object> = (
  ctx: RequestCtx<Partial<T>>,
  next: () => Promise<Response>
) => Promise<Response>;

const createCtx = <T extends object = object>(
  request: ServerRequest
): RequestCtx<T> => {
  const url = new URL(request.url);
  const mem = memo(request);
  return {
    pathname: url.pathname,
    method: request.method as HttpMethod,
    request,
    url,
    json: mem("json", () => request.json()),
    text: mem("text", () => request.text()),
    blob: mem("blob", () => request.blob()),
    bytes: mem("bytes", () => request.bytes()),
    formData: mem("formData", () => request.formData()),
    arrayBuffer: mem("arrayBuffer", () => request.arrayBuffer()),
    store: {} as T, // Initialize store as an empty object
  };
};

const _createHttpRouter =
  (adapter: (options: ServerOptions) => Server) =>
  <T extends object = object>() => {
    const app = bindHttpRouter<
      [ServerRequest],
      RequestCtx<Partial<T>>,
      Response
    >({
      createCtx,
      404: (_) => new Response("Not Found", { status: 404 }),
      500: (_, error) => new Response(error.message, { status: 500 }),
    });
    return {
      app,
      run: (options?: Omit<ServerOptions, "fetch">) =>
        adapter({
          ...options,
          fetch: app.callback,
        }),
    };
  };

const createHttpRouter = _createHttpRouter(serveNode);
const createHttpRouterByBun = _createHttpRouter(serveBun);
const createHttpRouterByDeno = _createHttpRouter(serveDeno);

export { createHttpRouter, createHttpRouterByBun, createHttpRouterByDeno };
export type { Handler, RequestCtx };
