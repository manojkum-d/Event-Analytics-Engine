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
