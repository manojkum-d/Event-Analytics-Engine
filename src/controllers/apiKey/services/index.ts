import moment from 'moment';
import * as apiKeyRepository from '../repository';
import CustomError from '../../../shared/utils/customError';
import { ApiKey } from '../../../shared/models';
import { IApiKeyService } from '../interfaces';
import DatabaseService from '../../../shared/utils/db/databaseService';
import { App } from '../../../shared/models';

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
 * Regenerate an API key
 */
export const regenerateApiKey = async (keyId: string, userId: string): Promise<ApiKey> => {
  try {
    if (!keyId) {
      throw new CustomError('API key ID is required', 400);
    }

    if (!userId) {
      throw new CustomError('User ID is required', 400);
    }

    // Find the API key by ID instead of app ID
    const apiKey = await apiKeyRepository.findApiKeyById(keyId);

    // Check if the user owns this API key
    if (apiKey.userId !== userId) {
      throw new CustomError('Not authorized to regenerate this API key', 403);
    }

    // Regenerate the API key
    return await apiKeyRepository.regenerateApiKey(apiKey.id);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to regenerate API key', 500);
  }
};

/**
 * Validate API key for authentication
 */
export const validateApiKey = async (key: string, ipAddress?: string): Promise<ApiKey | null> => {
  try {
    if (!key) {
      return null;
    }

    const apiKey = await apiKeyRepository.findApiKeyByKey(key);

    if (!apiKey || !apiKey.isActive) {
      return null;
    }

    // Check if the key is expired
    if (moment().isAfter(apiKey.expiresAt)) {
      try {
        await apiKeyRepository.revokeApiKey(apiKey.id);
      } catch (error) {
        console.error('Failed to revoke expired API key:', error);
      }
      return null;
    }

    // Validate IP restrictions if they exist
    if (ipAddress && apiKey.ipRestrictions && apiKey.ipRestrictions.length > 0) {
      const ipAllowed = apiKey.ipRestrictions.some((cidr) =>
        apiKeyRepository.isIpInCidr(ipAddress, cidr)
      );

      if (!ipAllowed) {
        return null;
      }
    }

    // Update last used timestamp
    try {
      await apiKeyRepository.updateLastUsed(apiKey.id);
    } catch (error) {
      console.error('Failed to update last used timestamp:', error);
      // Don't fail the validation if updating timestamp fails
    }

    return apiKey;
  } catch (error) {
    console.error('Error validating API key:', error);
    return null;
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
  validateApiKey,
  getUserApiKeys,
};
