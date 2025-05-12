import { Request } from 'express';
import { User } from '../../../shared/models';

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

export interface GoogleAuthUrlResponse {
  authUrl: string;
}

export interface AuthService {
  generateGoogleAuthUrl: () => Promise<GoogleAuthUrlResponse>;
  authenticateGoogleUser: (code: string) => Promise<any>;
  getCurrentUser: (userId: string) => Promise<UserResponse>;
  logoutUser: (req: Request) => Promise<void>;
}
