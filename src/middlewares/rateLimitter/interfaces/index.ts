export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message: string; // Error message
}

// Different limit tiers
export const limits: Record<string, RateLimitConfig> = {
  // Standard API endpoints
  default: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    message: 'Too many requests, please try again later.',
  },

  // Data collection endpoint - higher limit
  collection: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 300, // 300 requests per minute
    message: 'Too many data collection requests, please try again later.',
  },

  // Analytics endpoints - lower limit as they're more resource-intensive
  analytics: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
    message: 'Too many analytics requests, please try again later.',
  },
};
