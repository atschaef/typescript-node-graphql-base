import { AnyObject } from '../types/app.types'
import { ErrorType } from '../types/app.enums'

export class AppError extends Error {
  constructor(message: string, name: ErrorType, code: number, context: AnyObject = {}) {
    super()

    this.message = message
    this.name = name
    this.code = code
    this.context = context
  }

  code: number
  context: any
  msg: string

  get message() {
    return this.msg
  }

  set message(value) {
    this.msg = value
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, context?: AnyObject) {
    super(message, ErrorType.BadRequest, 400, context)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, context?: AnyObject) {
    super(message, ErrorType.Unauthorized, 401, context)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, context?: AnyObject) {
    super(message, ErrorType.NotFound, 404, context)
  }
}

/* istanbul ignore next */
export class ForbiddenError extends AppError {
  constructor(message: string, context?: AnyObject) {
    super(message, ErrorType.Forbidden, 403, context)
  }
}

/* istanbul ignore next */
export class InternalError extends AppError {
  constructor(message: string, context?: AnyObject) {
    super(message, ErrorType.InternalError, 500, context)
  }
}

export class ExternalError extends AppError {
  constructor(message: string, context?: AnyObject) {
    super(message, ErrorType.ExternalError, 500, context)
  }
}

export class UnavailableForLegalReasons extends AppError {
  constructor(message: string) {
    super(message, ErrorType.UnavailableForLegalReasons, 451, {})
  }
}
