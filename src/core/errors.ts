export class HttpError extends Error {
  public status: number;
  public source: string;

  constructor(message: string, source: string, status: number = 500) {
    super(message);
    this.source = source;
    this.status = status;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
