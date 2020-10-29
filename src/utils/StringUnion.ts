// credit where it's due: https://stackoverflow.com/questions/36836011/checking-validity-of-string-literal-union-type-at-runtime/43621735
export default <UnionType extends string>(
  ...values: UnionType[]
): {
  guard: (value: unknown) => value is UnionType;
  check: (value: unknown) => UnionType;
  values: UnionType[];
} & {
  type: UnionType;
} => {
  Object.freeze(values);
  const valueSet: Set<string> = new Set(values);

  const guard = (value: unknown): value is UnionType => {
    return typeof value === 'string' && valueSet.has(value);
  };

  const check = (value: unknown): UnionType => {
    if (!guard(value)) {
      const actual = JSON.stringify(value);
      const expected = values.map(s => JSON.stringify(s)).join(' | ');
      throw new TypeError(
        `Value '${actual}' is not assignable to type '${expected}'.`,
      );
    }
    return value;
  };

  const unionNamespace = { guard, check, values };
  return Object.freeze(
    unionNamespace as typeof unionNamespace & {
      type: UnionType;
    },
  );
};
