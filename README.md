# School Management API

A RESTful API for managing schools, classrooms, and students with role-based access control built on Node.js and Express.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT (long token + short token)
- **Security**: Helmet, express-rate-limit, bcrypt
- **Tests**: Jest

## Getting Started

### Prerequisites

- Node.js >= 14
- MongoDB instance (local or Atlas)

### Installation

```bash
git clone <repo-url>
cd axion
npm install
cp .env.example .env
```

Edit `.env` with your values, then start the server:

```bash
node index.js
```

Server runs on `http://localhost:5111` by default.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SERVICE_NAME` | Service identifier | No (default: `axion`) |
| `ENV` | Environment (`development` / `production`) | No (default: `development`) |
| `USER_PORT` | HTTP port | No (default: `5111`) |
| `MONGO_URI` | MongoDB connection string | Yes |
| `LONG_TOKEN_SECRET` | Secret for signing long JWTs | Yes |
| `SHORT_TOKEN_SECRET` | Secret for signing short JWTs | Yes |
| `NACL_SECRET` | NaCl encryption secret | Yes |

Generate secret values with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Authentication

The API uses a two-token system:

1. **Register or login** to receive a `longToken`
2. **Exchange the long token** for a `shortToken` via `POST /api/token/createShortToken`
3. **Use the short token** in the `token` header for all protected routes

## Roles

| Role | Access |
|------|--------|
| `superadmin` | Full access — schools, classrooms, students, user registration |
| `school_admin` | Classrooms and students within their assigned school only |

## API Reference

Base URL: `http://localhost:5111`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/user/createUser` | None | Register a new user |
| POST | `/api/user/login` | None | Login and receive long token |
| POST | `/api/token/createShortToken` | Long token | Exchange for short token |

**Register body:**
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "Secret1234",
  "role": "superadmin"
}
```

### Schools — superadmin only

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/school/createSchool` | Create a school |
| GET | `/api/school/listSchools` | List all schools |
| GET | `/api/school/getSchool?id=` | Get school by ID |
| POST | `/api/school/updateSchool` | Update school |
| POST | `/api/school/deleteSchool` | Delete school |

### Classrooms — school admin or superadmin

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/classroom/createClassroom` | Create a classroom |
| GET | `/api/classroom/listClassrooms` | List classrooms |
| GET | `/api/classroom/getClassroom?id=` | Get classroom by ID |
| POST | `/api/classroom/updateClassroom` | Update classroom |
| POST | `/api/classroom/deleteClassroom` | Delete classroom |

### Students — school admin or superadmin

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/student/createStudent` | Enroll a student |
| GET | `/api/student/listStudents` | List students |
| GET | `/api/student/getStudent?id=` | Get student by ID |
| POST | `/api/student/updateStudent` | Update student info |
| POST | `/api/student/transferStudent` | Transfer to another school/classroom |
| POST | `/api/student/deleteStudent` | Remove student |

## Running Tests

```bash
npm test
```

26 unit tests covering authorization, CRUD operations, role enforcement, and student transfer logic.

## Project Structure

```
axion/
├── index.js                        # Entry point
├── config/                         # Environment config loader
├── connect/mongo.js                # MongoDB connection
├── loaders/ManagersLoader.js       # Dependency injection bootstrap
├── managers/
│   ├── entities/
│   │   ├── user/                   # Registration and login
│   │   ├── school/                 # School CRUD
│   │   ├── classroom/              # Classroom CRUD
│   │   ├── student/                # Student CRUD and transfer
│   │   └── token/                  # Token generation
│   ├── http/UserServer.manager.js  # Express server setup
│   └── api/Api.manager.js          # Route and middleware dispatcher
├── mws/                            # Auth guard middleware
├── tests/                          # Jest unit tests
└── .env.example
```
