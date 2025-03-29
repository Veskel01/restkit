import { Attribute, AttributeType } from './attribute';

export class DateAttribute extends Attribute<AttributeType.Date, Date> {
  public constructor() {
    super({ def: {}, type: AttributeType.Date });
  }
}

export function date(): DateAttribute {
  return new DateAttribute();
}
