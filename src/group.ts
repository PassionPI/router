import { createRadix, Path, Radix } from "./core";

type GroupPart<NodeValue, BaseValue = NodeValue> = {
  set(
    path: Path,
    produce: (
      basePath: Path | "",
      baseValue: BaseValue,
      prevNodeValue?: NodeValue | undefined
    ) => NodeValue
  ): boolean;
  group(
    basePath: Path,
    baseValue: (prevBase: BaseValue) => BaseValue
  ): GroupPart<NodeValue, BaseValue>;
  rebase(produce: (prevBase: BaseValue) => BaseValue): void;
};

type Group<NodeValue, BaseValue = NodeValue> = Omit<Radix<NodeValue>, "set"> &
  GroupPart<NodeValue, BaseValue>;

const createBase = <NodeValue, BaseValue = NodeValue>(
  root: Radix<NodeValue>,
  basePath: Path,
  baseValue: BaseValue
): GroupPart<NodeValue, BaseValue> => {
  type Part = GroupPart<NodeValue, BaseValue>;
  const prefix = (
    basePath.slice(-1) == "/" ? basePath.slice(0, -1) : basePath
  ) as Path | "";

  const set: Part["set"] = (path, produce) => {
    return root.set(`${prefix}${path}`, (prevNodeValue) =>
      produce(prefix, baseValue, prevNodeValue)
    );
  };

  const group: Part["group"] = (basePath, nextBase) => {
    return createBase(root, `${prefix}${basePath}`, nextBase(baseValue));
  };

  const rebase: Part["rebase"] = (produce) => {
    baseValue = produce(baseValue);
  };

  return {
    set,
    group,
    rebase,
  };
};

const createGroup = <NodeValue, BaseValue = NodeValue>(
  baseValue: BaseValue
): Group<NodeValue, BaseValue> => {
  const rdx = createRadix<NodeValue>();
  const app = createBase(rdx, "/", baseValue);

  return {
    ...rdx,
    ...app,
  };
};

export { createGroup };
export type { Group, GroupPart };
