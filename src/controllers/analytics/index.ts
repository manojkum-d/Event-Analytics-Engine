import { Request, Response } from 'express';
import { recordEvent } from './services';
import { AnalyticsEvent } from './interfaces';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { httpResponse } from '../../shared/utils/httpResponse';

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
