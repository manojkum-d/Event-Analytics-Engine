import DatabaseService from '../../../shared/utils/db/databaseService';
import Event from '../../../shared/models/Event';
import { AnalyticsEvent } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

const now = moment().toDate();
/**
 * Create a new event record
 */
export const createEvent = async (apiKeyId: string, eventData: AnalyticsEvent): Promise<Event> => {
  return DatabaseService.create(Event, {
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
};
