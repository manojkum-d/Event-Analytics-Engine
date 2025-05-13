import { Sequelize } from 'sequelize';
import DatabaseService from '../../../shared/utils/db/databaseService';
import Event from '../../../shared/models/Event';
import {
  AnalyticsEvent,
  EventSummaryRequest,
  EventSummaryResponse,
  DeviceData,
  DeviceDetails,
  UserStatsResponse,
  EventMetadata,
  RawEventCount,
} from '../interfaces';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import ApiKey from '../../../shared/models/ApiKey';
import { Op } from 'sequelize';
import { trackUniqueVisitor, incrementEventCounter } from '../../../shared/helper/cacheHelper';

const now = moment().toDate();

/**
 * Create a new event record and update Redis counters
 */
export const createEvent = async (apiKeyId: string, eventData: AnalyticsEvent): Promise<Event> => {
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

  const apiKey = await DatabaseService.findById(ApiKey, apiKeyId);

  if (apiKey && apiKey.appId) {
    Promise.all([
      incrementEventCounter(apiKey.appId, eventData.event),
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
  const whereClause: any = {
    event: params.event,
  };

  if (params.startDate && params.endDate) {
    const startDate = moment(params.startDate).startOf('day').toDate();
    const endDate = moment(params.endDate).endOf('day').toDate();
    whereClause.timestamp = {
      [Op.between]: [startDate, endDate],
    };
  } else {
    const startDate = moment().subtract(1, 'year').startOf('day').toDate();
    const endDate = moment().add(1, 'year').endOf('day').toDate();
    whereClause.timestamp = {
      [Op.between]: [startDate, endDate],
    };
  }

  const apiKeys = await ApiKey.findAll({
    where: {
      userId,
    },
    raw: true,
  });

  if (apiKeys.length === 0) {
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

  const apiKeyIds = apiKeys.map((key) => key.id);
  whereClause.api_key_id = {
    [Op.in]: apiKeyIds,
  };

  if (params.app_id) {
    const appApiKeys = await ApiKey.findAll({
      where: {
        userId,
        appId: params.app_id,
      },
      raw: true,
    });

    if (appApiKeys.length === 0) {
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
    whereClause.api_key_id = {
      [Op.in]: appApiKeyIds,
    };
  }

  const totalCount = await Event.count({
    where: whereClause,
  });

  const uniqueUsers = await Event.count({
    where: whereClause,
    distinct: true,
    col: 'tracking_user_id',
  });

  const deviceData = await Event.findAll({
    where: whereClause,
    attributes: ['device', [Sequelize.fn('COUNT', '*'), 'count']],
    group: ['device'],
    raw: true,
  });

  const deviceCounts: DeviceData = {
    mobile: 0,
    desktop: 0,
  };

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
  const totalEvents = await Event.count({
    where: {
      trackingUserId,
      apiKeyId: {
        [Op.in]: apiKeyIds,
      },
    },
  });

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
  })) as unknown as RawEventCount[];

  const metadata = latestEvent?.metadata as EventMetadata | undefined;

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
      count: parseInt(ec.count, 10),
    })),
  };
};
