import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../../shared/config/swaggerConfig';
import { envConfig } from '../../shared/config/envConfig';

export const setupSwagger = (app: express.Application): void => {
  // Only set up Swagger in development or if explicitly enabled
  if (envConfig.nodeEnv !== 'production') {
    // Serve swagger docs
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Serve swagger spec as JSON
    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    console.info('Swagger documentation available at /api-docs');
  }
};
