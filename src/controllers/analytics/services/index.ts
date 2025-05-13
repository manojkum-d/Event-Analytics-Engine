import { createEvent } from '../repositories';
import { AnalyticsEvent } from '../interfaces';
import Event from '../../../shared/models/Event';
import ApiKey from '../../../shared/models/ApiKey';
import CustomError from '../../../shared/utils/customError';

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
 * Check if IP address is allowed for the API key
 */
export const isIpAllowed = (apiKey: ApiKey, requestIp: string): boolean => {
  if (
    !apiKey.ipRestrictions ||
    !Array.isArray(apiKey.ipRestrictions) ||
    apiKey.ipRestrictions.length === 0
  ) {
    return true;
  }

  return apiKey.ipRestrictions.includes(requestIp);
};
