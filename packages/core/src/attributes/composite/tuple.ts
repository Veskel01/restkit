import {
  type AnyAttribute,
  Attribute,
  AttributeType,
  type InferAttributeOutput
} from '../root';

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
  AttributeType.TUPLE,
  InferTupleAttributeItems<T>,
  TupleAttributeDef<T>
> {
  public constructor(items: T) {
    super({ def: { items }, type: AttributeType.TUPLE });
  }

  public element<K extends keyof T>(index: Exclude<K, keyof unknown[]>): T[K] {
    return this._def.items[index];
  }

  public override<TNewItem extends AnyAttribute>(
    itemType: TNewItem
  ): TupleAttribute<[...T, TNewItem]> {
    return new TupleAttribute([...this._def.items, itemType]);
  }
}

export function tuple<T extends [AnyAttribute, ...AnyAttribute[]]>(
  ...items: T
): TupleAttribute<T> {
  return new TupleAttribute(items);
}
