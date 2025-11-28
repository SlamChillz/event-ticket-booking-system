# Great Brands Booking System

A Node.js RESTful API for an event ticket booking system with concurrent booking support, waitlist management, and comprehensive error handling.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Tools & Technologies](#tools--technologies)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Architecture & Design Decisions](#architecture--design-decisions)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- **Node.js**: >= 20.18.2
- **npm**: >= 10.8.2 or **yarn**: >= 1.22.22
- **PostgreSQL**: 15.0 or higher
- **Docker Engine** (optional, for containerized setup)

## Tools & Technologies

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with TypeORM
- **Authentication**: Basic Authentication (Base64 encoded)
- **Validation**: Joi
- **Testing**: Jest with Supertest
- **Logging**: Winston
- **Rate Limiting**: express-rate-limit
- **Containerization**: Docker & Docker Compose

## Project Structure

```
great-brands-booking-system/
├── src/
│   ├── api/rest/           # REST API layer
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Auth, validation middleware
│   │   ├── routes/         # Route definitions
│   │   ├── validation/     # Joi schemas
│   │   └── server.ts       # Express server setup
│   ├── cache/              # In-memory cache implementation
│   ├── config/             # Configuration management
│   ├── database/           # Database setup & entities
│   │   └── entity/         # TypeORM entities
│   ├── repository/         # Data access layer
│   ├── services/           # Business logic layer
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions (logger)
│   └── server.ts           # Application entry point
├── test/                   # Test files
│   ├── integration/        # Integration tests
│   ├── unit/               # Unit tests
│   ├── setup.ts            # Test setup
│   └── teardown.ts         # Test teardown
├── coverage/               # Test coverage reports
└── docker-compose.yaml     # Docker services configuration
```

## Setup & Installation

### Option 1: Docker (Recommended)

1. Clone the repository
2. Set up environment variables (see [Environment Variables](#environment-variables))
3. Run the application:
   ```bash
   docker compose up --build app db
   ```

### Option 2: Host Machine

1. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Set up environment variables** (see [Environment Variables](#environment-variables))

3. **Build the application**:
   ```bash
   npm run build
   # or
   yarn build
   ```

4. **Start the server**:
   ```bash
   npm run start
   # or
   yarn start
   ```

### Development Mode

For development with hot-reload:
```bash
npm run dev
# or
yarn dev
```

## Environment Variables

### Application Variables (`.env`)

Create a `.env` file in the root directory:

```env
# Server Configuration
REST_PORT=3000
NODE_ENV=development
REST_VERSION=latest

# Database Configuration (Production/Development)
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=booking_system

# Database Configuration (Test)
DB_TYPE_TEST=postgres
DB_HOST_TEST=localhost
DB_PORT_TEST=5433
DB_USER_TEST=test_user
DB_PASSWORD_TEST=test_password
DB_NAME_TEST=test_booking_system

# Hash Configuration
HASH_SALT=10
```

### Database Variables (`db.env`)

Create a `db.env` file for Docker database setup:

```env
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=booking_system
```

**Note**: Copy `.env.sample` to `.env` and `db.env.sample` to `db.env`, then update with your values.

## API Documentation

**Postman Collection**: [View API Documentation](https://documenter.getpostman.com/view/16722310/2sAYX9mzyZ)

**Base URL**: `http://localhost:3000/api/v1`

### Authentication

All protected endpoints require Basic Authentication:

```
Authorization: Basic base64(username:password)
```

Example:
```bash
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```

### Rate Limiting

- **Limit**: 50 requests per 15 minutes per IP
- Applies to all endpoints

### Endpoints

#### 1. Create User

**POST** `/api/v1/users`

Create a new user account.

**Request Body**:
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Validation**:
- `username`: string, minimum 3 characters, required
- `password`: string, minimum 8 characters, required

**Success Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "message": "User created successfully.",
  "data": {
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "created_at": "2025-11-28T...",
      "updated_at": "2025-11-28T..."
    }
  }
}
```

**Error Responses**:
- `409 Conflict`: Username already exists
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

---

#### 2. Initialize Event

**POST** `/api/v1/initialize`

Create a new event with a specified number of tickets.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Summer Music Festival",
  "no_tickets": 100
}
```

**Validation**:
- `name`: string, minimum 3 characters, required
- `no_tickets`: number, required

**Success Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "message": "Event created",
  "data": {
    "event": {
      "id": "uuid",
      "name": "summer music festival",
      "total_tickets": 100,
      "available_tickets": 100,
      "created_at": "2025-11-28T...",
      "updated_at": "2025-11-28T..."
    }
  }
}
```

**Error Responses**:
- `409 Conflict`: Event name already exists
- `401 Unauthorized`: Missing or invalid authentication
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

---

#### 3. Book Ticket

**POST** `/api/v1/book`

Book a ticket for an event. If tickets are sold out, the user is added to the waitlist.

**Authentication**: Required

**Request Body**:
```json
{
  "eventId": "uuid"
}
```

**Validation**:
- `eventId`: string, UUID format, required

**Success Response - Booking Successful** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "message": "Event booked",
  "data": {
    "booking": {
      "id": "uuid",
      "status": "booked",
      "user": {...},
      "event": {...},
      "created_at": "2025-11-28T..."
    },
    "waitList": null
  }
}
```

**Success Response - Added to Waitlist** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "message": "Added to event wait list",
  "data": {
    "booking": null,
    "waitList": {
      "id": 1,
      "user": {...},
      "event": {...},
      "created_at": "2025-11-28T..."
    }
  }
}
```

**Error Responses**:
- `400 Bad Request`: Event not found
- `401 Unauthorized`: Missing or invalid authentication
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

---

#### 4. Cancel Booking

**POST** `/api/v1/cancel`

Cancel a booking. If there's a waitlist, the ticket is automatically assigned to the next user in line (FIFO).

**Authentication**: Required

**Request Body**:
```json
{
  "bookId": "uuid"
}
```

**Validation**:
- `bookId`: string, UUID format, required

**Success Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "message": "Booking cancelled. Ticket assigned to a user on the wait list",
  "data": {}
}
```

Or if no waitlist:
```json
{
  "status": "success",
  "code": 200,
  "message": "Booking cancelled. Ticket added back to the pool",
  "data": {}
}
```

**Error Responses**:
- `403 Forbidden`: Booking does not belong to the user
- `404 Not Found`: Booking not found
- `401 Unauthorized`: Missing or invalid authentication
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

---

#### 5. Get Event Status

**GET** `/api/v1/status/:eventId`

Retrieve the current status of an event including available tickets and waitlist count.

**Authentication**: Not required

**Path Parameters**:
- `eventId`: string, UUID format, required

**Success Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "message": "Event status retrieved",
  "data": {
    "id": "uuid",
    "name": "summer music festival",
    "total_tickets": 100,
    "available_tickets": 50,
    "waitlist_count": 5
  }
}
```

**Error Responses**:
- `404 Not Found`: Event not found
- `422 Unprocessable Entity`: Invalid eventId format
- `500 Internal Server Error`: Server error

---

#### 6. List Bookings

**GET** `/api/v1/events/:eventId/bookings`

Get paginated list of bookings for an event (excludes cancelled bookings).

**Authentication**: Required

**Path Parameters**:
- `eventId`: string, UUID format, required

**Query Parameters**:
- `page`: number, minimum 1, default: 1
- `limit`: number, maximum 20, default: 10

**Success Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "message": "All bookings retrieved",
  "data": {
    "data": [
      {
        "id": "uuid",
        "status": "booked",
        "created_at": "2025-11-28T..."
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

#### 7. List Waitlists

**GET** `/api/v1/events/:eventId/waitlists`

Get paginated list of waitlist entries for an event.

**Authentication**: Required

**Path Parameters**:
- `eventId`: string, UUID format, required

**Query Parameters**:
- `page`: number, minimum 1, default: 1
- `limit`: number, maximum 20, default: 10

**Success Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "message": "All waitlist retrieved",
  "data": {
    "data": [
      {
        "id": 1,
        "created_at": "2025-11-28T..."
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

### Error Response Format

All error responses follow this structure:

```json
{
  "status": "failed" | "error",
  "code": 400 | 401 | 403 | 404 | 409 | 422 | 500,
  "message": "Error description",
  "error": {
    "fieldName": "Error message for specific field"
  }
}
```

**Status Codes**:
- `400`: Bad Request - Invalid request data
- `401`: Unauthorized - Missing or invalid authentication
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource conflict (e.g., duplicate username)
- `422`: Unprocessable Entity - Validation errors
- `500`: Internal Server Error - Server error

## Database Schema

### Entities

#### User
- `id` (UUID, Primary Key)
- `username` (String, Unique)
- `password` (String, Hashed with bcrypt)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- Relationships: One-to-Many with Booking and Waitlist

#### Event
- `id` (UUID, Primary Key)
- `name` (String, Unique)
- `total_tickets` (Number)
- `available_tickets` (Number)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- Relationships: One-to-Many with Booking and Waitlist

#### Booking
- `id` (UUID, Primary Key)
- `status` (Enum: `booked`, `cancelled`, `waiting`, `failed`)
- `user_id` (UUID, Foreign Key)
- `event_id` (UUID, Foreign Key)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- Relationships: Many-to-One with User and Event

#### Waitlist
- `id` (Number, Primary Key, Auto-increment)
- `user_id` (UUID, Foreign Key)
- `event_id` (UUID, Foreign Key)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- Relationships: Many-to-One with User and Event

## Architecture & Design Decisions

### Concurrency Handling

**Problem**: Multiple users booking tickets simultaneously can cause race conditions.

**Solution**:
1. **Database Transactions**: All booking and cancellation operations use database transactions to ensure atomicity
2. **Pessimistic Locking**: The `book` endpoint uses `pessimistic_write` lock on the event entity to prevent concurrent modifications
3. **Mutex for Cache**: In-memory cache operations use `async-mutex` to ensure thread-safe updates

### Waitlist Queue Implementation

- **FIFO (First-In-First-Out)**: Waitlist entries are processed in the order they were created
- **Automatic Assignment**: When a booking is cancelled, the next user in the waitlist automatically receives the ticket
- **Database Query**: Uses `ORDER BY created_at ASC` to ensure oldest entries are processed first

### Cache Strategy

The application uses an in-memory cache for event status to optimize read operations:

- **Purpose**: Reduce database queries for frequently accessed event status
- **Implementation**: EventEmitter-based cache with mutex for thread-safety
- **Cache Updates**: Automatically updated via entity lifecycle hooks
- **Cache Miss**: Falls back to database query if cache miss occurs

**Note**: The cache is optimized for read performance and may have slight differences from database state for optimization purposes.

### Transaction Management

- **Atomicity**: All related database operations are wrapped in transactions
- **Rollback**: If any operation fails, the entire transaction is rolled back
- **Consistency**: Ensures data consistency across related tables

### Error Handling

- **Comprehensive Error Handling**: All endpoints have try-catch blocks
- **Meaningful Error Messages**: Errors include specific field-level validation messages
- **HTTP Status Codes**: Appropriate status codes for different error scenarios
- **Logging**: All errors are logged using Winston logger

### Code Organization

- **Layered Architecture**: 
  - Controllers (Request/Response handling)
  - Services (Business logic)
  - Repositories (Data access)
  - Entities (Database models)
- **Separation of Concerns**: Each layer has a specific responsibility
- **Type Safety**: Full TypeScript implementation with strict typing

## Testing

### Running Tests

1. **Set up test database**:
   ```bash
   docker compose up test-db
   ```
   This starts a PostgreSQL instance on port `5433`

2. **Configure test environment**:
   - Update `.env` with test database credentials
   - Ensure `NODE_ENV=test`

3. **Run tests**:
   ```bash
   npm test
   # or
   yarn test
   ```

4. **Run tests with coverage**:
   ```bash
   npm run test:coverage
   # or
   yarn test:coverage
   ```

5. **Watch mode**:
   ```bash
   npm run test:watch
   # or
   yarn test:watch
   ```

### Test Configuration

- **Test Environment**: Jest with ts-jest preset
- **Serial Execution**: Tests run serially (`maxWorkers: 1`) to prevent database conflicts
- **Global Teardown**: Database is automatically cleaned up after all tests complete
- **Coverage Threshold**: Minimum 80% coverage required

### Test Coverage

Current test coverage exceeds 94%:
- Statements: 94.85%
- Branches: 95%
- Functions: 96.51%
- Lines: 94.85%

<p align="center">
  <img src="report/test/image/coverage.png" alt="Test Coverage" width="750" height="250"/>
</p>

### Test Structure

- **Unit Tests**: Test individual functions and classes in isolation
- **Integration Tests**: Test API endpoints with mocked services
- **Database Tests**: Test entity relationships and database operations

## Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to database

**Solutions**:
1. Verify PostgreSQL is running: `docker ps` or `pg_isready`
2. Check database credentials in `.env`
3. Ensure database exists: `psql -U username -d database_name`
4. Check network connectivity for Docker setup

### Port Already in Use

**Problem**: `EADDRINUSE: address already in use`

**Solutions**:
1. Change `REST_PORT` in `.env` to a different port
2. Kill the process using the port:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

### Test Database Connection

**Problem**: Tests fail with database connection errors

**Solutions**:
1. Ensure test database is running: `docker compose up test-db`
2. Verify test database port (5433) is not blocked
3. Check `NODE_ENV=test` in environment
4. Verify test database credentials in `.env`

### Authentication Failures

**Problem**: Getting 401 Unauthorized errors

**Solutions**:
1. Verify Basic Auth header format: `Authorization: Basic base64(username:password)`
2. Ensure user exists in database
3. Check password is correctly encoded in Base64
4. Verify username is lowercase (automatically converted)

### Rate Limiting

**Problem**: Getting "Too many requests" errors

**Solutions**:
1. Wait 15 minutes for rate limit to reset
2. Use different IP address
3. Adjust rate limit in `src/api/rest/server.ts` if needed

### Cache Issues

**Problem**: Event status showing incorrect data

**Solutions**:
1. Cache automatically syncs with database on writes
2. For development, restart the server to clear cache
3. Check cache logs for any errors

---

## Additional Resources

- **Postman Collection**: [API Documentation](https://documenter.getpostman.com/view/16722310/2sAYX9mzyZ)
- **Docker Documentation**: See `README.Docker.md` for detailed Docker setup

## License

ISC
