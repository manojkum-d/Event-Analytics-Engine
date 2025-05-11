import { ApiKey } from '../models';

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

// Export an empty object to make this a module
export {};
