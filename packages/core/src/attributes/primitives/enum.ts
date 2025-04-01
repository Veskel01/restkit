import { Attribute, AttributeType } from '../root';

export interface EnumAttributeDef<
  TValues extends readonly [string, ...string[]]
> {
  values: TValues;
}

export class EnumAttribute<
  const TValues extends readonly [string, ...string[]]
> extends Attribute<
  AttributeType.ENUM,
  TValues[number],
  EnumAttributeDef<TValues>
> {
  public constructor(values: TValues) {
    super({
      type: AttributeType.ENUM,
      def: {
        values
      }
    });
  }
}

export function enumerable<
  const TValues extends readonly [string, ...string[]]
>(...values: TValues): EnumAttribute<TValues> {
  return new EnumAttribute(values);
}
