import {
  Model,
  DataTypes,
  InferAttributes,
  CreationOptional,
  InferCreationAttributes,
} from 'sequelize';
import { v4 as uuidV4 } from 'uuid';

import sequelize from '../config/dbConfig.js';

class Event extends Model<InferAttributes<Event>, InferCreationAttributes<Event>> {
  declare id: CreationOptional<string>;
  declare apiKeyId: string;
  declare event: string;
  declare url: string;
  declare referrer: CreationOptional<string | null>;
  declare device: CreationOptional<string | null>;
  declare ipAddress: CreationOptional<string | null>;
  declare timestamp: Date;
  declare trackingUserId: CreationOptional<string | null>;
  declare sessionId: CreationOptional<string | null>;
  declare pageTitle: CreationOptional<string | null>;
  declare pageLoadTime: CreationOptional<number | null>;
  declare metadata: CreationOptional<object | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

Event.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidV4(),
      primaryKey: true,
    },
    apiKeyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'api_keys',
        key: 'id',
      },
    },
    event: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(2048),
      allowNull: false,
    },
    referrer: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    },
    device: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    trackingUserId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pageTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pageLoadTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'events',
    tableName: 'events',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_events_api_key_id',
        fields: ['api_key_id'],
      },
      {
        name: 'idx_events_event',
        fields: ['event'],
      },
      {
        name: 'idx_events_timestamp',
        fields: ['timestamp'],
      },
      {
        name: 'idx_events_tracking_user_id',
        fields: ['tracking_user_id'],
      },
      {
        name: 'idx_events_session_id',
        fields: ['session_id'],
      },
      // Composite index for common queries by API key and date range
      {
        name: 'idx_events_api_key_timestamp',
        fields: ['api_key_id', 'timestamp'],
      },
      // Composite index for common queries by event type and date range
      {
        name: 'idx_events_event_timestamp',
        fields: ['event', 'timestamp'],
      },
    ],
    // Performance optimization for high-volume insert table
    // Only update timestamps on create, not on update
    updatedAt: false,
  }
);

export default Event;
