import {
  type AnyAttribute,
  Attribute,
  AttributeType,
  type InferAttributeOutput
} from './attribute';

export interface TupleAttributeDef<
  T extends [AnyAttribute, ...AnyAttribute[]]
> {
  items: T;
}

export type InferTupleAttributeItems<
  T extends [AnyAttribute, ...AnyAttribute[]]
> = {
  [K in keyof T]: InferAttributeOutput<T[K]>;
};

export class TupleAttribute<
  T extends [AnyAttribute, ...AnyAttribute[]]
> extends Attribute<
  AttributeType.Tuple,
  InferTupleAttributeItems<T>,
  TupleAttributeDef<T>
> {
  public constructor(items: T) {
    super({ def: { items }, type: AttributeType.Tuple });
  }

  /**
   * Get a specific element from the tuple by index
   */
  public element<K extends keyof T>(index: K): T[K] {
    return this._def.items[index];
  }

  /**
   * Add an attribute to the end of the tuple
   */
  public append<A extends AnyAttribute>(item: A): TupleAttribute<[...T, A]> {
    const newItems = [...this._def.items, item] as [...T, A];
    return new TupleAttribute(newItems);
  }

  /**
   * Add an attribute to the beginning of the tuple
   */
  public prepend<A extends AnyAttribute>(item: A): TupleAttribute<[A, ...T]> {
    const newItems = [item, ...this._def.items] as [A, ...T];
    return new TupleAttribute(newItems);
  }
}

export function tuple<T extends [AnyAttribute, ...AnyAttribute[]]>(
  ...items: T
): TupleAttribute<T> {
  return new TupleAttribute(items);
}
