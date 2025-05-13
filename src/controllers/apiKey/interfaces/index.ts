import { ApiKey } from '../../../shared/models';

// Interface for API key service
export interface IApiKeyService {
  getAppApiKey(appId: string, userId: string): Promise<ApiKey>;
  createApiKey(userId: string, appId: string, ipRestrictions?: string[]): Promise<ApiKey>;
  revokeApiKey(appId: string, userId: string): Promise<void>;
  getUserApiKeys(userId: string): Promise<ApiKey[]>;
}

// Interface for request body
export interface CreateApiKeyRequest {
  appId: string;
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
