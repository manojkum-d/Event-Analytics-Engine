import { Request } from 'express';
import * as userRepository from '../../../repositories/users';
import CustomError from '../../../shared/utils/customError';
import { envConfig } from '../../../shared/config/envConfig';

import { AuthService, UserResponse, GoogleAuthUrlResponse } from '../interfaces';

/**
 * Generate Google OAuth URL
 */
export const generateGoogleAuthUrl = async (): Promise<GoogleAuthUrlResponse> => {
  try {
    // Now handled by passport directly
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=${encodeURIComponent(
      envConfig.googleCallbackUrl
    )}&scope=${encodeURIComponent('profile email')}&client_id=${encodeURIComponent(
      envConfig.googleClientId
    )}`;

    return { authUrl };
  } catch (error) {
    throw new CustomError('Failed to generate Google authentication URL', 500);
  }
};

/**
 * Get current user details
 */
export const getCurrentUser = async (userId: string): Promise<UserResponse> => {
  try {
    if (!userId) {
      throw new CustomError('User ID is required', 400);
    }

    const user = await userRepository.findUserById(userId);

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      profileImage: user.profileImage || undefined,
    };
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to fetch user details', 500);
  }
};

/**
 * Logout user
 */
export const logoutUser = async (req: Request): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      req.logout((err) => {
        if (err) {
          reject(new CustomError('Error during logout', 500, err));
        }
        resolve();
      });
    } catch (error) {
      reject(new CustomError('Failed to logout', 500));
    }
  });
};

// Export as a service object implementing the interface
export const authService: AuthService = {
  generateGoogleAuthUrl,
  authenticateGoogleUser: async () => {
    throw new CustomError('Direct authentication not supported, use passport middleware', 500);
  },
  getCurrentUser,
  logoutUser,
};
