# School Management API

> A role-based REST API for managing schools, classrooms, and students — built with Node.js, Express, and MongoDB.

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D14-brightgreen)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green)
![Tests](https://img.shields.io/badge/Tests-Jest-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
- [Roles](#roles)
- [API Reference](#api-reference)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Known Limitations](#known-limitations)
- [Potential Improvements](#potential-improvements)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js >= 14 |
| Framework | Express.js |
| Database | MongoDB via Mongoose |
| Auth | JWT (long token + short token) |
| Security | Helmet, express-rate-limit, bcrypt |
| Testing | Jest |

---

## Getting Started

### Prerequisites

- Node.js >= 14
- MongoDB instance (local or Atlas)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd axion

# Install dependencies
npm install

# Set up environment
cp .env.example .env
```

Edit `.env` with your values _(see [Environment Variables](#environment-variables) below)_, then:

```bash
node index.js
```

The server will start at **`http://localhost:5111`**

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values below.

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SERVICE_NAME` | Service identifier | No | `axion` |
| `ENV` | `development` or `production` | No | `development` |
| `USER_PORT` | HTTP server port | No | `5111` |
| `MONGO_URI` | MongoDB connection string | **Yes** | — |
| `LONG_TOKEN_SECRET` | Secret for signing long JWTs | **Yes** | — |
| `SHORT_TOKEN_SECRET` | Secret for signing short JWTs | **Yes** | — |
| `NACL_SECRET` | NaCl encryption secret | **Yes** | — |

Generate secure secret values with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Authentication

This API uses a **two-token system**:

```
Step 1 — Register or Login       →  receive a longToken  (3-year expiry)
Step 2 — Exchange longToken       →  receive a shortToken (1-year expiry, device-bound)
Step 3 — Use shortToken in header →  access all protected routes
```

| Token | Header | Used For |
|-------|--------|----------|
| `longToken` | `token` | Exchanging for a short token only |
| `shortToken` | `token` | All protected API routes |

---

## Roles

| Role | Permissions |
|------|-------------|
| `superadmin` | Full access — manage schools, classrooms, students, and user registration |
| `school_admin` | Manage classrooms and students within their assigned school only |

---

## API Reference

**Base URL:** `http://localhost:5111`

All protected routes require the `token` header set to a valid **short token**.

---

### Auth

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/api/user/createUser` | None | Register a new user |
| `POST` | `/api/user/login` | None | Login and receive a long token |
| `POST` | `/api/token/createShortToken` | Long token | Exchange for a short token |

<details>
<summary>Register — request body</summary>

```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "Secret1234",
  "role": "superadmin"
}
```
</details>

---

### Schools

> Superadmin only

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/school/createSchool` | Create a new school |
| `GET` | `/api/school/listSchools` | List all schools |
| `GET` | `/api/school/getSchool?id=` | Get a school by ID |
| `POST` | `/api/school/updateSchool` | Update school details |
| `POST` | `/api/school/deleteSchool` | Delete a school |

<details>
<summary>Create school — request body</summary>

```json
{
  "name": "Sunrise Academy",
  "address": "123 Main Street",
  "email": "info@sunrise.edu",
  "phone": "0123456789"
}
```
</details>

---

### Classrooms

> School admin (own school) or superadmin

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/classroom/createClassroom` | Create a classroom |
| `GET` | `/api/classroom/listClassrooms` | List classrooms |
| `GET` | `/api/classroom/getClassroom?id=` | Get classroom by ID |
| `POST` | `/api/classroom/updateClassroom` | Update classroom |
| `POST` | `/api/classroom/deleteClassroom` | Delete classroom |

<details>
<summary>Create classroom — request body</summary>

```json
{
  "name": "Room A",
  "schoolId": "<school_id>",
  "capacity": 30
}
```
</details>

---

### Students

> School admin (own school) or superadmin

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/student/createStudent` | Enroll a student |
| `GET` | `/api/student/listStudents` | List students |
| `GET` | `/api/student/getStudent?id=` | Get student by ID |
| `POST` | `/api/student/updateStudent` | Update student info |
| `POST` | `/api/student/transferStudent` | Transfer to another school/classroom |
| `POST` | `/api/student/deleteStudent` | Remove a student |

<details>
<summary>Create student — request body</summary>

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 15,
  "schoolId": "<school_id>",
  "classroomId": "<classroom_id>"
}
```
</details>

<details>
<summary>Transfer student — request body</summary>

```json
{
  "id": "<student_id>",
  "schoolId": "<new_school_id>",
  "classroomId": "<new_classroom_id>"
}
```
</details>

---

## Running Tests

```bash
npm test
```

**26 unit tests** across all entity managers covering:

- Unauthorized access (missing or invalid token)
- Forbidden access (wrong role or wrong school)
- Successful CRUD operations
- Student transfer with school boundary enforcement

---

## Project Structure

```
axion/
├── index.js                          # Entry point
├── config/                           # Environment config loader
├── connect/
│   └── mongo.js                      # MongoDB connection
├── loaders/
│   └── ManagersLoader.js             # Dependency injection bootstrap
├── managers/
│   ├── entities/
│   │   ├── user/                     # Registration and login
│   │   ├── school/                   # School CRUD
│   │   ├── classroom/                # Classroom CRUD
│   │   ├── student/                  # Student CRUD and transfer
│   │   └── token/                    # Token generation
│   ├── http/
│   │   └── UserServer.manager.js     # Express server setup
│   └── api/
│       └── Api.manager.js            # Route and middleware dispatcher
├── mws/                              # Auth guard middleware
├── tests/                            # Jest unit tests
└── .env.example
```

---

## Known Limitations

- No pagination — list endpoints return all records in a single response
- No refresh token mechanism — users must re-login when the long token expires
- Short token expiry is set to 1 year, which is unusually long for a session token
- No email verification on registration
- No password reset flow
- CORS is open (`*`) — should be restricted per environment in production
- Malformed MongoDB ObjectIds are not validated before reaching the database, resulting in unhandled cast errors

---

## Potential Improvements

This codebase is functional but was built quickly. Below are the areas worth investing in for a production-grade system.

---

### TypeScript Migration

The codebase has no static type checking. Migrating to TypeScript would catch bugs at compile time and make the codebase significantly easier to maintain and refactor.

**Recommended steps:**
- Add `tsconfig.json` and migrate files incrementally (`.js` → `.ts`)
- Type manager constructors, method signatures, and return shapes
- Use `zod` or `class-validator` for runtime input validation instead of the current schema array approach
- Type all request/response interfaces across the API layer

---

### Integration and E2E Tests

The current test suite only covers unit behavior with mocked dependencies. It cannot catch bugs in the MongoDB layer, middleware chain, or HTTP routing.

**Recommended additions:**

| Type | Tool | What It Tests |
|------|------|---------------|
| Integration | `mongodb-memory-server` | Full manager → database flow with real Mongoose |
| API / E2E | `supertest` | HTTP endpoints, status codes, auth flows |
| Coverage | `jest --coverage` | Enforce a minimum coverage threshold in CI |

---

### Authentication Improvements

- Replace the long/short token model with a standard **access token + refresh token** pattern (short-lived access tokens, refresh tokens stored server-side with revocation support)
- Add **token blacklisting** on logout using Redis
- Add **rate limiting** specifically on `/login` and `/createUser` to prevent brute force
- Enforce **password strength rules** at validation time

---

### Input Validation

The current schema-based validator is minimal and custom-built. Replace with a proven library:

- **`zod`** — TypeScript-native, pairs well with a TS migration
- **`joi`** — battle-tested, rich rule set, good error messages
- **`express-validator`** — middleware-style, integrates directly with Express

Also validate MongoDB ObjectId format before hitting the database to avoid unhandled cast errors.

---

### Database

- Add **indexes** on frequently queried fields (`schoolId` on classrooms and students, `email` on users)
- Implement **soft deletes** (add `deletedAt` field) so records can be recovered
- Add **pagination** (`limit` + `skip` or cursor-based) on all list endpoints
- Introduce a **migration strategy** (e.g. `migrate-mongo`) for safe schema changes over time

---

### API Design

- Standardize HTTP methods — use `PUT`/`PATCH` for updates and `DELETE` for deletions instead of overloading `POST`
- Return proper HTTP status codes (`201` for creation, `404` for not found, `403` for forbidden, etc.)
- Version the API under `/api/v1/` to support non-breaking evolution

---

### Observability

- Replace `console.log` with a structured logger like **`pino`** or **`winston`** (supports log levels, JSON output, and centralized log aggregation)
- Add request logging middleware (**`morgan`**) to record all incoming requests
- Expose a health check endpoint (`GET /health`) for load balancers and uptime monitors

---

### DevOps

- Add a `Dockerfile` and `docker-compose.yml` for reproducible local development and deployment
- Set up a **CI pipeline** (GitHub Actions) to run tests and linting on every push and pull request
- Add startup validation to fail fast if required environment variables are missing or malformed
