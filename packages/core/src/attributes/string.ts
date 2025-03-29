import { Attribute, AttributeType } from './attribute';

export class StringAttribute extends Attribute<AttributeType.String, string> {
  public constructor() {
    super({ def: {}, type: AttributeType.String });
  }
}

export function string(): StringAttribute {
  return new StringAttribute();
}
