import { addToSet, getSetSize, incrementCounter } from '../utils/redis';
import moment from 'moment';

/**
 * Track unique visitors by adding to Redis sets
 * @param appId Application ID
 * @param trackingUserId User tracking ID
 * @param date Optional date string (defaults to today)
 */
export const trackUniqueVisitor = async (
  appId: string,
  trackingUserId: string,
  date: string = moment().format('YYYY-MM-DD')
): Promise<void> => {
  const key = `unique:${appId}:${date}`;
  await addToSet(key, trackingUserId, 86400 * 7); // 7 days TTL
};

/**
 * Count unique visitors for an app on a specific date
 * @param appId Application ID
 * @param date Date string (YYYY-MM-DD)
 */
export const getUniqueVisitorsCount = async (
  appId: string,
  date: string = moment().format('YYYY-MM-DD')
): Promise<number> => {
  const key = `unique:${appId}:${date}`;
  return await getSetSize(key);
};

/**
 * Increment event counter in Redis
 * @param appId Application ID
 * @param eventType Event type
 * @param count Amount to increment
 * @param date Optional date string (defaults to today)
 */
export const incrementEventCounter = async (
  appId: string,
  eventType: string,
  count: number = 1,
  date: string = moment().format('YYYY-MM-DD')
): Promise<number> => {
  const key = `count:${appId}:${eventType}:${date}`;
  return await incrementCounter(key, count, 86400 * 7); // 7 days TTL
};

/**
 * Parse date range with defaults
 * @param startDate Optional start date string
 * @param endDate Optional end date string
 * @returns Parsed start and end date moments
 */
export const parseDateRange = (
  startDate?: string,
  endDate?: string
): { startDate: moment.Moment; endDate: moment.Moment } => {
  const parsedEndDate = endDate ? moment(endDate).endOf('day') : moment().endOf('day');
  const parsedStartDate = startDate
    ? moment(startDate).startOf('day')
    : moment(parsedEndDate).subtract(7, 'days').startOf('day');

  return {
    startDate: parsedStartDate,
    endDate: parsedEndDate,
  };
};
