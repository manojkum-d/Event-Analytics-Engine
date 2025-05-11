import { ApiKey, Event, EventSummary, User, UserStats } from './index.js';

// User to ApiKey (one-to-many)
User.hasMany(ApiKey, {
  foreignKey: 'userId',
  as: 'apiKeys',
  onDelete: 'CASCADE',
});

ApiKey.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// ApiKey to Event (one-to-many)
ApiKey.hasMany(Event, {
  foreignKey: 'apiKeyId',
  as: 'events',
  onDelete: 'CASCADE',
});

Event.belongsTo(ApiKey, {
  foreignKey: 'apiKeyId',
  as: 'apiKey',
});

// ApiKey to EventSummary (one-to-many)
ApiKey.hasMany(EventSummary, {
  foreignKey: 'apiKeyId',
  as: 'eventSummaries',
  onDelete: 'CASCADE',
});

EventSummary.belongsTo(ApiKey, {
  foreignKey: 'apiKeyId',
  as: 'apiKey',
});

// ApiKey to UserStats (one-to-many)
ApiKey.hasMany(UserStats, {
  foreignKey: 'apiKeyId',
  as: 'userStats',
  onDelete: 'CASCADE',
});

UserStats.belongsTo(ApiKey, {
  foreignKey: 'apiKeyId',
  as: 'apiKey',
});

// Function to initialize all associations
export const initializeAssociations = (): void => {
  // The associations are defined when this module is imported
  console.log('Model associations initialized');
};
