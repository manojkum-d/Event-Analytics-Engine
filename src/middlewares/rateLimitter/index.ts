import { limits } from '../../shared/config/rateLimitConfig';
import redisClient from '../../shared/utils/redis';
import moment from 'moment';

/**
 * Check current rate limit status for a client
 * @param identifier Client identifier (API key, user ID, IP)
 * @param type Rate limit tier
 * @returns Rate limit information
 */
export const getRateLimitStatus = async (
  identifier: string,
  type: string = 'default'
): Promise<{
  remaining: number;
  limit: number;
  resetAt: Date;
  isLimited: boolean;
}> => {
  // Create Redis key
  const key = `ratelimit:${type}:${identifier}`;

  // Get current count and timestamp
  const data = await redisClient.hgetall(key);
  const now = moment().unix();

  // If no data found, client is not rate limited
  if (!data.windowStart) {
    return {
      remaining: 100, // Default max requests
      limit: 100,
      resetAt: new Date(now),
      isLimited: false,
    };
  }

  const config = limits[type] || limits.default;
  const windowStart = Number(data.windowStart);
  const requestCount = Number(data.requestCount) || 0;

  // Reset if window has expired
  if (now > windowStart + config.windowMs) {
    return {
      remaining: config.maxRequests,
      limit: config.maxRequests,
      resetAt: new Date(now),
      isLimited: false,
    };
  }

  const remaining = Math.max(0, config.maxRequests - requestCount);
  const resetAt = new Date(windowStart + config.windowMs);

  return {
    remaining,
    limit: config.maxRequests,
    resetAt,
    isLimited: remaining === 0,
  };
};
