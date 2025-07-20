// deno run -A --watch --unstable-sloppy-imports ./test/gin/deno.ts
import { createHttpRouterByDeno, Handler } from "../../src/index";

type Store = {
  a: string;
};
type HttpHandler = Handler<Store>;
const { app, run } = createHttpRouterByDeno<Store>();
const mid: HttpHandler = (ctx, next) => {
  ctx.store.a = " Hi Deno!";
  return next();
};
app.use(mid);

app.GET("/", (ctx) => {
  return new Response("Hello Deno!" + ctx.store.a);
});

app.any("/*", (ctx) => {
  return new Response(
    `Not Found! Path: ${ctx.pathname}, Method: ${ctx.method}`,
    {
      status: 404,
    }
  );
});

run();
