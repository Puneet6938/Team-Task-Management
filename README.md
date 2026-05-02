# Team Task Manager

Team Task Manager is a full-stack MERN assessment project for managing team projects, task ownership, deadlines, and progress visibility. It includes JWT authentication, role-aware access, project membership rules, task assignment, dashboard metrics, and a React workspace UI.

## Assessment Summary

This project was built as a job application assessment to demonstrate:

- Full-stack application structure with separate frontend and backend workspaces
- REST API design with protected routes and consistent error handling
- MongoDB data modelling with Mongoose relationships and indexes
- JWT-based authentication with hashed passwords
- Role-based permissions for admins, project owners, and members
- Request validation with Zod
- A responsive React interface for day-to-day task management
- Production deployment support where Express can serve the built React app

## Tech Stack

| Area | Tools |
| --- | --- |
| Frontend | React, Vite, CSS, lucide-react |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |
| Deployment | Railway-ready monorepo setup |

## Core Features

- User signup and login
- Admin and member roles
- Protected API routes with bearer token authentication
- Project creation with owner and member relationships
- Project visibility restricted to admins or assigned members
- Task creation with assignee, priority, due date, and status
- Kanban-style task status columns: To do, In progress, Review, Done
- Task search by title, description, project, or assignee
- Dashboard metrics for projects, total tasks, overdue items, and personal workload
- Team directory for available project members
- Production mode support for serving `frontend/dist` from the backend

## Project Structure

```text
.
|-- backend/
|   |-- src/
|   |   |-- config/         # MongoDB connection
|   |   |-- controllers/    # Route handlers
|   |   |-- middleware/     # Auth, validation, and errors
|   |   |-- models/         # Mongoose schemas
|   |   |-- routes/         # Express routers
|   |   |-- utils/          # Shared backend helpers
|   |   |-- validators/     # Zod schemas
|   |   |-- app.js
|   |   `-- server.js
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- App.jsx
|   |   |-- api.js
|   |   |-- constants.js
|   |   |-- main.jsx
|   |   |-- styles.css
|   |   `-- utils.js
|   `-- package.json
|-- package.json
|-- railway.json
`-- README.md
```

## Local Setup

### Prerequisites

- Node.js 20 or newer
- npm
- MongoDB Atlas connection string or a local MongoDB instance

### Installation

Install all workspace dependencies from the repository root:

```bash
npm install
```

Create a backend environment file at `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/TTM?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Run the frontend and backend together:

```bash
npm run dev
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:5000/api/health`

Create the first user from the signup screen. Select `Admin` for the first account so that projects and tasks can be created immediately.