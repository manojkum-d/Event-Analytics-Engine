import {
  Model,
  DataTypes,
  InferAttributes,
  CreationOptional,
  InferCreationAttributes,
} from 'sequelize';
import { v4 as uuidV4 } from 'uuid';

import { sequelize } from '../config/dbConfig.js';

class EventSummary extends Model<
  InferAttributes<EventSummary>,
  InferCreationAttributes<EventSummary>
> {
  declare id: CreationOptional<string>;
  declare apiKeyId: string;
  declare event: string;
  declare date: Date;
  declare totalCount: number;
  declare uniqueUsers: number;
  declare deviceData: object;
  declare browserData: object;
  declare osData: object;
  declare hourlyDistribution: object;
  declare referrerData: object;
  declare cacheKey: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

EventSummary.init(
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    totalCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    uniqueUsers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    deviceData: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    browserData: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    osData: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    hourlyDistribution: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    referrerData: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    cacheKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
    modelName: 'event_summaries',
    tableName: 'event_summaries',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_event_summaries_api_key_id',
        fields: ['api_key_id'],
      },
      {
        name: 'idx_event_summaries_event',
        fields: ['event'],
      },
      {
        name: 'idx_event_summaries_date',
        fields: ['date'],
      },
      {
        name: 'idx_event_summaries_cache_key',
        fields: ['cache_key'],
      },
      {
        name: 'idx_event_summaries_composite',
        fields: ['api_key_id', 'event', 'date'],
        unique: true,
      },
    ],
  }
);

export default EventSummary;
