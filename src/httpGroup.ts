import { onion } from "@passion_pi/fp";
import { Path } from "./core";
import { createGroup, GroupPart } from "./group";

type Handler<Ctx, Return> = (
  ctx: Ctx,
  next: () => Promise<Return> | Return
) => Promise<Return> | Return;

enum HttpMethod {
  GET = "GET",
  PUT = "PUT",
  POST = "POST",
  HEAD = "HEAD",
  PATCH = "PATCH",
  TRACE = "TRACE",
  DELETE = "DELETE",
  OPTIONS = "OPTIONS",
  CONNECT = "CONNECT",
}

type HttpMethodHandler<Ctx, Return> = Record<
  HttpMethod,
  (path: Path, ...fns: Handler<Ctx, Return>[]) => void
>;

type NodeValue<Ctx, Return> = Record<HttpMethod, Handler<Ctx, Return>[]>;

type Engin<Ctx, Return> = {
  use(...fns: Handler<Ctx, Return>[]): void;
  any(path: Path, ...fns: Handler<Ctx, Return>[]): void;
  group(path: Path, ...fns: Handler<Ctx, Return>[]): Engin<Ctx, Return>;
  handler(method: HttpMethod, path: Path, ...fns: Handler<Ctx, Return>[]): void;
} & HttpMethodHandler<Ctx, Return>;

const createEngin = <Ctx, Return>(
  part: GroupPart<NodeValue<Ctx, Return>, Handler<Ctx, Return>[]>
): Engin<Ctx, Return> => {
  type NewEngin = Engin<Ctx, Return>;

  const use: NewEngin["use"] = (...fns) => {
    part.rebase((mids) => [...mids, ...fns]);
  };

  const group: NewEngin["group"] = (path, ...fns) => {
    return createEngin(part.group(path, (mids) => [...mids, ...fns]));
  };

  const handler: NewEngin["handler"] = (method, path, ...fns) => {
    part.set(path, (prefix, mids, prev) => {
      if (prev == null) {
        prev = {} as NodeValue<Ctx, Return>;
      }
      if (prev[method]) {
        throw new Error(`Route ${method} ${prefix}${path} already exists`);
      }
      prev[method] = [...mids, ...fns];
      return prev;
    });
  };

  const METHODS = Object.values(HttpMethod).reduce((acc, method) => {
    acc[method] = (path, ...fns) => handler(method, path, ...fns);
    return acc;
  }, {} as HttpMethodHandler<Ctx, Return>);

  const any: NewEngin["any"] = (path, ...fns) => {
    Object.values(METHODS).forEach((method) => method(path, ...fns));
  };

  return {
    use,
    any,
    group,
    handler,
    ...METHODS,
  };
};

type BaseCtx = { pathname: string; method: HttpMethod };

const bindHttpRouter = <
  Inputs extends unknown[],
  Ctx extends BaseCtx,
  Return = void
>(config: {
  createCtx: (...input: Inputs) => Ctx;
  404: (ctx: Ctx) => Return;
  500: (ctx: Ctx, error: Error) => Return;
}) => {
  const group = createGroup<NodeValue<Ctx, Return>, Handler<Ctx, Return>[]>([]);
  const engin = createEngin<Ctx, Return>(group);
  const match = (method: string, path: Path) =>
    group.get(path)?.value?.[method as HttpMethod];

  const callback = async (...input: Inputs): Promise<Return> => {
    const ctx = config.createCtx(...input);
    const value = match(ctx.method, ctx.pathname);
    if (value) {
      try {
        return await onion(...value)(ctx);
      } catch (e) {
        return config[500](
          ctx,
          e instanceof Error
            ? e
            : Error(typeof e == "string" ? e : JSON.stringify(e))
        );
      }
    }
    return config[404](ctx);
  };

  return { ...engin, lru: group.lru, match, callback };
};

export { bindHttpRouter };
export type { BaseCtx, Engin, Handler, HttpMethod };
