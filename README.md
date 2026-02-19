# 🏫 School Management System API

> A clean, secure, and ready-to-use REST API for managing schools, classrooms, and students — built on the [Axion](https://github.com/qantra-io/axion) boilerplate.

---

## 📖 What Does This Do?

This API lets you:

- 👤 **Register & log in** as a user (superadmin or school admin)
- 🏫 **Manage schools** — create, view, update, delete
- 🏛️ **Manage classrooms** inside schools
- 🎒 **Manage students** — enroll, update, transfer between schools/classrooms, or remove

Everything is protected. You need to be logged in to do anything, and what you can do depends on your role.

---

## 🛠️ Tech Stack

| What          | Tool / Library         |
|---------------|------------------------|
| Runtime       | Node.js                |
| Framework     | Express.js             |
| Database      | MongoDB Atlas (Mongoose) |
| Auth          | JWT (two-token system) |
| Security      | Helmet + Rate Limiting |
| Testing       | Jest                   |
| Code Quality  | ESLint + Prettier      |

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd axion
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your environment

```bash
cp .env.example .env
```

Then open `.env` and fill in your values (see [Environment Variables](#-environment-variables) below).

### 4. Start the server

```bash
node index.js
```

The API will be running at: `http://localhost:5111`

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and update these values:

```env
SERVICE_NAME=axion
ENV=development
USER_PORT=5111
ADMIN_PORT=5222
ADMIN_URL=http://localhost:5222

# Your MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/axion?retryWrites=true&w=majority

# Random secret strings for signing tokens
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
LONG_TOKEN_SECRET=your_long_token_secret_here
SHORT_TOKEN_SECRET=your_short_token_secret_here
NACL_SECRET=your_nacl_secret_here
```

> 💡 **Getting a MongoDB URI?** Go to [MongoDB Atlas](https://cloud.mongodb.com), create a free cluster, and copy the connection string from **Connect → Drivers**.

---

## 🔐 How Authentication Works

This app uses a **two-step token system**:

```
1. Register or Login  →  Get a Long Token  (valid 3 years)
2. Use Long Token     →  Get a Short Token (valid 1 year, tied to your device)
3. Use Short Token    →  Access all protected routes
```

Think of the **long token** as your ID card, and the **short token** as the daily pass you use to get through the door.

---

## 👥 Roles & Permissions

| Action                      | Superadmin | School Admin       |
|-----------------------------|------------|--------------------|
| Create/manage schools       | ✅         | ❌                 |
| Create classrooms           | ✅         | ✅ (own school)    |
| Manage students             | ✅         | ✅ (own school)    |
| Transfer students           | ✅         | ✅ (own school)    |
| Register users              | ✅         | ❌                 |

---

## 📡 API Endpoints

Base URL: `http://localhost:5111`

All protected routes require a `token` header with your **short token**.

---

### 🔓 Auth — No token needed

#### Register a user
```
POST /api/user/createUser
```
```json
{
  "username": "superadmin",
  "email": "admin@test.com",
  "password": "Admin1234",
  "role": "superadmin"
}
```

#### Log in
```
POST /api/user/login
```
```json
{
  "email": "admin@test.com",
  "password": "Admin1234"
}
```
Returns a `longToken`.

#### Get a short token
```
POST /api/token/v1_createShortToken
Headers: token: <your_long_token>
```
Returns a `shortToken`. Use this for all other requests.

---

### 🏫 Schools — Superadmin only

| Action         | Method | Endpoint                    |
|----------------|--------|-----------------------------|
| Create school  | POST   | `/api/school/createSchool`  |
| List schools   | GET    | `/api/school/listSchools`   |
| Get school     | GET    | `/api/school/getSchool?id=` |
| Update school  | POST   | `/api/school/updateSchool`  |
| Delete school  | POST   | `/api/school/deleteSchool`  |

**Create school body:**
```json
{
  "name": "Sunrise Academy",
  "address": "123 Main Street",
  "email": "school@test.com",
  "phone": "0123456789012"
}
```

---

### 🏛️ Classrooms — School Admin (own school) or Superadmin

| Action            | Method | Endpoint                             |
|-------------------|--------|--------------------------------------|
| Create classroom  | POST   | `/api/classroom/createClassroom`     |
| List classrooms   | GET    | `/api/classroom/listClassrooms`      |
| Get classroom     | GET    | `/api/classroom/getClassroom?id=`    |
| Update classroom  | POST   | `/api/classroom/updateClassroom`     |
| Delete classroom  | POST   | `/api/classroom/deleteClassroom`     |

**Create classroom body:**
```json
{
  "name": "Room A",
  "schoolId": "<school_id>",
  "capacity": 30
}
```

---

### 🎒 Students — School Admin (own school) or Superadmin

| Action            | Method | Endpoint                           |
|-------------------|--------|------------------------------------|
| Create student    | POST   | `/api/student/createStudent`       |
| List students     | GET    | `/api/student/listStudents`        |
| Get student       | GET    | `/api/student/getStudent?id=`      |
| Update student    | POST   | `/api/student/updateStudent`       |
| Transfer student  | POST   | `/api/student/transferStudent`     |
| Delete student    | POST   | `/api/student/deleteStudent`       |

**Create student body:**
```json
{
  "name": "John Doe",
  "email": "john@test.com",
  "age": 15,
  "schoolId": "<school_id>",
  "classroomId": "<classroom_id>"
}
```

**Transfer student body:**
```json
{
  "id": "<student_id>",
  "schoolId": "<new_school_id>",
  "classroomId": "<new_classroom_id>"
}
```

---

## 📬 Postman Collection

A ready-to-use Postman collection is included at the root of the project: `postman_collection.json`

**To use it:**
1. Open Postman
2. Click **Import** → select `postman_collection.json`
3. Run **Register User** → **Login** → **Get Short Token** in order
4. Tokens are saved automatically — all other requests just work!

---

## 🧪 Running Tests

```bash
npm test
```

This runs **26 unit tests** across all entity managers using Jest.

Tests cover:
- ✅ Unauthorized access (no token)
- ✅ Forbidden access (wrong role / wrong school)
- ✅ Successful CRUD operations
- ✅ Student transfer with school boundary enforcement

---

## 📁 Project Structure

```
axion/
├── index.js                  # App entry point
├── config/                   # Environment config
├── connect/
│   └── mongo.js              # MongoDB connection
├── loaders/
│   ├── ManagersLoader.js     # Wires everything together
│   └── MongoLoader.js        # Auto-loads Mongoose models
├── managers/
│   ├── entities/
│   │   ├── user/             # User auth (register, login)
│   │   ├── school/           # School CRUD
│   │   ├── classroom/        # Classroom CRUD
│   │   ├── student/          # Student CRUD + transfer
│   │   └── token/            # Token generation
│   ├── http/
│   │   └── UserServer.manager.js  # Express server setup
│   └── _common/
│       └── schema.models.js  # Shared validation schemas
├── mws/
│   ├── __superAdmin.mw.js    # Superadmin guard middleware
│   └── __schoolAdmin.mw.js   # School admin guard middleware
├── tests/
│   ├── user.test.js
│   ├── school.test.js
│   ├── classroom.test.js
│   └── student.test.js
├── .env.example              # Environment variable template
├── postman_collection.json   # API collection for Postman
└── package.json
```

---

## ⚠️ Common Issues

| Problem | Fix |
|---------|-----|
| `MongoServerError: bad auth` | Check your Atlas username/password in `.env` |
| `EADDRINUSE: port 5111` | Run `fuser -k 5111/tcp` to free the port |
| `Error: MONGO_URI not set` | Make sure your `.env` file exists and is filled in |
| Token errors | Make sure you're using a **short token**, not a long token |

---

## 🔒 Security Features

- **Helmet** — Sets secure HTTP headers automatically
- **Rate Limiting** — Max 100 requests per 15 minutes per IP
- **bcrypt** — Passwords are hashed before storing
- **JWT** — Stateless authentication, no sessions stored
- **Role-based guards** — Every route checks who you are before letting you in

---

## 📝 Assumptions Made

1. Only `superadmin` can create schools and register users
2. A `school_admin` is tied to one school and cannot manage others
3. Student transfer is allowed across schools (by superadmin) or within own school (by school_admin)
4. Passwords must be at least 8 characters
5. Phone numbers are stored as strings to preserve leading zeros

