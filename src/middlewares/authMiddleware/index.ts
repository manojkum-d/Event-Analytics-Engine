import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import CustomError from '../../shared/utils/customError';
import { apiKeyService } from '../../controllers/apiKey/services';
import { verifyToken } from '../../shared/utils/jwt';
import * as userRepository from '../../controllers/auth/repository';
import DatabaseService from '../../shared/utils/db/databaseService';
import ApiKey from '../../shared/models/ApiKey';

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
    // Check for API key in different header formats (case-insensitive)
    const apiKey =
      req.header('X-API-Key') || req.header('x-api-key') || (req.headers['x-api-key'] as string);

    if (!apiKey) {
      throw new CustomError('API key is required', 401);
    }

    console.log('Validating API key:', apiKey); // For debugging

    // Get client IP address
    const ipAddress = ((req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress)
      ?.split(',')[0]
      .trim();

    // Directly query the database to verify the key exists and is active
    const validApiKey = await DatabaseService.findOne(ApiKey, {
      where: {
        key: apiKey,
        isActive: true,
      },
      attributes: ['id', 'key', 'appId', 'userId', 'isActive', 'expiresAt', 'ipRestrictions'],
    });

    if (!validApiKey) {
      console.log('API key not found in database'); // For debugging
      throw new CustomError('Invalid API key', 401);
    }

    // Check if key has expired
    if (validApiKey.expiresAt && new Date(validApiKey.expiresAt) < new Date()) {
      console.log('API key expired'); // For debugging
      throw new CustomError('API key has expired', 401);
    }

    // Check IP restrictions if applicable
    if (
      validApiKey.ipRestrictions &&
      Array.isArray(validApiKey.ipRestrictions) &&
      validApiKey.ipRestrictions.length > 0 &&
      ipAddress &&
      !validApiKey.ipRestrictions.includes(ipAddress)
    ) {
      console.log('IP address not allowed:', ipAddress); // For debugging
      throw new CustomError('Request from this IP address is not allowed', 403);
    }

    // Attach API key to request
    req.apiKey = validApiKey;

    console.log('API key validated successfully'); // For debugging
    next();
  } catch (error) {
    next(error);
  }
};
