export type OmitKeys<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type DecrementDepth<T extends number> = T extends 0
  ? 0
  : T extends 1
    ? 0
    : T extends 2
      ? 1
      : T extends 3
        ? 2
        : T extends 4
          ? 3
          : T extends 5
            ? 4
            : 0;

export type RemoveNeverProperties<T extends object> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};
