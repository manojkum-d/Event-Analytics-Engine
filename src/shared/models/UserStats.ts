import {
  Model,
  DataTypes,
  InferAttributes,
  CreationOptional,
  InferCreationAttributes,
} from 'sequelize';
import { v4 as uuidV4 } from 'uuid';

import sequelize from '../config/dbConfig';

class UserStats extends Model<InferAttributes<UserStats>, InferCreationAttributes<UserStats>> {
  declare id: CreationOptional<string>;
  declare apiKeyId: string;
  declare trackingUserId: string;
  declare totalEvents: number;
  declare firstSeen: Date;
  declare lastSeen: Date;
  declare deviceDetails: object;
  declare ipAddresses: string[];
  declare recentEvents: object[];
  declare cacheKey: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

UserStats.init(
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
    trackingUserId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    totalEvents: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    firstSeen: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    lastSeen: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deviceDetails: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    ipAddresses: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    recentEvents: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
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
    modelName: 'user_stats',
    tableName: 'user_stats',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_user_stats_api_key_id',
        fields: ['api_key_id'],
      },
      {
        name: 'idx_user_stats_tracking_user_id',
        fields: ['tracking_user_id'],
      },
      {
        name: 'idx_user_stats_cache_key',
        fields: ['cache_key'],
      },
      {
        name: 'idx_user_stats_composite',
        fields: ['api_key_id', 'tracking_user_id'],
        unique: true,
      },
    ],
  }
);

export default UserStats;
