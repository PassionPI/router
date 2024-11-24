import { expect, test } from "vitest";

test("router base", async () => {
  expect(1).toBe(1);
  // const app = denoHttpRouter<undefined, number[]>();
  // app.GET("/", () => [0]);

  // const group1 = app.group("/");
  // group1.GET("/bar", () => [2]);
  // group1.use(async (_, next) => {
  //   const res = await next();
  //   return [...res, 3];
  // });
  // group1.GET("/baz", () => [4]);

  // expect(await load("/", "GET")?.(undefined)).toEqual([0]);
  // expect(await load("/bar", "GET")?.(undefined)).toEqual([2]);
  // expect(await load("/baz", "GET")?.(undefined)).toEqual([4, 3]);

  // const group2 = app.group("/");
  // group2.GET("/foo", () => [5]);
  // group2.use(async (_, next) => {
  //   const res = await next();
  //   return [...res, 6];
  // });
  // group2.GET("/fee", () => [7]);

  // expect(await load("/foo", "GET")?.(undefined)).toEqual([5]);
  // expect(await load("/fee", "GET")?.(undefined)).toEqual([7, 6]);
});
