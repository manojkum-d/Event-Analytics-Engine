import { Request, Response } from 'express';
import { appService } from './service';
import { apiKeyService } from '../apiKey/services';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { httpResponse } from '../../shared/utils/httpResponse';
import CustomError from '../../shared/utils/customError';
import ApiKey from '../../shared/models/ApiKey';
import DatabaseService from '../../shared/utils/db/databaseService';

/**
 * Register a new app with API key
 * @route POST /api/v1/auth/register
 * @access Private - Requires authentication
 */
export const registerApp = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      throw new CustomError('Not authenticated', 401);
    }

    const { appName, description, appUrl, ipRestrictions } = req.body;

    if (!appName) {
      throw new CustomError('App name is required', 400);
    }

    // First create the app
    const app = await appService.createApp(req.user.id, {
      name: appName,
      description,
      url: appUrl,
    });

    // Then create an API key for this app
    const apiKey = await apiKeyService.createApiKey(req.user.id, app.id, ipRestrictions);

    res.json(
      httpResponse({
        status: 201,
        message: 'App registered successfully',
        data: {
          app: {
            id: app.id,
            name: app.name,
            description: app.description,
            url: app.url,
          },
          apiKey: {
            id: apiKey.id,
            key: apiKey.key,
            expiresAt: apiKey.expiresAt,
          },
        },
      })
    );
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to register app', 500);
  }
}, 'registerApp');

/**
 * Get all apps for the authenticated user
 * @route GET /api/apps
 * @access Private - Requires authentication
 */
export const getUserApps = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      throw new CustomError('Not authenticated', 401);
    }

    const apps = await appService.getUserApps(req.user.id);

    res.json(
      httpResponse({
        status: 200,
        message: 'Apps retrieved successfully',
        data: {
          apps: apps.map((app) => ({
            id: app.id,
            name: app.name,
            description: app.description,
            url: app.url,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt,
          })),
        },
      })
    );
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to retrieve apps', 500);
  }
}, 'getUserApps');

/**
 * Update an existing app
 * @route PUT /api/apps/:id
 * @access Private - Requires authentication
 */
export const updateApp = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      throw new CustomError('Not authenticated', 401);
    }

    const { id } = req.params;
    const { appName, description, appUrl } = req.body;

    const updatedApp = await appService.updateApp(id, req.user.id, {
      name: appName,
      description,
      url: appUrl,
    });

    res.json(
      httpResponse({
        status: 200,
        message: 'App updated successfully',
        data: {
          app: {
            id: updatedApp.id,
            name: updatedApp.name,
            description: updatedApp.description,
            url: updatedApp.url,
            updatedAt: updatedApp.updatedAt,
          },
        },
      })
    );
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to update app', 500);
  }
}, 'updateApp');

/**
 * Deactivate an app
 * @route DELETE /api/apps/:id
 * @access Private - Requires authentication
 */
export const deactivateApp = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      throw new CustomError('Not authenticated', 401);
    }

    const { id } = req.params;

    await appService.deactivateApp(id, req.user.id);

    res.json(
      httpResponse({
        status: 200,
        message: 'App deactivated successfully',
        data: null,
      })
    );
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to deactivate app', 500);
  }
}, 'deactivateApp');

/**
 * Get API key for an app
 */
export const getAppApiKey = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      throw new CustomError('Not authenticated', 401);
    }

    const { appId } = req.params;

    const apiKey = await apiKeyService.getAppApiKey(appId, req.user.id);

    res.json(
      httpResponse({
        status: 200,
        message: 'API key retrieved successfully',
        data: {
          apiKey: {
            id: apiKey.id,
            key: apiKey.key,
            expiresAt: apiKey.expiresAt,
            ipRestrictions: apiKey.ipRestrictions,
            lastUsed: apiKey.lastUsed,
          },
        },
      })
    );
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to get API key', 500);
  }
}, 'getAppApiKey');

/**
 * Revoke API key for an app
 */
export const revokeAppApiKey = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      throw new CustomError('Not authenticated', 401);
    }

    const { appId } = req.params;
    console.log(`Attempting to revoke API key for app ${appId}`);

    // First find the API key directly
    const apiKey = await DatabaseService.findOne(ApiKey, {
      where: {
        appId,
      } as any,
    });

    if (!apiKey) {
      throw new CustomError(`No API key found for app ${appId}`, 404);
    }

    // Check ownership
    if (apiKey.userId !== req.user.id) {
      throw new CustomError('Not authorized to revoke this API key', 403);
    }

    // Directly revoke using the API key ID
    await DatabaseService.update(ApiKey, { isActive: false } as any, {
      where: {
        id: apiKey.id,
      } as any,
    });

    res.json(
      httpResponse({
        status: 200,
        message: 'API key revoked successfully',
        data: null,
      })
    );
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to revoke API key', 500);
  }
}, 'revokeAppApiKey');
