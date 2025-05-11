import swaggerJsdoc from 'swagger-jsdoc';
import { envConfig } from './envConfig';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Analytics Engine API',
      version: '1.0.0',
      description: 'Unified Event Analytics Engine for Web and Mobile Apps',
      contact: {
        name: 'API Support',
        email: 'support@analytics-engine.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${envConfig.port}/api/v1`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key for analytics data collection endpoints',
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authorization token',
        },
      },
    },
  },
  apis: ['./src/routes/**/*.ts', './src/shared/models/*.ts'], // Routes and models where JSDoc comments are added
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
