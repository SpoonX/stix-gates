export class InvalidGateResultError extends TypeError {
  constructor(error: string) {
    super(error);

    // Set the prototype explicitly for some reason.
    Object.setPrototypeOf(this, InvalidGateResultError.prototype);
  }
}
