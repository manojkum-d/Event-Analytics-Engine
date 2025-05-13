import DatabaseService, { QueryOptions } from '../../../shared/utils/db/databaseService';
import CustomError from '../../../shared/utils/customError';
import { User } from '../../../shared/models';
import { GoogleUserData } from '../interfaces';

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

// Find user by google id
export const findUserByGoogleId = async (
  googleId: string,
  queryOptions?: QueryOptions<User>
): Promise<User | null> => {
  const userDetails = await DatabaseService.findOne(User, {
    where: {
      googleId,
    } as any,
    ...queryOptions,
  });

  return userDetails;
};

// Find or create google user
export const findOrCreateGoogleUser = async (
  userData: GoogleUserData,
  queryOptions?: QueryOptions<User>
): Promise<User> => {
  const { googleId, email, firstName, lastName, profileImage } = userData;

  // First try to find by Google ID
  let user = await findUserByGoogleId(googleId);

  if (user) {
    // Update the user's profile information if needed
    const updates: Partial<User> = {};
    if (firstName && !user.firstName) updates.firstName = firstName;
    if (lastName && !user.lastName) updates.lastName = lastName;
    if (profileImage && !user.profileImage) updates.profileImage = profileImage;

    if (Object.keys(updates).length > 0) {
      await updateUser(user.id, updates);
      user = await findUserById(user.id);
    }

    return user;
  }

  // Then try to find by email
  user = await findUserByEmail(email);

  if (user) {
    // Link Google account to existing user
    await updateUser(user.id, {
      googleId,
      isVerified: true,
      profileImage: profileImage || user.profileImage,
    });

    return await findUserById(user.id);
  }

  // Create a new user if not found
  return createUser({
    email,
    googleId,
    firstName: firstName || null,
    lastName: lastName || null,
    profileImage: profileImage || null,
    isVerified: true,
  });
};

// Update last login
export const updateLastLogin = async (userId: string): Promise<number> => {
  return await DatabaseService.update(User, { lastLogin: new Date() } as any, {
    where: {
      id: userId,
    } as any,
  });
};
