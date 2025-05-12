import { App } from '../../../shared/models';

export interface CreateAppOptions {
  name: string;
  description?: string;
  url?: string;
}

export interface AppResponse {
  id: string;
  name: string;
  description?: string;
  url?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface IAppService {
  createApp(userId: string, options: CreateAppOptions): Promise<App>;
  getUserApps(userId: string): Promise<App[]>;
  updateApp(appId: string, userId: string, options: Partial<CreateAppOptions>): Promise<App>;
  deactivateApp(appId: string, userId: string): Promise<void>;
  getAppById(appId: string): Promise<App>;
}
