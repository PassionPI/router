// deno run -A --watch --unstable-sloppy-imports ./test/gin/deno.ts
import { createHttpRouterByDeno } from "../../src/index";

const { app, run } = createHttpRouterByDeno<{ a: string }>();

app.use((ctx, next) => {
  ctx.store.a = " Hi Deno!";
  return next();
});

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
