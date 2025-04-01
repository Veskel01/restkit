import {
  type AnyAttribute,
  Attribute,
  AttributeType,
  type InferAttributeOutput
} from '../root';

export interface UnionAttributeDef<T extends AnyAttribute[]> {
  types: T;
}

export class UnionAttribute<T extends AnyAttribute[]> extends Attribute<
  AttributeType.UNION,
  InferAttributeOutput<T[number]>,
  UnionAttributeDef<T>
> {
  public constructor(types: T) {
    super({
      def: { types },
      type: AttributeType.UNION
    });
  }

  public extend<TNew extends AnyAttribute>(
    type: TNew
  ): UnionAttribute<[...T, TNew]> {
    return new UnionAttribute([...this._def.types, type]);
  }
}

export function union<T extends AnyAttribute[]>(
  ...types: T
): UnionAttribute<T> {
  return new UnionAttribute(types);
}
