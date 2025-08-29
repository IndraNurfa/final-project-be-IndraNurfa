# 🏓 Lobby Padel API

Lobby Padel is a smart and seamless booking platform designed to make playing padel effortless. With just a few taps, players can find, book, and manage padel courts anytime, anywhere. Whether you're a casual player or a competitive athlete, Lobby Padel connects you with top venues, ensures transparent pricing, and keeps scheduling simple—so you can focus on what matters: enjoying the game.

## 🚀 Live Demo

- **API Documentation:** [https://final-project-be-indranurfa-production.up.railway.app/api](https://final-project-be-indranurfa-production.up.railway.app/api)
- **Base URL:** `https://final-project-be-indranurfa-production.up.railway.app`

---

## 📋 Prerequisites

- **Node.js** v18.x or later
- **pnpm** (recommended) or npm/yarn
- **PostgreSQL** (running and accessible)

---

## 🛠️ How to Run

1. **Clone this repository**

   ```bash
   git clone https://github.com/revou-fsse-feb25/final-project-be-IndraNurfa.git
   cd final-project-be-IndraNurfa
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Environment Setup**

   Copy `.env.example` to `.env` and configure your database and JWT settings:

   ```bash
   cp .env.example .env
   ```

4. **Database Setup**

   Run migrations and seed the database:

   ```bash
   npx prisma migrate dev --name init
   pnpm run seed
   ```

5. **Start the application:**

   ```bash
   # Development mode
   pnpm run start:dev

   # Production mode
   pnpm run start:prod
   ```

6. **Access the application:**
   - API Documentation: [http://localhost:3000/api](http://localhost:3000/api)
   - Base URL: `http://localhost:3000`

---

## 🛠️ Tech Stack

- **Framework:** NestJS (Node.js)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with Passport
- **Validation:** class-validator & class-transformer
- **Documentation:** Swagger/OpenAPI
- **Language:** TypeScript
- **Rate Limiting:** @nestjs/throttler
- **Logging:** NestJS Logger
- **Cache:** @nestjs/cache-manager (in-memory)
- **Deployment:** Railway

---

## 📚 API Endpoints

The API provides comprehensive endpoints for managing court bookings:

### 🔐 Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### 👤 Users

- `GET /users/profile` - Get user profile
- `PATCH /users/profile` - Update user profile

### 🏢 Roles

- `GET /role` - Get all roles (Admin only)

### 🏓 Courts

- `GET /courts` - Get all courts
- `GET /courts/master-court-types` - Get court types
- `PATCH /courts/master-court-types/:id` - Update court type (Admin)
- `PATCH /courts/master-courts/:id` - Update court (Admin)

### 📅 Bookings

- `POST /bookings` - Create new booking
- `GET /bookings/available` - Check court availability
- `GET /bookings/:uuid` - Get booking details
- `GET /bookings/admin` - Admin dashboard (Admin only)
- `GET /bookings/user` - User bookings
- `PATCH /bookings/:uuid` - Update booking
- `PATCH /bookings/confirm/:uuid` - Confirm booking (Admin)
- `PATCH /bookings/cancel/:uuid` - Cancel booking (Admin)

> 📖 **Interactive Documentation:** Visit the [Swagger UI](https://final-project-be-indranurfa-production.up.railway.app/api) for detailed API documentation with request/response examples.

---

## 🚀 Features

- **🔐 Secure Authentication:** JWT-based authentication with refresh tokens
- **👥 Role-based Access Control:** Admin and User roles with appropriate permissions
- **🏓 Court Management:** Create and manage different court types (Alpha, Beta)
- **📅 Smart Booking System:** Real-time availability checking with conflict prevention
- **💰 Dynamic Pricing:** Flexible pricing based on court types and duration
- **📊 Admin Dashboard:** Comprehensive booking management for administrators
- **👤 User Dashboard:** Personal booking history and management
- **⚡ Performance Optimized:** In-memory caching and database query optimization
- **📝 Rate Limiting:** API protection against abuse
- **📖 Interactive Documentation:** Comprehensive Swagger/OpenAPI documentation

---

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/lobby_padel"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
ACCESS_TOKEN_EXP="15m"
REFRESH_TOKEN_EXP="7d"

# Server Configuration
PORT=3000
NODE_ENV="development"
```

---

## 🗄️ Database Schema

Below are the main tables and fields as implemented in the database:

### Entity Relationship Diagram

<img src="./docs/erd.png" alt="Database ERD">

### 📊 Tables Overview

### Role

| Field      | Type         | Constraints/Notes           |
| ---------- | ------------ | --------------------------- |
| id         | INTEGER      | PRIMARY KEY, AUTO_INCREMENT |
| name       | VARCHAR      | UNIQUE                      |
| slug       | VARCHAR(100) |                             |
| is_active  | BOOLEAN      | DEFAULT TRUE                |
| created_at | TIMESTAMP    | DEFAULT NOW()               |
| updated_at | TIMESTAMP    | ON UPDATE CURRENT_TIMESTAMP |

### User

| Field      | Type         | Constraints/Notes           |
| ---------- | ------------ | --------------------------- |
| id         | INTEGER      | PRIMARY KEY, AUTO_INCREMENT |
| email      | VARCHAR(100) | UNIQUE                      |
| full_name  | VARCHAR(100) |                             |
| role_id    | INTEGER      | FOREIGN KEY (Role)          |
| password   | VARCHAR      |                             |
| created_at | TIMESTAMP    | DEFAULT NOW()               |
| updated_at | TIMESTAMP    | ON UPDATE CURRENT_TIMESTAMP |

### UserSession

| Field                 | Type      | Constraints/Notes           |
| --------------------- | --------- | --------------------------- |
| id                    | INTEGER   | PRIMARY KEY, AUTO_INCREMENT |
| user_id               | INTEGER   | FOREIGN KEY (User)          |
| jti                   | UUID      | UNIQUE                      |
| token                 | TEXT      |                             |
| refresh_token         | TEXT      |                             |
| token_expired         | TIMESTAMP |                             |
| refresh_token_expired | TIMESTAMP |                             |
| created_at            | TIMESTAMP | DEFAULT NOW()               |
| updated_at            | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP |
| revoked_at            | TIMESTAMP | NULLABLE                    |

### MasterCourtTypes

| Field      | Type         | Constraints/Notes           |
| ---------- | ------------ | --------------------------- |
| id         | INTEGER      | PRIMARY KEY, AUTO_INCREMENT |
| name       | VARCHAR      | UNIQUE                      |
| price      | DECIMAL(8,2) |                             |
| created_at | TIMESTAMP    | DEFAULT NOW()               |
| updated_at | TIMESTAMP    | ON UPDATE CURRENT_TIMESTAMP |

### MasterCourts

| Field         | Type         | Constraints/Notes              |
| ------------- | ------------ | ------------------------------ |
| id            | INTEGER      | PRIMARY KEY, AUTO_INCREMENT    |
| name          | VARCHAR(100) |                                |
| slug          | VARCHAR(100) |                                |
| court_type_id | INTEGER      | FOREIGN KEY (MasterCourtTypes) |
| is_active     | BOOLEAN      | DEFAULT TRUE                   |
| created_at    | TIMESTAMP    | DEFAULT NOW()                  |
| updated_at    | TIMESTAMP    | ON UPDATE CURRENT_TIMESTAMP    |

### Booking

| Field           | Type      | Constraints/Notes                                    |
| --------------- | --------- | ---------------------------------------------------- |
| id              | INTEGER   | PRIMARY KEY, AUTO_INCREMENT                          |
| uuid            | UUID      | UNIQUE, DEFAULT uuid()                               |
| created_by_type | VARCHAR   | ENUM (ADMIN, USER)                                   |
| user_id         | INTEGER   | FOREIGN KEY (User)                                   |
| court_id        | INTEGER   | FOREIGN KEY (MasterCourts)                           |
| status          | VARCHAR   | ENUM (PENDING, CONFIRMED, CANCELED), DEFAULT PENDING |
| booking_date    | DATE      |                                                      |
| start_time      | TIMESTAMP |                                                      |
| end_time        | TIMESTAMP |                                                      |
| cancel_reason   | VARCHAR   | NULLABLE                                             |
| created_at      | TIMESTAMP | DEFAULT NOW()                                        |
| updated_at      | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP                          |

### BookingDetail

| Field       | Type          | Constraints/Notes             |
| ----------- | ------------- | ----------------------------- |
| id          | INTEGER       | PRIMARY KEY, AUTO_INCREMENT   |
| booking_id  | INTEGER       | UNIQUE, FOREIGN KEY (Booking) |
| name        | VARCHAR(100)  | NULLABLE                      |
| total_price | DECIMAL(10,2) |                               |
| total_hour  | INTEGER       |                               |
| created_at  | TIMESTAMP     | DEFAULT NOW()                 |
| updated_at  | TIMESTAMP     | ON UPDATE CURRENT_TIMESTAMP   |

### BookingHistory

| Field      | Type      | Constraints/Notes                   |
| ---------- | --------- | ----------------------------------- |
| id         | INTEGER   | PRIMARY KEY, AUTO_INCREMENT         |
| booking_id | INTEGER   | FOREIGN KEY (Booking)               |
| status     | VARCHAR   | ENUM (PENDING, CONFIRMED, CANCELED) |
| created_at | TIMESTAMP | DEFAULT NOW()                       |
| created_by | VARCHAR   | NULLABLE                            |

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

<p align="right">GOD BLESS~ <br/>Indra Nurfa</p>
