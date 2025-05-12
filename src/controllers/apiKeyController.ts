import { Request, Response, NextFunction } from 'express';
import * as apiKeyRepository from '../repositories/apiKey/index';
import { asyncHandler } from '../shared/utils/asyncHandler/index';
import { httpResponse } from '../shared/utils/httpResponse/index';
import CustomError from '../shared/utils/customError/index';

/**
 * Create a new API key
 */
export const createApiKey = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new CustomError('Not authenticated', 401);
  }

  const { appName, description, appUrl, ipRestrictions } = req.body;

  if (!appName) {
    throw new CustomError('App name is required', 400);
  }

  const apiKey = await apiKeyRepository.createApiKey(userId, appName, {
    description,
    appUrl,
    ipRestrictions,
  });

  res.json(
    httpResponse({
      status: 201,
      message: 'API key created successfully',
      data: {
        id: apiKey.id,
        key: apiKey.key,
        appName: apiKey.appName,
        expiresAt: apiKey.expiresAt,
      },
    })
  );
}, 'createApiKey');

/**
 * Get all API keys for current user
 */
export const getApiKeys = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new CustomError('Not authenticated', 401);
  }

  const apiKeys = await apiKeyRepository.findApiKeysByUserId(req.user.id);

  res.json(
    httpResponse({
      status: 200,
      message: 'API keys retrieved successfully',
      data: { apiKeys },
    })
  );
}, 'getApiKeys');

/**
 * Revoke an API key
 */
export const revokeApiKey = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new CustomError('Not authenticated', 401);
  }

  const { id } = req.params;

  if (!id) {
    throw new CustomError('API key ID is required', 400);
  }

  // Get the API key before revoking it
  const apiKey = await apiKeyRepository.findApiKeyById(id);

  // Revoke the key
  await apiKeyRepository.revokeApiKey(id, req.user.id);

  res.json(
    httpResponse({
      status: 200,
      message: 'API key revoked successfully',
      data: {
        id: apiKey.id,
        appName: apiKey.appName,
        revokedAt: new Date(),
      },
    })
  );
}, 'revokeApiKey');

/**
 * Regenerate an API key
 */
export const regenerateApiKey = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new CustomError('Not authenticated', 401);
  }

  const { id } = req.params;

  if (!id) {
    throw new CustomError('API key ID is required', 400);
  }

  const apiKey = await apiKeyRepository.regenerateApiKey(id, req.user.id);

  res.json(
    httpResponse({
      status: 200,
      message: 'API key regenerated successfully',
      data: {
        id: apiKey.id,
        key: apiKey.key,
        expiresAt: apiKey.expiresAt,
      },
    })
  );
}, 'regenerateApiKey');
