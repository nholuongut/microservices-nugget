import { ErrorInterface } from '../../types/error/error.types';

const STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  UN_AUTHORISED: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

class BaseError extends Error {
  name: string;
  statusCode: number;

  constructor({ name, statusCode, description }: ErrorInterface) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this);
  }
}

// 500 Internal Error
class APIError extends BaseError {
  constructor(description = 'api error') {
    super({
      name: 'api internal server error',
      statusCode: STATUS_CODES.INTERNAL_ERROR,
      description,
    });
  }
}

// 400 Validation Error
class ValidationError extends BaseError {
  constructor(description = 'bad request') {
    super({
      name: 'bad request',
      statusCode: STATUS_CODES.BAD_REQUEST,
      description,
    });
  }
}

// 403 Authorize error
class AuthorizeError extends BaseError {
  constructor(description = 'access denied') {
    super({
      name: 'access denied',
      statusCode: STATUS_CODES.UN_AUTHORISED,
      description,
    });
  }
}

// 404 Not Found
class NotFoundError extends BaseError {
  constructor(description = 'not found') {
    super({
      name: 'not found',
      statusCode: STATUS_CODES.NOT_FOUND,
      description,
    });
  }
}

export { APIError, ValidationError, AuthorizeError, NotFoundError };
