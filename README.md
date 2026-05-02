# Team Task Manager

A production-ready MERN stack team task manager built for the assignment brief: authentication, project and team management, task assignment, status tracking, dashboard metrics, validation, relationships, and role-based access control.

## Tech Stack

- Frontend: React, Vite, CSS, lucide-react
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT with hashed passwords
- Validation: Zod request validation
- Deployment: Railway-ready monorepo config

## Features

- Signup and login
- Admin and member roles
- Project creation with team members
- Task creation, assignment, priority, due date, and status updates
- Dashboard cards for projects, tasks, overdue items, and personal workload
- Project membership checks so members only see accessible work
- Backend serves the built frontend in production

## Folder Structure

```text
backend/
  src/
    controllers/
    middleware/
    models/
    routes/
    validators/
frontend/
  src/
    App.jsx
    api.js
    styles.css
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create backend environment file:

```bash
cp backend/.env.example backend/.env
```

3. Update `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://pkpuneet05_db_user:puneet123@cluster0.stfxuip.mongodb.net/TTM
JWT_SECRET=mysecretkey
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

4. Run the full app:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend health check: `http://localhost:5000/api/health`

Create your first account from the signup screen. Choose `Admin` for the first user so you can create projects and assign tasks.

## Railway Deployment

Create a Railway project and connect this GitHub repository.

Set these variables in Railway:

```env
NODE_ENV=production
MONGODB_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<long random production secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=<your Railway app URL>
```

Railway will use `railway.json`:

- Build command: `npm install && npm run build`
- Start command: `npm start`

Because the backend serves `frontend/dist` in production, one Railway service is enough for the full-stack app.

## API Overview

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users`
- `GET /api/dashboard`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `DELETE /api/projects/:id`
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
