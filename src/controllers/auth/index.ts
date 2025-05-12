import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import * as authService from './services';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { httpResponse } from '../../shared/utils/httpResponse';
import CustomError from '../../shared/utils/customError';
import { generateAccessToken, generateRefreshToken } from '../../shared/utils/jwt';
import { User } from '../../shared/models';

/**
 * Get Google OAuth URL for client-side redirection
 */
export const googleAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Use passport to initiate Google OAuth flow
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: true,
    })(req, res, next);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to generate authentication URL', 500);
  }
}, 'googleAuth');

/**
 * Handle Google OAuth callback
 */
export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
  try {
    // At this point, authentication was successful and user is in req.user
    // Redirect to success page
    res.redirect('/api/v1/auth/success');
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Authentication failed', 500);
  }
}, 'googleCallback');

/**
 * OAuth success handler
 */
export const authSuccess = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      throw new CustomError('Not authenticated', 401);
    }

    // Get user details
    const userResponse = await authService.getCurrentUser(req.user.id);

    // Generate JWT tokens
    const accessToken = generateAccessToken(req.user as User);
    const refreshToken = generateRefreshToken(req.user as User);

    res.json(
      httpResponse({
        status: 200,
        message: 'Authentication successful',
        data: {
          user: userResponse,
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      })
    );
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to get user information', 500);
  }
}, 'authSuccess');

/**
 * Get current authenticated user
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new CustomError('Not authenticated', 401);
    }

    const userResponse = await authService.getCurrentUser(req.user.id);

    res.json(
      httpResponse({
        status: 200,
        message: 'User details retrieved successfully',
        data: { user: userResponse },
      })
    );
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to get user details', 500);
  }
}, 'getCurrentUser');

/**
 * Logout user
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  try {
    await authService.logoutUser(req);

    res.json(
      httpResponse({
        status: 200,
        message: 'Logged out successfully',
        data: null,
      })
    );
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Logout failed', 500);
  }
}, 'logout');
