const PARAM = ":";
const WILDCARD = "*";
const SYMBOL = {
  [PARAM]: Symbol(),
  [WILDCARD]: Symbol(),
};

type Path = `/${string}`;
type Item<T> = {
  value?: T;
  alias?: string;
  children: Record<string | symbol, Item<T>>;
};

const split = (path: Path) => path.split("/").slice(1);
const parse = (path: string[]) =>
  path.map((part) => {
    const sign = part[0] as keyof typeof SYMBOL;
    if ([PARAM, WILDCARD].includes(sign)) {
      return { part: SYMBOL[sign], alias: part.slice(1) };
    }
    return { part };
  });

const createRadix = <T>() => {
  type ShouldReturn = {
    path: string;
    value?: T;
    params?: Record<string, string>;
  };

  const root: Item<T>["children"] = {};
  const initial = (): ShouldReturn => ({
    path: "",
  });
  return {
    set(path: Path, produce: (prevValue?: T) => T): boolean {
      let prev;
      let node = root;
      for (let { part, alias } of parse(split(path))) {
        let x = node[part];
        if (!x) {
          x = { alias, children: {} };
          node[part] = x;
        }
        prev = x;
        node = x.children;
      }
      if (prev) {
        prev.value = produce(prev.value);
        return true;
      }
      return false;
    },
    get(path: Path): ShouldReturn {
      const update = (
        shouldUpdate: ShouldReturn,
        match: Item<T>,
        param: string
      ) => {
        shouldUpdate.path = current;
        shouldUpdate.value = match.value;
        if (match.alias != null) {
          shouldUpdate.params ??= { ...shouldReturn?.params };
          shouldUpdate.params[match.alias] = param;
        }
      };

      let node = root;
      let current = "";

      let shouldReturn = initial();
      let backUp = initial();

      for (let part of split(path)) {
        current = `${current}/${part}`;

        let item = node[part] || node[SYMBOL[PARAM]];
        let wild = node[SYMBOL[WILDCARD]];

        if (wild) {
          update(backUp, wild, `/${part}${path.split(part).pop() || ""}`);
        }

        if (!item) {
          return backUp;
        }

        update(shouldReturn, item, part);
        node = item.children;
      }

      return shouldReturn.value != null ? shouldReturn : backUp;
    },
  };
};

type Radix<T> = ReturnType<typeof createRadix<T>>;

export { createRadix };
export type { Path, Radix };
