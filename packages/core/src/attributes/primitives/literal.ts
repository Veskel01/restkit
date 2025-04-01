import { Attribute, AttributeType } from '../root';

export interface LiteralAttributeDef<T extends string> {
  literalValue: T;
}

export class LiteralAttribute<const T extends string> extends Attribute<
  AttributeType.STRING,
  T,
  LiteralAttributeDef<T>
> {
  public constructor(literalValue: T) {
    super({
      def: {
        literalValue
      },
      type: AttributeType.STRING
    });
  }
}

export function literal<T extends string>(
  literalValue: T
): LiteralAttribute<T> {
  return new LiteralAttribute(literalValue);
}
