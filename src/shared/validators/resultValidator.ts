import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import { validationResult, ValidationError } from 'express-validator';

/**
 * Validate the result of the validation chain
 */
export const validateResult = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages: string[] = errors.array().map((error: ValidationError) => error.msg);
    throw createError.UnprocessableEntity(errorMessages.join(', '));
  }

  next();
};
