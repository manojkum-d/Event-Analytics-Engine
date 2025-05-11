import { Sequelize } from 'sequelize';

import { envConfig } from './envConfig.js';
import { initializeAssociations } from '../models/association.js';

/**
 * Sequelize instance for database connection
 */
export const sequelize = new Sequelize(envConfig.dbName, envConfig.dbUser, '', {
  host: envConfig.dbHost,
  port: envConfig.dbPort,
  dialect: 'postgres',
  define: {
    freezeTableName: true,
  },
  logging: false,
  dialectOptions: { ssl: false },
  pool: {
    max: 10,
    min: 0,
    idle: 10000,
    acquire: 600000,
  },
});

/**
 * Function to authenticate the database connection
 */
export const connectDb = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.info(`✔ Database connection established successfully on host: ${envConfig.dbHost}`);

    // Initialize model associations
    initializeAssociations();
    // Sync models with database (in development only)
    if (envConfig.nodeEnv === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database models synchronized');
    }
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};
