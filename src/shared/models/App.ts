import {
  Model,
  DataTypes,
  InferAttributes,
  CreationOptional,
  InferCreationAttributes,
} from 'sequelize';
import { v4 as uuidV4 } from 'uuid';
import sequelize from '../config/dbConfig';

class App extends Model<InferAttributes<App>, InferCreationAttributes<App>> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare name: string;
  declare description: CreationOptional<string | null>;
  declare url: CreationOptional<string | null>;
  declare isActive: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

App.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    modelName: 'apps',
    tableName: 'apps',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_apps_user_id',
        fields: ['user_id'],
      },
      {
        name: 'idx_apps_name',
        fields: ['name'],
      },
    ],
  }
);

export default App;
