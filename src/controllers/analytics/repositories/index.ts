import { Sequelize } from 'sequelize';
import DatabaseService from '../../../shared/utils/db/databaseService';
import Event from '../../../shared/models/Event';
import {
  AnalyticsEvent,
  EventSummaryRequest,
  EventSummaryResponse,
  DeviceData,
  UserStatsRequest,
  DeviceDetails,
  UserStatsResponse,
  EventCountResult,
  EventMetadata,
} from '../interfaces';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import ApiKey from '../../../shared/models/ApiKey';
import { Op } from 'sequelize';
import { trackUniqueVisitor, incrementEventCounter } from '../../../shared/helper/cacheHelper';

const now = moment().toDate();

// Define the interface for raw query results
interface RawEventCount {
  event: string;
  count: string; // SQL count returns this as string when using raw: true
}

/**
 * Create a new event record and update Redis counters
 */
export const createEvent = async (apiKeyId: string, eventData: AnalyticsEvent): Promise<Event> => {
  // Create the event in the database
  const event = await DatabaseService.create(Event, {
    id: uuidv4(),
    apiKeyId,
    event: eventData.event,
    url: eventData.url,
    referrer: eventData.referrer || null,
    device: eventData.device || null,
    ipAddress: eventData.ipAddress || null,
    timestamp: now,
    trackingUserId: eventData.trackingUserId || null,
    sessionId: eventData.sessionId || null,
    pageTitle: eventData.pageTitle || null,
    pageLoadTime: eventData.pageLoadTime || null,
    metadata: eventData.metadata || {},
    createdAt: now,
    updatedAt: now,
  });

  // Get app ID from database
  const apiKey = await DatabaseService.findById(ApiKey, apiKeyId);

  if (apiKey && apiKey.appId) {
    // Update Redis counters asynchronously (don't wait for completion)
    Promise.all([
      // Increment event counter
      incrementEventCounter(apiKey.appId, eventData.event),

      // Track unique visitor if trackingUserId is provided
      eventData.trackingUserId
        ? trackUniqueVisitor(apiKey.appId, eventData.trackingUserId)
        : Promise.resolve(),
    ]).catch((error) => {
      console.error('Error updating Redis counters:', error);
    });
  }

  return event;
};

/**
 * Get event summary from database
 */
