import {
  Model,
  DataTypes,
  InferAttributes,
  CreationOptional,
  InferCreationAttributes,
  Association,
} from 'sequelize';
import { v4 as uuidV4 } from 'uuid';
import sequelize from '../config/dbConfig';
import App from './App';

class ApiKey extends Model<InferAttributes<ApiKey>, InferCreationAttributes<ApiKey>> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare appId: string;
  declare key: CreationOptional<string>;
  declare isActive: CreationOptional<boolean>;
  declare lastUsed: CreationOptional<Date | null>;
  declare expiresAt: Date;
  declare ipRestrictions: CreationOptional<string[] | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;

  // Add association
  declare app?: App;

  declare static associations: {
    app: Association<ApiKey, App>;
  };
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
    appId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'apps',
        key: 'id',
      },
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
        name: 'idx_api_keys_app_id',
        fields: ['app_id'],
        unique: true, // Only one active API key per app
      },
      {
        name: 'idx_api_keys_key',
        fields: ['key'],
      },
    ],
  }
);

export default ApiKey;
