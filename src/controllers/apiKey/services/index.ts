import moment from 'moment';
import * as apiKeyRepository from '../repository';
import CustomError from '../../../shared/utils/customError';
import { ApiKey } from '../../../shared/models';
import { CreateApiKeyOptions, IApiKeyService } from '../interfaces';

/**
 * Create a new API key for a user
 */
export const createApiKey = async (
  userId: string,
  appName: string,
  options: CreateApiKeyOptions = {}
): Promise<ApiKey> => {
  try {
    if (!userId) {
      throw new CustomError('User ID is required', 400);
    }

    if (!appName) {
      throw new CustomError('App name is required', 400);
    }

    return await apiKeyRepository.createApiKey(userId, appName, options);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to create API key', 500);
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

    return await apiKeyRepository.findApiKeysByUserId(userId);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to fetch API keys', 500);
  }
};

/**
 * Revoke an API key
 */
export const revokeApiKey = async (keyId: string, userId: string): Promise<ApiKey> => {
  try {
    if (!keyId || !userId) {
      throw new CustomError('API key ID and user ID are required', 400);
    }

    // First check if the API key exists and belongs to the user
    const apiKey = await apiKeyRepository.findApiKeyById(keyId);

    if (!apiKey) {
      throw new CustomError('API key not found', 404);
    }

    if (apiKey.userId !== userId) {
      throw new CustomError('You are not authorized to revoke this API key', 403);
    }

    // Revoke the key
    await apiKeyRepository.revokeApiKey(keyId, userId);

    // Return the updated API key
    return await apiKeyRepository.findApiKeyById(keyId);
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
    if (!keyId || !userId) {
      throw new CustomError('API key ID and user ID are required', 400);
    }

    // First check if the API key exists and belongs to the user
    const apiKey = await apiKeyRepository.findApiKeyById(keyId);

    if (!apiKey) {
      throw new CustomError('API key not found', 404);
    }

    if (apiKey.userId !== userId) {
      throw new CustomError('You are not authorized to regenerate this API key', 403);
    }

    // Regenerate the key
    return await apiKeyRepository.regenerateApiKey(keyId, userId);
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
        await apiKeyRepository.revokeApiKey(apiKey.id, apiKey.userId);
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

// Export all functions as a service object implementing the interface
export const apiKeyService: IApiKeyService = {
  createApiKey,
  getUserApiKeys,
  revokeApiKey,
  regenerateApiKey,
  validateApiKey,
};