export const getEventSummary = async (
  userId: string,
  params: EventSummaryRequest
): Promise<EventSummaryResponse> => {
  console.log(`Getting summary for user: ${userId}, event: ${params.event}`);

  const whereClause: any = {
    event: params.event,
  };

  // Add date filtering only if dates are provided
  if (params.startDate && params.endDate) {
    const startDate = moment(params.startDate).startOf('day').toDate();
    const endDate = moment(params.endDate).endOf('day').toDate();
    whereClause.timestamp = {
      [Op.between]: [startDate, endDate],
    };
    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
  } else {
    // Default to a very wide date range to include all events
    const startDate = moment().subtract(1, 'year').startOf('day').toDate();
    const endDate = moment().add(1, 'year').endOf('day').toDate();
    whereClause.timestamp = {
      [Op.between]: [startDate, endDate],
    };
    console.log(`Using default date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
  }

  // First get all API keys for this user
  const apiKeys = await ApiKey.findAll({
    where: {
      userId,
    },
    raw: true,
  });

  console.log(`Found ${apiKeys.length} API keys for user ${userId}`);

  if (apiKeys.length === 0) {
    console.log('No API keys found for user');
    return {
      event: params.event,
      count: 0,
      uniqueUsers: 0,
      deviceData: {
        mobile: 0,
        desktop: 0,
      },
    };
  }

  // Extract just the IDs
  const apiKeyIds = apiKeys.map((key) => key.id);
  console.log(`API key IDs: ${apiKeyIds.join(', ')}`);

  // Add API key filter to where clause
  whereClause.api_key_id = {
    [Op.in]: apiKeyIds,
  };

  // Filter by app if specified
  if (params.app_id) {
    const appApiKeys = await ApiKey.findAll({
      where: {
        userId,
        appId: params.app_id,
      },
      raw: true,
    });

    if (appApiKeys.length === 0) {
      console.log(`No API keys found for app ${params.app_id}`);
      return {
        event: params.event,
        count: 0,
        uniqueUsers: 0,
        deviceData: {
          mobile: 0,
          desktop: 0,
        },
      };
    }

    const appApiKeyIds = appApiKeys.map((key) => key.id);
    console.log(
      `Found ${appApiKeys.length} API keys for app ${params.app_id}: ${appApiKeyIds.join(', ')}`
    );
    whereClause.api_key_id = {
      [Op.in]: appApiKeyIds,
    };
  }

  // Log the final where clause for debugging
  console.log('Final where clause:', JSON.stringify(whereClause, null, 2));

  // Get total count
  const totalCount = await Event.count({
    where: whereClause,
    logging: (sql) => console.log('Count query:', sql),
  });
  console.log(`Total event count: ${totalCount}`);

  // Get unique users count
  const uniqueUsers = await Event.count({
    where: whereClause,
    distinct: true,
    col: 'tracking_user_id',
    logging: (sql) => console.log('Unique users query:', sql),
  });
  console.log(`Unique users count: ${uniqueUsers}`);

  // Get device breakdown
  const deviceData = await Event.findAll({
    where: whereClause,
    attributes: ['device', [Sequelize.fn('COUNT', '*'), 'count']],
    group: ['device'],
    raw: true,
    logging: (sql) => console.log('Device data query:', sql),
  });

  console.log('Device data from DB:', JSON.stringify(deviceData, null, 2));

  // Initialize device data with default values
  const deviceCounts: DeviceData = {
    mobile: 0,
    desktop: 0,
  };

  // Update counts from query results
  deviceData.forEach((record: any) => {
    const device = record.device?.toLowerCase() as 'mobile' | 'desktop' | undefined;
    if (device === 'mobile' || device === 'desktop') {
      deviceCounts[device] = parseInt(record.count);
    }
  });

  return {
    event: params.event,
    count: totalCount,
    uniqueUsers,
    deviceData: deviceCounts,
  };
};

/**
 * Get user statistics from events
 */
export const getUserStats = async (
  trackingUserId: string,
  apiKeyIds: string[]
): Promise<UserStatsResponse> => {
  // Get total events count
  const totalEvents = await Event.count({
    where: {
      trackingUserId,
      apiKeyId: {
        [Op.in]: apiKeyIds,
      },
    },
  });

  // Get most recent event for device details and IP
  const latestEvent = await Event.findOne({
    where: {
      trackingUserId,
      apiKeyId: {
        [Op.in]: apiKeyIds,
      },
    },
    order: [['timestamp', 'DESC']],
    raw: true,
    attributes: ['ip_address', 'timestamp', 'metadata'],
  });

  // Get most frequent events with proper typing
  const eventCounts = (await Event.findAll({
    where: {
      trackingUserId,
      apiKeyId: {
        [Op.in]: apiKeyIds,
      },
    },
    attributes: ['event', [Sequelize.fn('COUNT', '*'), 'count']],
    group: ['event'],
    order: [[Sequelize.fn('COUNT', '*'), 'DESC']],
    limit: 5,
    raw: true,
  })) as unknown as RawEventCount[]; // Cast the raw query result

  // Safely extract metadata and cast to our interface
  const metadata = latestEvent?.metadata as EventMetadata | undefined;

  // Extract device details from metadata with type safety
  const deviceDetails: DeviceDetails = {
    browser: metadata?.browser || 'Unknown',
    os: metadata?.os || 'Unknown',
  };

  return {
    userId: trackingUserId,
    totalEvents: totalEvents as unknown as number,
    deviceDetails,
    ipAddress: latestEvent?.ipAddress || 'Unknown',
    lastSeen: latestEvent?.timestamp,
    mostFrequentEvents: eventCounts.map((ec) => ({
      event: ec.event,
      count: parseInt(ec.count, 10), // Always parse as integer with radix
    })),
  };
};
