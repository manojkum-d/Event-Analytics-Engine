import { Request, Response } from 'express';
import { recordEvent } from './services';
import { AnalyticsEvent } from './interfaces';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { httpResponse } from '../../shared/utils/httpResponse';
import CustomError from '../../shared/utils/customError';
import { getEventAnalyticsSummary } from './services';
import { EventSummaryRequest } from './interfaces';

/**
 * Collect analytics event
 */
export const collectEvent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const eventData = req.body as AnalyticsEvent;
  const apiKey = req.apiKey!;

  // Ensure we have an IP address
  const clientIp = req.ip || req.socket.remoteAddress || '';
  if (!eventData.ipAddress) {
    eventData.ipAddress = clientIp;
  }

  // Record the event
  const event = await recordEvent(apiKey.id, eventData);

  res.status(201).json(
    httpResponse({
      status: 201,
      message: 'Event recorded successfully',
      data: {
        eventId: event.id,
        event: event.event,
        url: event.url,
        timestamp: event.timestamp,
        metadata: event.metadata,
        createdAt: event.createdAt,
      },
    })
  );
}, 'collectEventHandler');

/**
 * Get event analytics summary
 */
export const getEventSummary = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    throw new CustomError('Unauthorized', 401);
  }

  // Get query parameters
  const queryParams: EventSummaryRequest = {
    event: req.query.event as string,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
    app_id: req.query.app_id as string,
  };

  // Validate required parameters
  if (!queryParams.event) {
    throw new CustomError('Event type is required', 400);
  }

  // Check if we should bypass cache
  const bypassCache = req.query.nocache === 'true';

  // Get analytics summary
  const summary = await getEventAnalyticsSummary(userId, queryParams, bypassCache);

  res.status(200).json(
    httpResponse({
      status: 200,
      message: 'Analytics summary retrieved successfully',
      data: summary,
    })
  );
}, 'getEventSummaryHandler');
