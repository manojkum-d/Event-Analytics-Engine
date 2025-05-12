import { Request, Response, NextFunction } from 'express';
import * as apiKeyService from './services';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { httpResponse } from '../../shared/utils/httpResponse';
import CustomError from '../../shared/utils/customError';
import { ApiKey } from '../../shared/models';
import { ApiKeyResponse, CreateApiKeyRequest } from './interfaces';

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

    await apiKeyService.revokeApiKey(id, req.user.id);

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

    res.json(
      httpResponse({
        status: 200,
        message: 'API key regenerated successfully',
        data: {
          id: apiKey.id,
          key: apiKey.key,
          appId: apiKey.appId,
          expiresAt: apiKey.expiresAt,
          ipRestrictions: apiKey.ipRestrictions,
        },
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
 * Validate API key middleware
 * Used to validate incoming API keys for analytics collection
 */
export const validateApiKeyMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
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

      // Continue to the next middleware/handler
      next();
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to validate API key', 500);
    }
  },
  'validateApiKey'
);

/**
 * Verify API key is valid
 * Standalone endpoint for clients to verify their API key
 */
export const verifyApiKey = asyncHandler(async (req: Request, res: Response) => {
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

    // Return verification success
    res.json(
      httpResponse({
        status: 200,
        message: 'API key is valid',
        data: {
          appId: validApiKey.appId,
          expiresAt: validApiKey.expiresAt,
        },
      })
    );
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to verify API key', 500);
  }
}, 'verifyApiKey');
