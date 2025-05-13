import { v4 as uuidV4 } from 'uuid';
import moment from 'moment';
import DatabaseService, { QueryOptions } from '../../../shared/utils/db/databaseService';
import CustomError from '../../../shared/utils/customError';
import { envConfig } from '../../../shared/config/envConfig';
import { ApiKey, App, User } from '../../../shared/models';
import { isIpInCidr } from '../../../shared/helper/ipHelpers';

/**
 * Find API key by id
 */
export const findApiKeyById = async (keyId: string): Promise<ApiKey> => {
  const apiKey = await DatabaseService.findById(ApiKey, keyId);

  if (!apiKey) {
    throw new CustomError(`API key with id ${keyId} not found`, 404);
  }

  return apiKey as ApiKey;
};

/**
 * Find API key by app ID
 */
export const findApiKeyByAppId = async (appId: string): Promise<ApiKey | null> => {
  try {
    return await DatabaseService.findOne(ApiKey, {
      where: {
        appId,
        isActive: true,
      } as any,
      include: [
        {
          model: App,
          as: 'app',
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName'],
        },
      ],
    });
  } catch (error) {
    console.error('Error finding API key by app ID:', error);
    return null; // Return null instead of throwing an error
  }
};

/**
 * Find API key by key value
 */
export const findApiKeyByKey = async (key: string): Promise<ApiKey | null> => {
  return await DatabaseService.findOne(ApiKey, {
    where: {
      key,
      isActive: true,
    } as any,
    include: [
      {
        model: App,
        as: 'app',
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'firstName', 'lastName'],
      },
    ],
  });
};

/**
 * Create API key
 */
export const createApiKey = async (
  userId: string,
  appId: string,
  options: Partial<ApiKey> = {}
): Promise<ApiKey> => {
  // Calculate expiration date
  const expiresAt = moment().add(envConfig.apiKeyExpirationDays, 'days').toDate();

  // Create the API key
  return await DatabaseService.create(ApiKey, {
    userId,
    appId,
    key: uuidV4(),
    expiresAt,
    isActive: true,
    ...options,
  } as any);
};

/**
 * Revoke API key
 */
export const revokeApiKey = async (keyId: string): Promise<void> => {
  const result = await DatabaseService.update(ApiKey, { isActive: false } as any, {
    where: {
      id: keyId,
    } as any,
  });

  if (result === 0) {
    throw new CustomError('API key not found or already revoked', 404);
  }
};

// Export the utility function for IP checking
export { isIpInCidr };
