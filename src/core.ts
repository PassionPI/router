import { LRU } from "@passion_pi/fp";

const PARAM = ":";
const WILDCARD = "*";
const SYMBOL = {
  [PARAM]: Symbol(),
  [WILDCARD]: Symbol(),
};

type Path = `${string}`;
type Item<T> = {
  value?: T;
  alias?: string;
  child: Map<string | symbol, Item<T>>;
};

const split = (path: Path) => path.split("/").slice(1);
const parse = (path: string[]) =>
  path.map((part) => {
    const sign = part[0] as keyof typeof SYMBOL;
    if (PARAM == sign || WILDCARD == sign) {
      return { part: SYMBOL[sign], alias: part.slice(1) };
    }
    return { part };
  });

const statics = (path: Path) => {
  for (let part of split(path)) {
    const sign = part[0] as keyof typeof SYMBOL;
    if (PARAM == sign || WILDCARD == sign) {
      return false;
    }
  }
  return true;
};

const createRadix = <T>(config?: { lruSize?: number }) => {
  type ShouldReturn = {
    path: string;
    value?: T;
    params: Record<string, string>;
  };

  const map = new Map<string, T>();
  const lru = LRU<string, ShouldReturn>(config?.lruSize || 100);
  const root: Item<T>["child"] = new Map();
  const initial = (): ShouldReturn => ({
    path: "",
    params: {},
  });

  const set = (path: Path, produce: (prevValue?: T) => T): boolean => {
    if (statics(path)) {
      map.set(path, produce(map.get(path)));
      return true;
    }
    let prev;
    let node = root;
    let parts = parse(split(path));
    for (let i = 0; i < parts.length; i++) {
      let { part, alias } = parts[i];
      let x = node.get(part);
      if (!x) {
        x = { alias, child: new Map() };
        node.set(part, x);
      }
      prev = x;
      node = x.child;
    }
    if (prev) {
      prev.value = produce(prev.value);
      return true;
    }
    return false;
  };

  const get = (path: Path): ShouldReturn => {
    if (map.has(path)) {
      return {
        path,
        value: map.get(path),
        params: {},
      };
    }

    if (lru.has(path)) {
      return lru.get(path)!;
    }

    let node = root;
    let current = "";

    let acc = initial();
    let back = initial();
    let parts = split(path);

    for (let i = 0; i < parts.length; i++) {
      let part = parts[i];

      current = `${current}/${part}`;

      let item = node.get(part) || node.get(SYMBOL[PARAM]);
      let wild = node.get(SYMBOL[WILDCARD]);

      if (wild) {
        back.path = current;
        back.value = wild.value;
        back.params = { ...acc.params };
        back.params[wild.alias!] = `/${part}${path.split(part).pop() || ""}`;
      }

      if (!item) {
        lru.set(path, back);
        return back;
      }

      acc.path = current;
      acc.value = item.value;
      if (item.alias != null) {
        acc.params[item.alias] = part;
      }

      if (item.child.size == 0) {
        break;
      }

      node = item.child;
    }

    const result = acc.value != null ? acc : back;

    lru.set(path, result);
    return result;
  };

  return {
    set,
    get,
    lru,
  };
};

type Radix<T> = ReturnType<typeof createRadix<T>>;

export { createRadix };
export type { Path, Radix };
