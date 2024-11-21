import { createRadix } from "@/index";
import { expect, test } from "vitest";

test("radix base", () => {
  const tree = createRadix<number>();
  tree.set("/", () => 0);
  tree.set("/foo", () => 1);
  tree.set("/foo/bar", () => 2);
  tree.set("/foo/bar/baz", () => 3);
  expect(tree.get("/")?.value).toBe(0);
  expect(tree.get("/foo")?.value).toBe(1);
  expect(tree.get("/foo/bar")?.value).toBe(2);
  expect(tree.get("/foo/bar/baz")?.value).toBe(3);
  const ok = tree.set("/foo/bar/baz", (prev) => {
    expect(prev).toBe(3);
    return 4;
  });
  expect(ok).toBe(true);
  expect(tree.get("/foo/bar/baz")?.value).toBe(4);
});

test("radix with empty value path", () => {
  const tree = createRadix<number>();
  tree.set("/foo", () => 1);
  tree.set("/foo/bar/baz", () => 3);
  expect(tree.get("/foo")?.value).toBe(1);
  expect(tree.get("/foo/bar")?.value).toBe(undefined);
  expect(tree.get("/foo/bar/baz")?.value).toBe(3);
  expect(tree.get("/foo/bar/baz/bay")?.value).toBe(undefined);
});

test("radix with empty value path", () => {
  const tree = createRadix<number>();
  expect(tree.get("/foo")?.value).toBe(undefined);
  expect(tree.get("/foo/bar")?.value).toBe(undefined);
  expect(tree.get("/foo/bar/baz")?.value).toBe(undefined);
  expect(tree.get("/foo/bar/baz/bay")?.value).toBe(undefined);
});

test("radix param", () => {
  const tree = createRadix<number>();
  tree.set("/foo/goo", () => 0);
  tree.set("/foo/:bar", () => 1);
  tree.set("/foo/:bar/baz", () => 2);
  tree.set("/foo/:bar/baz/:bay", () => 3);
  tree.set("/:foo/:bar/baz/:bay", () => 4);
  expect(tree.get("/foo")?.value).toBe(undefined);
  expect(tree.get("/foo/goo")?.value).toBe(0);
  expect(tree.get("/foo/bar")?.value).toBe(1);
  expect(tree.get("/foo/bar/baz")?.value).toBe(2);
  expect(tree.get("/foo/bar/baz/bay")?.value).toBe(3);
  expect(tree.get("/xxx/bar/baz/bay")?.value).toBe(4);
  expect(tree.get("/foo/bar")?.params).toEqual({ bar: "bar" });
  expect(tree.get("/foo/bar/baz")?.params).toEqual({ bar: "bar" });
  expect(tree.get("/foo/bar/baz/bay")?.params).toEqual({
    bar: "bar",
    bay: "bay",
  });
  expect(tree.get("/xxx/bar/baz/bay")?.params).toEqual({
    foo: "xxx",
    bar: "bar",
    bay: "bay",
  });
});

test("radix wild", () => {
  const tree = createRadix<number>();
  tree.set("/foo/*bar", () => 1);
  tree.set("/:foo/*bar", () => 1);
  tree.set("/foo/:bar/baz", () => 2);
  expect(tree.get("/foo")?.value).toBe(undefined);
  expect(tree.get("/foo/bar")?.value).toEqual(1);
  expect(tree.get("/foo/bar/baz")?.value).toEqual(2);
  expect(tree.get("/foo/bar")?.params).toEqual({ bar: "/bar" });
  expect(tree.get("/foo/bar/baz")?.params).toEqual({ bar: "bar" });
  expect(tree.get("/xxx/bbb/baz")?.params).toEqual({
    foo: "xxx",
    bar: "/bbb/baz",
  });
});

test("radix with empty value path", () => {
  const tree = createRadix<number>();
  expect(tree.get("/foo")?.value).toBe(undefined);
  expect(tree.get("/foo/bar")?.value).toBe(undefined);
  expect(tree.get("/foo/bar/baz")?.value).toBe(undefined);
  expect(tree.get("/foo/bar/baz/bay")?.value).toBe(undefined);
});
