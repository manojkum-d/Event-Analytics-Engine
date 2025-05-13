import redisClient from '../../config/redisConfig';

// Default cache TTL (1 hour)
export const DEFAULT_CACHE_TTL = 60 * 60;

/**
 * Retrieves data from Redis cache
 * @param key The cache key
 * @returns Parsed cached data or null if not found
 */
export const getFromCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cachedData = await redisClient.get(key);

    if (cachedData) {
      console.log(`Cache HIT: ${key}`);
      return JSON.parse(cachedData) as T;
    }

    console.log(`Cache MISS: ${key}`);
    return null;
  } catch (error) {
    console.error(`Error retrieving from cache (${key}):`, error);
    return null;
  }
};

/**
 * Stores data in Redis cache
 * @param key The cache key
 * @param data The data to store
 * @param ttl Time to live in seconds (default: 1 hour)
 */
export const storeInCache = async <T>(
  key: string,
  data: T,
  ttl: number = DEFAULT_CACHE_TTL
): Promise<boolean> => {
  try {
    await redisClient.set(key, JSON.stringify(data), 'EX', ttl);
    console.log(`Data stored in cache: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    console.error(`Error storing in cache (${key}):`, error);
    return false;
  }
};

/**
 * Deletes keys from Redis by pattern
 * @param pattern The key pattern to match
 * @returns Number of keys deleted
 */
export const deleteByPattern = async (pattern: string): Promise<number> => {
  try {
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
      const deleted = await redisClient.del(...keys);
      console.log(`Deleted ${deleted} keys matching pattern: ${pattern}`);
      return deleted;
    }

    return 0;
  } catch (error) {
    console.error(`Error deleting keys by pattern (${pattern}):`, error);
    return 0;
  }
};

/**
 * Increment a counter in Redis
 * @param key The counter key
 * @param increment The amount to increment
 * @param ttl Optional TTL for the counter
 */
export const incrementCounter = async (
  key: string,
  increment: number = 1,
  ttl?: number
): Promise<number> => {
  try {
    const result = await redisClient.incrby(key, increment);

    // Set TTL if provided
    if (ttl !== undefined) {
      await redisClient.expire(key, ttl);
    }

    return result;
  } catch (error) {
    console.error(`Error incrementing counter (${key}):`, error);
    return 0;
  }
};

/**
 * Add a member to a set with optional TTL
 * @param key The set key
 * @param member The member to add
 * @param ttl Optional TTL for the set
 */
export const addToSet = async (key: string, member: string, ttl?: number): Promise<boolean> => {
  try {
    await redisClient.sadd(key, member);

    // Set TTL if provided
    if (ttl !== undefined) {
      await redisClient.expire(key, ttl);
    }

    return true;
  } catch (error) {
    console.error(`Error adding to set (${key}):`, error);
    return false;
  }
};

/**
 * Get set members count
 * @param key The set key
 */
export const getSetSize = async (key: string): Promise<number> => {
  try {
    return await redisClient.scard(key);
  } catch (error) {
    console.error(`Error getting set size (${key}):`, error);
    return 0;
  }
};

export default redisClient;
