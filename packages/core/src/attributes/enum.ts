import { Attribute, AttributeType } from './attribute';

export interface EnumAttributeDef<
  TValues extends readonly [string, ...string[]]
> {
  values: TValues;
}

export class EnumAttribute<
  const TValues extends readonly [string, ...string[]]
> extends Attribute<
  AttributeType.Enum,
  TValues[number],
  EnumAttributeDef<TValues>
> {
  public constructor(values: TValues) {
    super({
      type: AttributeType.Enum,
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
