# CampusVerse AI — Backend Service Architecture (Part 2 Staged)

## Overview
This directory is staged for **Part 2** of the CampusVerse AI Final Year Project. In Part 2, this service will implement the enterprise REST API, database models, and role-based security layers.

## Planned Technology Stack (Part 2)
- **Runtime**: Node.js (v20+ LTS / v22)
- **Framework**: Express.js
- **Database**: MongoDB (Local or Atlas Replica Set)
- **ORM / ODM**: Mongoose
- **Authentication**: JSON Web Tokens (JWT) & bcrypt password hashing
- **Authorization**: Role-Based Access Control (RBAC) supporting 7 user roles:
  1. Student
  2. Faculty
  3. Administrator
  4. Parent / Guardian
  5. Placement Officer
  6. Hostel & Transport Staff
  7. Super Admin
- **Validation**: Joi / Zod
- **API Documentation**: OpenAPI / Swagger

## Planned Folder Structure
```text
backend/
├── src/
│   ├── config/          # Database, JWT, and environment configurations
│   ├── controllers/     # Route handler controllers for each module
│   ├── middleware/      # Auth verification, RBAC guard, error handling
│   ├── models/          # Mongoose database schemas
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic services
│   ├── utils/           # Helper functions and logger
│   └── server.js        # Main Express application entrypoint
├── tests/               # Unit and integration tests (Jest / Supertest)
├── .env.example         # Template for environment variables
├── package.json         # Backend dependencies
└── README.md            # Backend documentation
```

## Readiness for Part 2
The frontend in `../frontend` already contains an Axios service layer (`src/services/api.js`) designed to interface seamlessly with `http://localhost:5000/api` once Part 2 launches.
