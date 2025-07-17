const weak = new WeakMap();

type AnyFn = (...args: any[]) => any;

export const memo =
  (request: Request) =>
  <T extends AnyFn>(key: string, fn: T): T =>
    ((...args) => {
      if (!weak.has(request)) {
        const map = new Map<string, ReturnType<T>>();
        map.set(key, fn(...args));
        weak.set(request, map);
      }
      return weak.get(request)!.get(key);
    }) as T;
