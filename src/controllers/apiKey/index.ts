import { Request, Response } from 'express';
import * as apiKeyService from './services';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { httpResponse } from '../../shared/utils/httpResponse';
import CustomError from '../../shared/utils/customError';
import { ApiKey } from '../../shared/models';
import { ApiKeyResponse, CreateApiKeyRequest } from './interfaces';

/**
 * Create a new API key
 */
export const createApiKey = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new CustomError('Not authenticated', 401);
    }

    const { appName, description, appUrl, ipRestrictions } = req.body as CreateApiKeyRequest;

    const apiKey = await apiKeyService.createApiKey(userId, appName, {
      description,
      appUrl,
      ipRestrictions,
    });

    const response: ApiKeyResponse = {
      id: apiKey.id,
      key: apiKey.key,
      appName: apiKey.appName,
      expiresAt: apiKey.expiresAt,
      description: apiKey.description || undefined,
      appUrl: apiKey.appUrl || undefined,
      ipRestrictions: apiKey.ipRestrictions || undefined,
    };

    res.json(
      httpResponse({
        status: 201,
        message: 'API key created successfully',
        data: response,
      })
    );
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to create API key', 500);
  }
}, 'createApiKey');

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
      appName: apiKey.appName,
      expiresAt: apiKey.expiresAt,
      description: apiKey.description,
      appUrl: apiKey.appUrl,
      ipRestrictions: apiKey.ipRestrictions,
      isActive: apiKey.isActive,
      lastUsed: apiKey.lastUsed,
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
 * Revoke an API key
 */
export const revokeApiKey = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      throw new CustomError('Not authenticated', 401);
    }

    const { id } = req.params;

    if (!id) {
      throw new CustomError('API key ID is required', 400);
    }

    const apiKey = await apiKeyService.revokeApiKey(id, req.user.id);

    const response: ApiKeyResponse = {
      id: apiKey.id,
      key: apiKey.key,
      appName: apiKey.appName,
      expiresAt: apiKey.expiresAt,
      description: apiKey.description || undefined,
      appUrl: apiKey.appUrl || undefined,
      ipRestrictions: apiKey.ipRestrictions || undefined,
    };

    res.json(
      httpResponse({
        status: 200,
        message: 'API key revoked successfully',
        data: {
          ...response,
          revokedAt: new Date(),
        },
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
 * Regenerate an API key
 */
export const regenerateApiKey = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      throw new CustomError('Not authenticated', 401);
    }

    const { id } = req.params;

    if (!id) {
      throw new CustomError('API key ID is required', 400);
    }

    const apiKey = await apiKeyService.regenerateApiKey(id, req.user.id);

    const response: ApiKeyResponse = {
      id: apiKey.id,
      key: apiKey.key,
      appName: apiKey.appName,
      expiresAt: apiKey.expiresAt,
      description: apiKey.description || undefined,
      appUrl: apiKey.appUrl || undefined,
      ipRestrictions: apiKey.ipRestrictions || undefined,
    };

    res.json(
      httpResponse({
        status: 200,
        message: 'API key regenerated successfully',
        data: response,
      })
    );
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to regenerate API key', 500);
  }
}, 'regenerateApiKey');

/**
 * Validate API key
 */
export const validateApiKeyMiddleware = asyncHandler(async (req: Request, res: Response) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    const ipAddress = req.ip;

    if (!apiKey) {
      throw new CustomError('API key is required', 401);
    }

    const validApiKey = await apiKeyService.validateApiKey(apiKey, ipAddress);

    if (!validApiKey) {
      throw new CustomError('Invalid or expired API key', 401);
    }

    // Attach API key to request for downstream use
    req.apiKey = validApiKey;
    res.locals.apiKey = validApiKey;

    res.json(
      httpResponse({
        status: 200,
        message: 'API key is valid',
        data: {
          id: validApiKey.id,
          appName: validApiKey.appName,
          expiresAt: validApiKey.expiresAt,
        },
      })
    );
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to validate API key', 500);
  }
}, 'validateApiKey');
