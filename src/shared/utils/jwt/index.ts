import jwt, { SignOptions } from 'jsonwebtoken';
import { envConfig } from '../../config/envConfig';
import CustomError from '../customError';
import { User } from '../../models';
import { TokenPayload } from './interface';

/**
 * Generate access token for a user
 */
export const generateAccessToken = (user: User): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
  };

  const options: SignOptions = {
    expiresIn: (envConfig.jwtExpiresIn || '1d') as jwt.SignOptions['expiresIn'],
  };

  return jwt.sign(payload, envConfig.jwtSecret as jwt.Secret, options);
};

/**
 * Generate refresh token for a user
 */
export const generateRefreshToken = (user: User): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
  };

  const options: SignOptions = {
    expiresIn: (envConfig.jwtRefreshExpiresIn || '7d') as jwt.SignOptions['expiresIn'],
  };

  return jwt.sign(payload, envConfig.jwtRefreshSecret as jwt.Secret, options);
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, envConfig.jwtSecret as jwt.Secret) as TokenPayload;
  } catch (error) {
    throw new CustomError('Invalid or expired token', 401);
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, envConfig.jwtRefreshSecret as jwt.Secret) as TokenPayload;
  } catch (error) {
    throw new CustomError('Invalid or expired refresh token', 401);
  }
};
