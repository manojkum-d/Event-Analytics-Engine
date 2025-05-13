// src/shared/types/analytics.ts
export interface AnalyticsEvent {
  event: string;
  url: string;
  referrer?: string;
  device?: string;
  ipAddress?: string;
  timestamp: string | Date;
  trackingUserId?: string;
  sessionId?: string;
  pageTitle?: string;
  pageLoadTime?: number;
  metadata?: {
    browser?: string;
    os?: string;
    screenSize?: string;
    [key: string]: any;
  };
}

export interface AnalyticsResponse {
  status: number;
  message: string;
  data?: any;
  errors?: string[];
}
