import { ApiKey } from '../../../shared/models';

// Interface for create API key options
export interface CreateApiKeyOptions {
  description?: string;
  appUrl?: string;
  ipRestrictions?: string[];
}

// Interface for API key service
export interface IApiKeyService {
  createApiKey(userId: string, appName: string, options?: CreateApiKeyOptions): Promise<ApiKey>;
  getUserApiKeys(userId: string): Promise<ApiKey[]>;
  revokeApiKey(keyId: string, userId: string): Promise<ApiKey>;
  regenerateApiKey(keyId: string, userId: string): Promise<ApiKey>;
  validateApiKey(key: string, ipAddress?: string): Promise<ApiKey | null>;
}

// Interface for request body
export interface CreateApiKeyRequest {
  appName: string;
  description?: string;
  appUrl?: string;
  ipRestrictions?: string[];
}

// Interface for API key response
export interface ApiKeyResponse {
  id: string;
  key: string;
  appName: string;
  expiresAt: Date;
  description?: string;
  appUrl?: string;
  ipRestrictions?: string[];
}
