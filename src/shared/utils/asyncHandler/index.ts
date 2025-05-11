import { NextFunction, Request, Response } from 'express';

/**
 * Async handler for Express controllers.
 * Catches errors and passes them to the next middleware.
 * Logs errors with the controller name.
 */
export const asyncHandler = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<any>,
  controllerName: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error: any) {
      console.error(`Got error from controller controllerName ${controllerName}: `, error);

      (error as any).controller = controllerName;
      next(error);
    }
  };
};
