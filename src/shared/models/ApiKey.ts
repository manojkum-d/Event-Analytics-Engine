import {
  Model,
  DataTypes,
  InferAttributes,
  CreationOptional,
  InferCreationAttributes,
} from 'sequelize';
import { v4 as uuidV4 } from 'uuid';

import { sequelize } from '../config/dbConfig.js';

class ApiKey extends Model<InferAttributes<ApiKey>, InferCreationAttributes<ApiKey>> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare appName: string;
  declare key: CreationOptional<string>;
  declare isActive: CreationOptional<boolean>;
  declare lastUsed: CreationOptional<Date | null>;
  declare expiresAt: Date;
  declare description: CreationOptional<string | null>;
  declare appUrl: CreationOptional<string | null>;
  declare ipRestrictions: CreationOptional<string[] | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

ApiKey.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidV4(),
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    appName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    key: {
      type: DataTypes.UUID,
      defaultValue: () => uuidV4(),
      allowNull: false,
      unique: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastUsed: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    appUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ipRestrictions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
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
    modelName: 'api_keys',
    tableName: 'api_keys',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_api_keys_user_id',
        fields: ['user_id'],
      },
      {
        name: 'idx_api_keys_key',
        fields: ['key'],
      },
    ],
  }
);

export default ApiKey;
