// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import CustomError from '../../shared/utils/customError/index';
import * as apiKeyRepository from '../../repositories/apiKey/index';

/*
 * Middleware to check if user is authenticated via session
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated()) {
    return next();
  }

  throw new CustomError('Not authenticated', 401);
};

/**
 * Middleware to validate API key for analytics endpoints
 */
export const validateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new CustomError('API key is required', 401);
    }

    // Get client IP address
    const ipAddress = ((req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress)
      ?.split(',')[0]
      .trim();

    // Validate the API key
    const validApiKey = await apiKeyRepository.validateApiKey(apiKey, ipAddress);

    // Attach API key to request
    req.apiKey = validApiKey;

    next();
  } catch (error) {
    next(error);
  }
};
