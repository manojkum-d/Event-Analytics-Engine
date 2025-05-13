import { Request, Response, NextFunction } from 'express';
import * as apiKeyService from './services';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { httpResponse } from '../../shared/utils/httpResponse';
import CustomError from '../../shared/utils/customError';
import { ApiKey } from '../../shared/models';
import DatabaseService from '../../shared/utils/db/databaseService';

/**
 * Get all API keys for current user
 */
export const getApiKeys = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      throw new CustomError('Not authenticated', 401);
    }

    const apiKeys = await apiKeyService.getUserApiKeys(req.user.id);

    const response = apiKeys.map((apiKey: ApiKey) => ({
      id: apiKey.id,
      key: apiKey.key,
      appId: apiKey.appId,
      expiresAt: apiKey.expiresAt,
      ipRestrictions: apiKey.ipRestrictions,
      isActive: apiKey.isActive,
      lastUsed: apiKey.lastUsed,
      appDetails: apiKey.app
        ? {
            name: apiKey.app.name,
            url: apiKey.app.url,
          }
        : null,
    }));

    res.json(
      httpResponse({
        status: 200,
        message: 'API keys retrieved successfully',
        data: { apiKeys: response },
      })
    );
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to fetch API keys', 500);
  }
}, 'getApiKeys');

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
export const revokeApiKey = asyncHandler(async (req: Request, res: Response) => {
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
}, 'revokeApiKey');

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
    const app = await apiKeyService.createApp(req.user.id, {
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
