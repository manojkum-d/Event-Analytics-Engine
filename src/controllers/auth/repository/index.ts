import DatabaseService from '../../../shared/utils/db/databaseService';
import CustomError from '../../../shared/utils/customError';
import { User } from '../../../shared/models';

/**
 * Find user by ID
 */
export const findUserById = async (
  userId: string,
  queryOptions?: Parameters<typeof DatabaseService.findById>[2]
): Promise<User> => {
  const user = await DatabaseService.findById(User, userId, queryOptions);

  if (!user) {
    throw new CustomError(`User with id ${userId} not found`, 404);
  }

  return user as User;
};

/**
 * Find user by email
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  return await DatabaseService.findOne(User, {
    where: {
      email,
    } as any,
  });
};

/**
 * Create a new user
 */
export const createUser = async (userData: Partial<User>): Promise<User> => {
  return await DatabaseService.create(User, userData as any);
};

/**
 * Update user
 */
export const updateUser = async (userId: string, userData: Partial<User>): Promise<number> => {
  const result = await DatabaseService.update(User, userData as any, {
    where: {
      id: userId,
    } as any,
  });

  if (result === 0) {
    throw new CustomError(`User with id ${userId} not found`, 404);
  }

  return result;
};

/**
 * Find or create user (for OAuth)
 */
export const findOrCreateUser = async (
  email: string,
  userData: Partial<User>
): Promise<[User, boolean]> => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    // Update existing user with new data
    await updateUser(existingUser.id, userData);
    return [existingUser, false];
  }

  // Create new user
  const newUser = await createUser(userData);
  return [newUser, true];
};
