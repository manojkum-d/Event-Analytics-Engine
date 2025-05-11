import { v4 as uuidV4 } from 'uuid';
import moment from 'moment';
import DatabaseService, { QueryOptions } from '../../services/db/databaseService';
import CustomError from '../../shared/utils/customError/index';
import { envConfig } from '../../shared/config/envConfig';
import { ApiKey, User } from '../../shared/models/index';
import { isIpInCidr } from '../../shared/helper/ipHelpers';

// Find API key by id
export const findApiKeyById = async (
  keyId: string,
  queryOptions?: Parameters<typeof DatabaseService.findById>[2]
): Promise<ApiKey> => {
  const apiKey = await DatabaseService.findById(ApiKey, keyId, queryOptions);

  if (!apiKey) {
    throw new CustomError(`API key with id ${keyId} not found`, 404);
  }

  return apiKey as ApiKey;
};

// Find API key by key
export const findApiKeyByKey = async (
  key: string,
  queryOptions?: QueryOptions<ApiKey>
): Promise<ApiKey | null> => {
  return await DatabaseService.findOne(ApiKey, {
    where: {
      key,
      isActive: true,
    } as any,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'firstName', 'lastName'],
      },
    ],
    ...queryOptions,
  });
};

// Find API keys by user id
export const findApiKeysByUserId = async (
  userId: string,
  queryOptions?: QueryOptions<ApiKey>
): Promise<ApiKey[]> => {
  return await DatabaseService.findAll(ApiKey, {
    where: {
      userId,
      isActive: true,
      expiresAt: {
        [Symbol.for('gt')]: new Date(), // Using Symbol.for('gt') to represent Sequelize.Op.gt
      },
    } as any,
    order: [['createdAt', 'DESC']],
    ...queryOptions,
  });
};

// Create API key
export const createApiKey = async (
  userId: string,
  appName: string,
  options: Partial<ApiKey> = {}
): Promise<ApiKey> => {
  // Calculate expiration date
  const expiresAt = moment().add(envConfig.apiKeyExpirationDays, 'days').toDate();

  // Create the API key
  return await DatabaseService.create(ApiKey, {
    userId,
    appName,
    key: uuidV4(),
    expiresAt,
    ...options,
  } as any);
};

// Revoke API key
export const revokeApiKey = async (keyId: string, userId: string): Promise<void> => {
  const result = await DatabaseService.update(ApiKey, { isActive: false } as any, {
    where: {
      id: keyId,
      userId,
    } as any,
  });

  if (result === 0) {
    throw new CustomError('API key not found or already revoked', 404);
  }
};

// Regenerate API key
export const regenerateApiKey = async (keyId: string, userId: string): Promise<ApiKey> => {
  // Generate a new key and update expiration
  const result = await DatabaseService.update(
    ApiKey,
    {
      key: uuidV4(),
      expiresAt: moment().add(envConfig.apiKeyExpirationDays, 'days').toDate(),
    } as any,
    {
      where: {
        id: keyId,
        userId,
      } as any,
    }
  );

  if (result === 0) {
    throw new CustomError('API key not found', 404);
  }

  return await findApiKeyById(keyId);
};

// Update API key last used
export const updateApiKeyLastUsed = async (keyId: string): Promise<void> => {
  await DatabaseService.update(ApiKey, { lastUsed: new Date() } as any, {
    where: {
      id: keyId,
    } as any,
  });
};

// Validate API key
export const validateApiKey = async (keyValue: string, ipAddress?: string): Promise<ApiKey> => {
  const apiKey = await findApiKeyByKey(keyValue);

  if (!apiKey) {
    throw new CustomError('Invalid API key', 401);
  }

  // Check if expired
  if (moment().isAfter(apiKey.expiresAt)) {
    await DatabaseService.update(ApiKey, { isActive: false } as any, {
      where: {
        id: apiKey.id,
      } as any,
    });
    throw new CustomError('API key has expired', 401);
  }

  // Check IP restrictions if applicable
  if (apiKey.ipRestrictions && apiKey.ipRestrictions.length > 0 && ipAddress) {
    const isIpAllowed = apiKey.ipRestrictions.some((allowedIp) => {
      // Support for CIDR notation or exact match
      return allowedIp === ipAddress || isIpInCidr(ipAddress, allowedIp);
    });

    if (!isIpAllowed) {
      throw new CustomError('IP address not allowed for this API key', 403);
    }
  }

  // Update last used timestamp
  await updateApiKeyLastUsed(apiKey.id);

  return apiKey;
};
