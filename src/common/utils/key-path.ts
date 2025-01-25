export type KeyPaths<T> = T extends object
  ? {
      [K in keyof Required<T>]: `${Exclude<K, symbol>}${
        | ""
        | (Required<T>[K] extends Array<infer U>
            ? ""
            : Required<T>[K] extends object
            ? `.${KeyPaths<Required<T>[K]>}`
            : "")}`;
    }[keyof T]
  : "";

export type KeyPathValue<KeyPath, Obj> =
  KeyPath extends `${infer K}.${infer Rest}`
    ? K extends keyof Obj
      ? KeyPathValue<Rest, Obj>
      : never
    : KeyPath extends keyof Obj
    ? Obj[KeyPath]
    : never;

export const getNestedValue = <T>(obj: T, path?: string): any => {
  return path
    ? path.split(".").reduce((acc: any, part: string) => acc && acc[part], obj)
    : obj;
};

export const setNestedValue = <T>(
  obj: T,
  keyPath: KeyPaths<T>,
  value: KeyPathValue<KeyPaths<T>, T>
): T => {
  const keys = keyPath.split(".");
  const lastKey = keys.pop();
  let newObj = obj;
  let ref = newObj;
  keys.forEach((key) => {
    ref = ref[key];
  });
  ref[lastKey] = value;
  return newObj;
};
