import { User, ApiKey } from '../models/index';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      profileImage: string | null;
      googleId?: string | null;
      isVerified?: boolean;
      isActive?: boolean;
      lastLogin?: Date | null;
    }

    interface Request {
      apiKey?: ApiKey;
    }
  }
}
