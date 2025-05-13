export const limits: Record<string, any> = {
  default: { maxRequests: 100, windowMs: 60000 },
  collection: { maxRequests: 300, windowMs: 60000 },
  analytics: { maxRequests: 30, windowMs: 60000 },
};
