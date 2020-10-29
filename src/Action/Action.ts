import InputSource from './InputSource';
import StringUnion from '../utils/StringUnion';
import { isUnsignedInteger } from '../utils/utils';
import { InvalidArgument } from '../Error/errors';
import { ELEMENT } from '../constants/constants';

export default class Action {
  readonly id: string;

  readonly type: typeof Action.TYPES.type;

  readonly subtype:
    | typeof Action.NULL_SUBTYPES.type
    | typeof Action.KEY_SUBTYPES.type
    | typeof Action.POINTER_SUBTYPES.type;

  // pause action properties
  private _duration = 0;

  // key action properties
  private _value = '\0';

  // pointer action properties
  pointerType: typeof InputSource.POINTER_SUBTYPES.type = 'mouse';

  origin: 'viewport' | 'pointer' | { [ELEMENT]: string } = 'viewport';

  private _button = 0;

  private _x = 0;

  private _y = 0;

  constructor(id: string, type: Action['type'], subtype: Action['subtype']) {
    this.id = id;
    this.type = type;
    this.subtype = subtype;
  }

  get duration(): number {
    return this._duration;
  }

  set duration(value: number) {
    if (!isUnsignedInteger(value))
      throw new InvalidArgument(
        `Duration must be an unsigned integer. Received: ${value}`,
      );
    this._duration = value;
  }

  get value(): string {
    return this._value;
  }

  set value(value: string) {
    if (value.length !== 1)
      throw new InvalidArgument(
        `Key must be a single unicode point. Received: ${value}`,
      );
    this._value = value;
  }

  get button(): number {
    return this._button;
  }

  set button(value: number) {
    if (!isUnsignedInteger(value))
      throw new InvalidArgument(
        `Button must be an unsigned integer. Received: ${value}`,
      );
    this._button = value;
  }

  get x(): number {
    return this._x;
  }

  set x(value: number) {
    if (!isUnsignedInteger(value))
      throw new InvalidArgument(
        `Position x must be an unsigned integer. Received: ${value}`,
      );
    this._x = value;
  }

  get y(): number {
    return this._y;
  }

  set y(value: number) {
    if (!isUnsignedInteger(value))
      throw new InvalidArgument(
        `Position y must be an unsigned integer. Received: ${value}`,
      );
    this._y = value;
  }

  static TYPES = InputSource.TYPES;

  static NULL_SUBTYPES = StringUnion('pause');

  static KEY_SUBTYPES = StringUnion('pause', 'keyDown', 'keyUp');

  static POINTER_SUBTYPES = StringUnion(
    'pause',
    'pointerDown',
    'pointerUp',
    'pointerMove',
    'pointerCancel',
  );
}
