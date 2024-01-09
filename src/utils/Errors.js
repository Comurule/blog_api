/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
class BaseError extends Error {
  constructor(message, status) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
  }

  toJSON() {}
}

class AppError extends BaseError {
  constructor(message, status = 400) {
    super(message, status);
  }

  toJSON() {
    return {
      status: 'error',
      message: this.message,
    };
  }
}

class ServerError extends BaseError {
  constructor(message, stacktrace = null, status = 500) {
    super(message, status);

    if (stacktrace) this.stack = stacktrace;
  }

  toJSON(env = '') {
    return {
      status: 'fail',
      message: this.message,
      stack: env === 'production' ? undefined : this.stack,
    };
  }
}

class ResourceConflictError extends AppError {
  constructor(message, status = 409) {
    super(message, status);
  }
}

class ResourceNotFoundError extends AppError {
  constructor(message, status = 404) {
    super(message, status);
  }
}

class ForbiddenError extends AppError {
  constructor(message, status = 403) {
    super(message, status);
  }
}

class UnauthorizedError extends AppError {
  constructor(message, status = 401) {
    super(message, status);
  }
}

class UnprocessibleError extends AppError {
  constructor(message, status = 422) {
    super(message, status);
  }
}

class TooManyRequestError extends AppError {
  constructor(message, status = 429) {
    super(message, status);
  }
}

module.exports = {
  AppError,
  ServerError,
  ResourceConflictError,
  ResourceNotFoundError,
  ForbiddenError,
  UnauthorizedError,
  UnprocessibleError,
  TooManyRequestError,
};
