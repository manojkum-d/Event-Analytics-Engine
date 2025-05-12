import { ApiKey, App, Event, User } from './index';

// User to App (one-to-many)
User.hasMany(App, {
  foreignKey: 'userId',
  as: 'apps',
  onDelete: 'CASCADE',
});

App.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// App to ApiKey (one-to-one)
App.hasOne(ApiKey, {
  foreignKey: 'appId',
  as: 'apiKey',
  onDelete: 'CASCADE',
});

ApiKey.belongsTo(App, {
  foreignKey: 'appId',
  as: 'app',
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

// Function to initialize all associations
export const initializeAssociations = (): void => {
  // The associations are defined when this module is imported
  console.log('Model associations initialized');
};
