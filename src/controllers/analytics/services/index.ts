import { createEvent, getEventSummary, getUserStats } from '../repositories';
import {
  AnalyticsEvent,
  EventSummaryRequest,
  EventSummaryResponse,
  UserStatsResponse,
} from '../interfaces';
import Event from '../../../shared/models/Event';
import ApiKey from '../../../shared/models/ApiKey';
import CustomError from '../../../shared/utils/customError';
import DatabaseService from '../../../shared/utils/db/databaseService';
import {
  getFromCache,
  storeInCache,
  deleteByPattern,
  DEFAULT_CACHE_TTL,
} from '../../../shared/utils/redis';
import { parseDateRange } from '../../../shared/helper/dateParser';
import moment from 'moment';

/**
 * Record an analytics event
 */
export const recordEvent = async (apiKeyId: string, eventData: AnalyticsEvent): Promise<Event> => {
  try {
    return await createEvent(apiKeyId, eventData);
  } catch (error) {
    console.error('Error recording event:', error);
    throw new CustomError('Failed to record event', 500);
  }
};

/**
 * Validates if the app belongs to the user
 */
const validateAppOwnership = async (userId: string, appId: string): Promise<void> => {
  const appExists = await DatabaseService.findOne(ApiKey, {
    where: {
      appId,
      userId,
    },
  });

  if (!appExists) {
    throw new CustomError(`App with ID ${appId} not found`, 404);
  }
};

/**
 * Generates a cache key for analytics data
 */
const generateAnalyticsCacheKey = (
  userId: string,
  event: string,
  startDate: moment.Moment,
  endDate: moment.Moment,
  appId?: string
): string => {
  return `analytics:event:${userId}:${event}:${startDate.format('YYYY-MM-DD')}:${endDate.format('YYYY-MM-DD')}:${appId || 'all'}`;
};

/**
 * Get analytics summary for events
 */
export const getEventAnalyticsSummary = async (
  userId: string,
  queryParams: EventSummaryRequest,
  bypassCache: boolean = false
): Promise<EventSummaryResponse> => {
  try {
    // Validate app ownership if app_id provided
    if (queryParams.app_id) {
      await validateAppOwnership(userId, queryParams.app_id);
    }

    // Parse date range
    const { startDate, endDate } = parseDateRange(queryParams.startDate, queryParams.endDate);

    // Generate cache key
    const cacheKey = generateAnalyticsCacheKey(
      userId,
      queryParams.event,
      startDate,
      endDate,
      queryParams.app_id
    );

    // Try to get data from cache (only if bypassCache is false)
    if (!bypassCache) {
      const cachedData = await getFromCache<EventSummaryResponse>(cacheKey);
      if (cachedData) {
        console.log('Using cached data for analytics summary');
        return cachedData;
      }
    } else {
      console.log('Bypassing cache for analytics summary');
      // Delete any existing cache entry
      await deleteByPattern(cacheKey);
    }

    // Get data from database
    const summary = await getEventSummary(userId, {
      ...queryParams,
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
    });

    // Store in cache
    await storeInCache<EventSummaryResponse>(cacheKey, summary, DEFAULT_CACHE_TTL);

    return summary;
  } catch (error) {
    console.error('Error getting event analytics summary:', error);
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to retrieve event analytics summary', 500);
  }
};

/**
 * Get user statistics
 */
export const getUserStatistics = async (
  userId: string,
  trackingUserId: string
): Promise<UserStatsResponse> => {
  try {
    // Get all API keys for this user
    const apiKeys = await ApiKey.findAll({
      where: {
        userId,
      },
      attributes: ['id'],
      raw: true,
    });

    if (apiKeys.length === 0) {
      throw new CustomError('No API keys found for user', 404);
    }

    const apiKeyIds = apiKeys.map((key) => key.id);

    // Generate cache key
    const cacheKey = `user:stats:${trackingUserId}`;

    // Try to get from cache
    const cachedStats = await getFromCache<UserStatsResponse>(cacheKey);
    if (cachedStats) {
      return cachedStats;
    }

    // Get fresh stats from database
    const stats = await getUserStats(trackingUserId, apiKeyIds);

    // Cache the results
    await storeInCache<UserStatsResponse>(cacheKey, stats, DEFAULT_CACHE_TTL);

    return stats;
  } catch (error) {
    console.error('Error getting user statistics:', error);
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to retrieve user statistics', 500);
  }
};
