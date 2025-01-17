class BaseError extends Error {
  get name() {
    return this.constructor.name;
  }
}

class UserFacingError extends BaseError {
  constructor(msg: string, options = {}) {
    super(msg);
  }
  get statusCode() {
    return 400;
  }
}

class UnauthorizedError extends BaseError {
  constructor(msg: string, options = {}) {
    super(msg);
    console.log("Making UnauthorizedError with msg: ", msg);
  }
  get statusCode() {
    return 401;
  }
}

export { UserFacingError, UnauthorizedError };
