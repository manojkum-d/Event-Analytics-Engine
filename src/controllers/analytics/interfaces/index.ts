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

export interface EventSummaryRequest {
  event: string;
  startDate?: string;
  endDate?: string;
  app_id?: string;
}

export interface DeviceData {
  mobile: number;
  desktop: number;
}

export interface BrowserData {
  [key: string]: number;
}

export interface OsData {
  [key: string]: number;
}

export interface EventSummaryResponse {
  event: string;
  count: number;
  uniqueUsers: number;
  deviceData: DeviceData;
  browserData?: BrowserData;
  osData?: OsData;
  timeDistribution?: Record<string, number>;
  referrers?: Record<string, number>;
  startDate?: string;
  endDate?: string;
}
