import moment from 'moment';
import * as apiKeyRepository from '../repository';
import CustomError from '../../../shared/utils/customError';
import { ApiKey } from '../../../shared/models';
import { CreateAppOptions, IApiKeyService } from '../interfaces';
import DatabaseService from '../../../shared/utils/db/databaseService';
import { App } from '../../../shared/models';

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

    return await apiKeyRepository.createApp(userId, {
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
 * Get API key for an app
 */
export const getAppApiKey = async (appId: string, userId: string): Promise<ApiKey> => {
  try {
    if (!appId) {
      throw new CustomError('App ID is required', 400);
    }

    const apiKey = await apiKeyRepository.findApiKeyByAppId(appId);

    // Check if the API key belongs to the user
    if (apiKey && apiKey.userId !== userId) {
      throw new CustomError('Not authorized to access this API key', 403);
    }

    if (!apiKey) {
      throw new CustomError('API key not found for this app', 404);
    }

    return apiKey;
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to get API key', 500);
  }
};

/**
 * Create a new API key for an app
 */
export const createApiKey = async (
  userId: string,
  appId: string,
  ipRestrictions?: string[]
): Promise<ApiKey> => {
  try {
    if (!userId) {
      throw new CustomError('User ID is required', 400);
    }

    if (!appId) {
      throw new CustomError('App ID is required', 400);
    }

    try {
      // Check if an API key already exists for this app
      const existingKey = await apiKeyRepository.findApiKeyByAppId(appId);

      if (existingKey) {
        throw new CustomError('An API key already exists for this app', 409);
      }
    } catch (error) {
      // If the error is not a CustomError with status 409, ignore it and continue
      if (error instanceof CustomError && error.statusCode === 409) {
        throw error;
      }
    }

    // Create new API key
    return await apiKeyRepository.createApiKey(userId, appId, { ipRestrictions });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to create API key', 500);
  }
};

/**
 * Revoke (deactivate) an API key
 */
export const revokeApiKey = async (appId: string, userId: string): Promise<void> => {
  try {
    if (!appId) {
      throw new CustomError('App ID is required', 400);
    }

    if (!userId) {
      throw new CustomError('User ID is required', 400);
    }

    // Find the API key for this app
    const apiKey = await apiKeyRepository.findApiKeyByAppId(appId);

    if (!apiKey) {
      throw new CustomError('API key not found', 404);
    }

    // Check if the user owns this API key
    if (apiKey.userId !== userId) {
      throw new CustomError('Not authorized to revoke this API key', 403);
    }

    // Revoke the API key
    await apiKeyRepository.revokeApiKey(apiKey.id);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to revoke API key', 500);
  }
};

/**
 * Get all API keys for a user
 */
export const getUserApiKeys = async (userId: string): Promise<ApiKey[]> => {
  try {
    if (!userId) {
      throw new CustomError('User ID is required', 400);
    }

    const apiKeys = await DatabaseService.findAll(ApiKey, {
      where: {
        userId,
        isActive: true,
      } as any,
      include: [
        {
          model: App,
          as: 'app',
          attributes: ['name', 'url'],
        },
      ],
    });

    return apiKeys;
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to fetch API keys', 500);
  }
};

// Export all functions as a service object
export const apiKeyService: IApiKeyService = {
  getAppApiKey,
  createApiKey,
  revokeApiKey,
  getUserApiKeys,
};
