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

export interface UserStatsRequest {
  userId: string;
}

export interface DeviceDetails {
  browser: string;
  os: string;
}

export interface UserStatsResponse {
  userId: string;
  totalEvents: number;
  deviceDetails: DeviceDetails;
  ipAddress: string;
  lastSeen?: Date;
  mostFrequentEvents?: Array<{
    event: string;
    count: number;
  }>;
}

export interface EventMetadata {
  browser?: string;
  os?: string;
  [key: string]: any;
}

export interface EventCountResult {
  event: string;
  count: string | number;
  browser?: string;
  os?: string;
}

export interface RawEventCount {
  event: string;
  count: string;
}
