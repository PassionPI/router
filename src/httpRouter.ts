import { IncomingMessage, ServerResponse } from "node:http";
import { BaseCtx, bindHttpRouter, HttpMethod } from "./httpGroup";

type CtxDeno = BaseCtx & {
  request: Request;
  url: URL;
};

const denoHttpRouter = () =>
  bindHttpRouter<[Request], CtxDeno, Response>({
    createCtx: (request) => {
      const url = new URL(request.url);
      return {
        pathname: url.pathname,
        method: request.method as HttpMethod,
        request,
        url,
      };
    },
    404: (_) => new Response("Not Found", { status: 404 }),
    500: (_, error) => new Response(error.message, { status: 500 }),
  });

type CtxNode = BaseCtx & {
  req: IncomingMessage;
  res: ServerResponse<IncomingMessage>;
};

const nodeHttpRouter = () =>
  bindHttpRouter<[CtxNode["req"], CtxNode["res"]], CtxNode>({
    createCtx: (req, res) => {
      return {
        pathname: req.url || "/",
        method: req.method as HttpMethod,
        req,
        res,
      };
    },
    404: (ctx) => ctx.res.end("Not Found"),
    500: (ctx, error) => ctx.res.end(error.message),
  });

export { denoHttpRouter };
export type { CtxDeno };

export { nodeHttpRouter };
export type { CtxNode };
