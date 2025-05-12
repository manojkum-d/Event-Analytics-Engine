import * as appRepository from '../repository';
import CustomError from '../../../shared/utils/customError';
import { App } from '../../../shared/models';
import { CreateAppOptions, IAppService } from '../interface';

/**
 * Create a new app
 */
export const createApp = async (userId: string, options: CreateAppOptions): Promise<App> => {
  try {
    if (!userId) {
      throw new CustomError('User ID is required', 400);
    }

    if (!options.name) {
      throw new CustomError('App name is required', 400);
    }

    return await appRepository.createApp(userId, {
      name: options.name,
      description: options.description,
      url: options.url,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to create app', 500);
  }
};

/**
 * Get all apps for user
 */
export const getUserApps = async (userId: string): Promise<App[]> => {
  try {
    if (!userId) {
      throw new CustomError('User ID is required', 400);
    }

    return await appRepository.findAppsByUserId(userId);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to fetch apps', 500);
  }
};

/**
 * Update app
 */
export const updateApp = async (
  appId: string,
  userId: string,
  options: Partial<CreateAppOptions>
): Promise<App> => {
  try {
    if (!appId || !userId) {
      throw new CustomError('App ID and User ID are required', 400);
    }

    await appRepository.updateApp(appId, userId, options);
    return await appRepository.findAppById(appId);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to update app', 500);
  }
};

/**
 * Deactivate app
 */
export const deactivateApp = async (appId: string, userId: string): Promise<void> => {
  try {
    if (!appId || !userId) {
      throw new CustomError('App ID and User ID are required', 400);
    }

    await appRepository.deactivateApp(appId, userId);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to deactivate app', 500);
  }
};

/**
 * Get app by ID
 */
export const getAppById = async (appId: string): Promise<App> => {
  try {
    if (!appId) {
      throw new CustomError('App ID is required', 400);
    }

    return await appRepository.findAppById(appId);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to fetch app', 500);
  }
};

// Export all functions as a service object implementing the interface
export const appService: IAppService = {
  createApp,
  getUserApps,
  updateApp,
  deactivateApp,
  getAppById,
};
