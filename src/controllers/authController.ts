import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import * as userRepository from '../repositories/users/index.js';
import * as apiKeyRepository from '../repositories/apiKey/index.js';
import { asyncHandler } from '../shared/utils/asyncHandler/index.js';
import { httpResponse } from '../shared/utils/httpResponse/index.js';
import CustomError from '../shared/utils/customError/index.js';

/**
 * Initiate Google OAuth authentication
 */
export const googleAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })(req, res, next);
};

/**
 * Handle Google OAuth callback
 */
export const googleCallback = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', { session: true }, (err: any, user: any) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return next(new CustomError('Authentication failed', 401));
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }

        // Redirect to dashboard or success page
        return res.redirect('/api/v1/auth/success');
      });
    })(req, res, next);
  },
  'googleCallback'
);

/**
 * OAuth success handler
 */
export const authSuccess = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new CustomError('Not authenticated', 401);
  }

  res.json(
    httpResponse({
      status: 200,
      message: 'Authentication successful',
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          profileImage: req.user.profileImage,
        },
      },
    })
  );
}, 'authSuccess');

/**
 * Get current authenticated user
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new CustomError('Not authenticated', 401);
  }

  const user = await userRepository.findUserById(req.user.id);

  res.json(
    httpResponse({
      status: 200,
      message: 'User details retrieved successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage,
        },
      },
    })
  );
}, 'getCurrentUser');

/**
 * Logout user
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      throw new CustomError('Error during logout', 500);
    }

    res.json(
      httpResponse({
        status: 200,
        message: 'Logged out successfully',
      })
    );
  });
}, 'logout');

/**
 * Create a new API key
 */
export const createApiKey = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new CustomError('Not authenticated', 401);
  }

  const { appName, description, appUrl, ipRestrictions } = req.body;

  if (!appName) {
    throw new CustomError('App name is required', 400);
  }

  const apiKey = await apiKeyRepository.createApiKey(req.user.id, appName, {
    description,
    appUrl,
    ipRestrictions,
  });

  res.json(
    httpResponse({
      status: 201,
      message: 'API key created successfully',
      data: {
        id: apiKey.id,
        key: apiKey.key,
        appName: apiKey.appName,
        expiresAt: apiKey.expiresAt,
      },
    })
  );
}, 'createApiKey');

/**
 * Get all API keys for current user
 */
export const getApiKeys = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new CustomError('Not authenticated', 401);
  }

  const apiKeys = await apiKeyRepository.findApiKeysByUserId(req.user.id);

  res.json(
    httpResponse({
      status: 200,
      message: 'API keys retrieved successfully',
      data: { apiKeys },
    })
  );
}, 'getApiKeys');

/**
 * Revoke an API key
 */
export const revokeApiKey = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new CustomError('Not authenticated', 401);
  }

  const { id } = req.params;

  if (!id) {
    throw new CustomError('API key ID is required', 400);
  }

  await apiKeyRepository.revokeApiKey(id, req.user.id);

  res.json(
    httpResponse({
      status: 200,
      message: 'API key revoked successfully',
    })
  );
}, 'revokeApiKey');

/**
 * Regenerate an API key
 */
export const regenerateApiKey = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new CustomError('Not authenticated', 401);
  }

  const { id } = req.params;

  if (!id) {
    throw new CustomError('API key ID is required', 400);
  }

  const apiKey = await apiKeyRepository.regenerateApiKey(id, req.user.id);

  res.json(
    httpResponse({
      status: 200,
      message: 'API key regenerated successfully',
      data: {
        id: apiKey.id,
        key: apiKey.key,
        expiresAt: apiKey.expiresAt,
      },
    })
  );
}, 'regenerateApiKey');
