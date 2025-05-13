import { Request, Response, NextFunction, RequestHandler } from 'express';
import redisClient from '../../shared/config/redisConfig';
import { httpResponse } from '../../shared/utils/httpResponse';
import { limits } from './interfaces';

/**
 * Create rate limiter middleware
 * @param type Limit tier to apply
 * @returns Express middleware function
 */
export const rateLimiter = (type: keyof typeof limits = 'default'): RequestHandler => {
  const config = limits[type];

  return (req: Request, res: Response, next: NextFunction): void => {
    (async () => {
      try {
        // Get client identifier - use API key, user ID, or IP address
        const identifier = req.apiKey?.id || req.user?.id || req.ip || 'unknown';

        // Create Redis key
        const key = `ratelimit:${type}:${identifier}`;

        // Get current count and timestamp
        const data = await redisClient.hgetall(key);
        const now = Date.now();
        const windowStart = Number(data.windowStart) || now;
        let requestCount = Number(data.requestCount) || 0;

        // Reset if window has expired
        if (now > windowStart + config.windowMs) {
          requestCount = 0;
        }

        // Check if limit exceeded
        if (requestCount >= config.maxRequests) {
          // Calculate remaining time in seconds
          const windowExpireSeconds = Math.ceil((windowStart + config.windowMs - now) / 1000);

          // Set headers
          res.set('X-RateLimit-Limit', config.maxRequests.toString());
          res.set('X-RateLimit-Remaining', '0');
          res.set(
            'X-RateLimit-Reset',
            Math.floor((now + windowExpireSeconds * 1000) / 1000).toString()
          );
          res.set('Retry-After', windowExpireSeconds.toString());

          // Return rate limit error
          res.status(429).json(
            httpResponse({
              status: 429,
              message: config.message,
            })
          );
          return;
        }

        // Increment count
        requestCount++;

        // Update Redis (use multi to ensure atomicity)
        const multi = redisClient.multi();

        // Set new values
        multi.hset(key, 'windowStart', windowStart.toString());
        multi.hset(key, 'requestCount', requestCount.toString());

        // Set expiry (window time + buffer)
        multi.expire(key, Math.floor(config.windowMs / 1000) + 10);

        // Execute Redis transaction
        await multi.exec();

        // Set rate limit headers
        res.set('X-RateLimit-Limit', config.maxRequests.toString());
        res.set('X-RateLimit-Remaining', (config.maxRequests - requestCount).toString());
        res.set('X-RateLimit-Reset', Math.floor((windowStart + config.windowMs) / 1000).toString());

        next();
      } catch (error) {
        console.error('Rate limiter error:', error);
        // Don't block the request if rate limiter fails
        next();
      }
    })();
  };
};
