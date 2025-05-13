import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import CustomError from '../../shared/utils/customError';
import { apiKeyService } from '../../controllers/apiKey/services';
import { verifyToken } from '../../shared/utils/jwt';
import * as userRepository from '../../controllers/auth/repository';

/**
 * Middleware to check if user is authenticated via JWT
 */
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First check for session authentication
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }

    // If not using session, check for JWT in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract the token
      const token = authHeader.split(' ')[1];

      // Verify the token
      const payload = verifyToken(token);

      // Get the user
      const user = await userRepository.findUserById(payload.userId);

      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Attach user to request
      req.user = user;

      return next();
    }

    // No valid authentication found
    throw new CustomError('Not authenticated', 401);
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    }
    return next(new CustomError('Authentication failed', 401));
  }
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
    const validApiKey = await apiKeyService.validateApiKey(apiKey, ipAddress);

    if (!validApiKey) {
      throw new CustomError('Invalid API key', 401);
    }

    // Attach API key to request
    req.apiKey = validApiKey;

    next();
  } catch (error) {
    next(error);
  }
};
