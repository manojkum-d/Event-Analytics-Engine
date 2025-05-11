/**
 * Custom error class that extends the built-in Error class.
 * Provides a status code and operational flag for error handling.
 */
export default class CustomError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(`${message} (Status Code: ${statusCode})`);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capture stack trace and exclude constructor from it for cleaner stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}
