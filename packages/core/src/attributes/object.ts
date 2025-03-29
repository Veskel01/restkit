import {
  type AnyAttribute,
  Attribute,
  AttributeType,
  type InferAttributeOutput
} from './attribute';

export interface ObjectAttributeDef<
  TShape extends Record<string, AnyAttribute>
> {
  shape: TShape;
}

export type InferObjectAttributeShape<
  TShape extends Record<string, AnyAttribute>
> = {
  [K in keyof TShape]: InferAttributeOutput<TShape[K]>;
};

export class ObjectAttribute<
  TShape extends Record<string, AnyAttribute>
> extends Attribute<
  AttributeType.Object,
  InferObjectAttributeShape<TShape>,
  ObjectAttributeDef<TShape>
> {
  public constructor(shape: TShape) {
    super({ def: { shape }, type: AttributeType.Object });
  }

  /**
   * Extends the object with additional properties
   */
  public extend<TExtend extends Record<string, AnyAttribute>>(
    extend: TExtend
  ): ObjectAttribute<TShape & TExtend> {
    const newShape = { ...this._def.shape, ...extend };
    return new ObjectAttribute(newShape);
  }

  /**
   * Pick specific properties from the object
   */
  public pick<K extends keyof TShape>(
    keys: readonly K[]
  ): ObjectAttribute<Pick<TShape, K>> {
    const newShape = {} as Pick<TShape, K>;
    for (const key of keys) {
      newShape[key] = this._def.shape[key];
    }
    return new ObjectAttribute(newShape);
  }

  /**
   * Omit specific properties from the object
   */
  public omit<K extends keyof TShape>(
    keys: readonly K[]
  ): ObjectAttribute<Omit<TShape, K>> {
    const newShape = { ...this._def.shape } as Omit<TShape, K>;
    for (const key of keys) {
      delete newShape[key as unknown as keyof Omit<TShape, K>];
    }
    return new ObjectAttribute(newShape);
  }
}

export function object<TShape extends Record<string, AnyAttribute>>(
  shape: TShape
): ObjectAttribute<TShape> {
  return new ObjectAttribute(shape);
}
