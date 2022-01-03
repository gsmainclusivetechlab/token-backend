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
    return 409;
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

class NotFoundError extends BaseError {
  constructor(msg: string, options = {}) {
    super(msg);
  }
  get statusCode() {
    return 404;
  }
}

export { UserFacingError, UnauthorizedError, NotFoundError };