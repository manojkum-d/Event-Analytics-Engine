import User from '../../shared/models/User.js';
import DatabaseService, { QueryOptions } from '../../services/db/databaseService.js';
import CustomError from '../../shared/utils/customError/index.js';
import { GoogleUserData } from './interface/index.js';

// Find user by id
export const findUserById = async (
  userId: string,
  queryOptions?: Parameters<typeof DatabaseService.findById>[2]
): Promise<User> => {
  const userDetails = await DatabaseService.findById(User, userId, queryOptions);

  if (!userDetails) {
    throw new CustomError(`User with id ${userId} not found`, 404);
  }

  return userDetails as User;
};

// Find user by email
export const findUserByEmail = async (
  userEmail: string,
  queryOptions?: QueryOptions<User>
): Promise<User | null> => {
  const userDetails = await DatabaseService.findOne(User, {
    where: {
      email: userEmail,
    } as any,
    ...queryOptions,
  });

  return userDetails;
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

// Create user
export const createUser = async (
  userData: Partial<User>,
  queryOptions?: QueryOptions<User>
): Promise<User> => {
  // Check if user with this email already exists
  if (userData.email) {
    const existingUser = await findUserByEmail(userData.email);
    if (existingUser) {
      throw new CustomError('User with this email already exists', 409);
    }
  }

  return await DatabaseService.create(User, userData, queryOptions);
};

// Update user
export const updateUser = async (
  userId: string,
  data: Partial<User>,
  queryOptions?: QueryOptions<User>
): Promise<number> => {
  return await DatabaseService.update(User, data, {
    ...queryOptions,
    where: {
      id: userId,
      ...(queryOptions?.where || {}),
    } as any,
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

// Find all users
export const findAllUsers = async (queryOptions?: QueryOptions<User>): Promise<User[]> => {
  return await DatabaseService.findAll(User, queryOptions);
};

// Count users
export const countUsers = async (queryOptions?: QueryOptions<User>): Promise<number> => {
  return await DatabaseService.count(User, queryOptions);
};
