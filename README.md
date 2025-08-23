# PadelPal API

PadelPal is a smart and seamless booking platform designed to make playing padel effortless. With just a few taps, players can find, book, and manage padel courts anytime, anywhere. Whether you’re a casual player or a competitive athlete, PadelPal connects you with top venues, ensures transparent pricing, and keeps scheduling simple—so you can focus on what matters: enjoying the game.

---

## Prerequisites

- Node.js v18.x or later
- pnpm (recommended) or npm/yarn
- PostgreSQL (running and accessible)

---

## How to Run

1. Clone this repository

   ```bash
   git clone <repository-url>
   cd final-project-be-IndraNurfa
   ```

2. Install dependencies:

   ```bash
   pnpm install
   # or
   npm install
   ```

3. Copy `.env.example` to `.env` and adjust your database and JWT configuration

4. Run migrations and seed the database:

   ```bash
   npx prisma migrate dev --name init
   pnpm run seed
   ```

5. Start the application:

   ```bash
   pnpm run start:dev
   ```

6. Open Swagger API docs at [http://localhost:3000/api](http://localhost:3000/api)

---

## Tech Stack

- Framework: NestJS (Node.js)
- Database: PostgreSQL with Prisma ORM
- Authentication: JWT with Passport
- Validation: class-validator & class-transformer
- Documentation: Swagger/OpenAPI
- Language: TypeScript
- Rate Limiting: @nestjs/throttler
- Logging: NestJS Logger
- Cache: @nestjs/cache-manager

---

## Database Schema

Below are the main tables and fields as implemented in the database:

<img src="./docs/erd.png">

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

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

<p align="right">GOD BLESS~ <br/>Indra Nurfa</p>
