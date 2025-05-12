import DatabaseService, { QueryOptions } from '../../../shared/utils/db/databaseService';
import CustomError from '../../../shared/utils/customError';
import { App } from '../../../shared/models';

/**
 * Find app by id
 */
export const findAppById = async (
  appId: string,
  queryOptions?: Parameters<typeof DatabaseService.findById>[2]
): Promise<App> => {
  const app = await DatabaseService.findById(App, appId, queryOptions);

  if (!app) {
    throw new CustomError(`App with id ${appId} not found`, 404);
  }

  return app as App;
};

/**
 * Find apps by user id
 */
export const findAppsByUserId = async (
  userId: string,
  queryOptions?: QueryOptions<App>
): Promise<App[]> => {
  return await DatabaseService.findAll(App, {
    where: {
      userId,
      isActive: true,
    } as any,
    order: [['createdAt', 'DESC']],
    ...queryOptions,
  });
};

/**
 * Create app
 */
export const createApp = async (userId: string, appData: Partial<App>): Promise<App> => {
  return await DatabaseService.create(App, {
    userId,
    name: appData.name,
    description: appData.description,
    url: appData.url,
    isActive: true,
  } as any);
};

/**
 * Update app
 */
export const updateApp = async (
  appId: string,
  userId: string,
  appData: Partial<App>
): Promise<number> => {
  const result = await DatabaseService.update(App, appData as any, {
    where: {
      id: appId,
      userId,
    } as any,
  });

  if (result === 0) {
    throw new CustomError('App not found or not authorized to update', 404);
  }

  return result;
};

/**
 * Deactivate app
 */
export const deactivateApp = async (appId: string, userId: string): Promise<number> => {
  const result = await DatabaseService.update(App, { isActive: false } as any, {
    where: {
      id: appId,
      userId,
    } as any,
  });

  if (result === 0) {
    throw new CustomError('App not found or not authorized to deactivate', 404);
  }

  return result;
};
