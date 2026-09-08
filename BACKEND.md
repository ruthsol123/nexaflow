# NexaFlow Backend

## Setup

1. Copy `.env.example` to `.env` and set a private `JWT_SECRET`.
2. Run `npm install`.
3. Initialize demo data with `node server/utils/seed.js` when a fresh local store is needed.
4. Start the API with `npm run server:dev` (or `npm run server`).

The API listens on `http://localhost:5000` by default. The Next.js frontend remains on its existing `npm run dev` script. No database connection is made in this phase.

## Architecture

`server/services/jsonStore.js` is the storage adapter. Controllers use `dataService.js`, so replacing JSON persistence with MongoDB later does not require rewriting routes. Authentication uses JWT and bcryptjs; Helmet, CORS, express-validator, centralized errors, and company-scoped queries protect the API.

## Endpoints

- `GET /api/health`
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- Employer employee CRUD at `/api/users/employees`
- Team CRUD at `/api/teams`
- Project CRUD and computed statistics at `/api/projects`
- Task CRUD and status workflow at `/api/tasks`
- User-scoped notifications at `/api/notifications`

Protected requests use `Authorization: Bearer <token>`. Successful responses use `{ success: true, data }`; errors use `{ success: false, message }`.

## Demo accounts

- Employer: `employer@nexaflow.demo` / `Employer123!`
- Employee: `employee@nexaflow.demo` / `Employee123!`

Only bcrypt password hashes are stored in `server/data/users.json`. The JSON files are the local database and are intentionally persistent between server restarts. They are not a substitute for concurrent production storage.