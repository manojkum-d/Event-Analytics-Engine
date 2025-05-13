# Analytics Engine

A scalable backend API for Website and Mobile App Analytics that collects and processes detailed user events. The system handles high traffic, provides efficient data aggregation, and is containerized for easy deployment.

## Features

### API Key Management
- Website and app registration with API key generation
- API key authentication for secure data transmission
- Key management including creation, revocation, and expiration handling
- Google OAuth for user authentication

### Event Data Collection
- Collects analytics events (page views, clicks, form submissions)
- Records referrer information, device metrics, and browser details
- Ensures data integrity and high availability
- Rate limiting for API protection

### Analytics & Reporting
- Time-based and event-based data aggregation
- App-based and user-based analytics
- Redis caching for frequently requested data
- Detailed insights on user behavior and device usage

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Caching**: Redis
- **Authentication**: Passport.js, Google OAuth, JWT
- **Containerization**: Docker, Docker Compose
- **Documentation**: Swagger/OpenAPI
- **Testing**: Mocha, Chai

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new website/app and generate API key
- `GET /api/v1/auth/api-keys` - List all API keys for the current user
- `GET /api/v1/auth/:appId/api-key` - Retrieve API key for a specific app
- `POST /api/v1/auth/:appId/revoke-key` - Revoke an API key
- `GET /api/v1/auth/google` - Initiate Google OAuth authentication
- `GET /api/v1/auth/me` - Get current user info

### Analytics
- `POST /api/v1/analytics/collect` - Submit analytics events
- `GET /api/v1/analytics/event-summary` - Get event analytics summary
- `GET /api/v1/analytics/user-stats` - Get user-specific statistics

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)
- PostgreSQL (for local development)
- Redis (for local development)

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=3000
BACKEND_URL=http://localhost:3001

# For Docker
DB_HOST=host.docker.internal
DB_PORT=5432
DB_NAME=eventAnalytics
DB_USER=your_db_user
DB_PASSWORD=your_db_password

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=3d

API_KEY_EXPIRATION_DAYS=10

# For Docker
REDIS_HOST=host.docker.internal
REDIS_PORT=6379

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback
SESSION_SECRET=your_session_secret
```

### Running with Docker

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/analytics-engine.git
   cd analytics-engine
   ```

2. Build and start the container:
   ```bash
   docker-compose up --build
   ```

3. The API will be available at:
   ```
   http://localhost:3001/api/v1
   ```

4. Access Swagger documentation at:
   ```
   http://localhost:3001/api-docs
   ```

### Local Development Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

## Usage Examples

### Register a New App
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "appName": "My Website",
    "description": "Personal blog analytics",
    "appUrl": "https://example.com",
    "ipRestrictions": ["192.168.1.1"]
  }'
```

### Track an Event
```bash
curl -X POST http://localhost:3001/api/v1/analytics/collect \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "event": "page_view",
    "url": "https://example.com/blog/post-1",
    "referrer": "https://google.com",
    "device": "mobile",
    "timestamp": "2024-02-20T12:34:56Z",
    "metadata": {
      "browser": "Chrome",
      "os": "Android",
      "screenSize": "1080x1920"
    }
  }'
```

### Get Event Summary
```bash
curl -X GET "http://localhost:3001/api/v1/analytics/event-summary?event=page_view&startDate=2024-05-01&endDate=2024-05-15" \
  -H "X-API-Key: YOUR_API_KEY"
```

## Project Structure

```
analytics-engine/
├── src/
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── models/           # Sequelize models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── shared/           # Shared utilities
│   │   ├── config/       # Configuration files
│   │   ├── types/        # TypeScript interfaces
│   │   ├── utils/        # Utility functions
│   │   └── validators/   # Input validation
│   ├── app.ts            # Express app setup
│   └── index.ts          # Application entry point
├── docker-compose.yaml   # Docker Compose configuration
├── dockerfile            # Docker configuration
├── .env                  # Environment variables
├── .env.example          # Example environment variables
├── tsconfig.json         # TypeScript configuration
├── package.json          # Project dependencies
└── README.md             # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Express.js team for the excellent web framework
- Sequelize ORM for database interactions
- Docker for containerization support
