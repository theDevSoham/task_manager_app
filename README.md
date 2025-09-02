# Task Management App

A full-stack task management application built with **React/Next.js** for the frontend and **Node.js/Express** for the backend. The app provides user authentication, task creation, editing, bulk upload, search with server-side filtering, pagination, and CSV export functionality.

## Hosted Application
 - Front end is hosted on Vercel
 - Back end is live at Render
 - Checkout the application at [this](https://task-manager-app-rho-blush.vercel.app/) link. Also the backend can be tested via this [postman document](https://documenter.getpostman.com/view/24589212/2sB3Hhu3bW)

---

## Table of Contents

* [Features](#features)
* [Technologies](#technologies)
* [File Structure](#file-structure)

  * [Frontend](#frontend)
  * [Backend](#backend)
* [Methodologies](#methodologies)
* [Installation](#installation)
* [Usage](#usage)
* [API Endpoints](#api-endpoints)
* [Contributing](#contributing)
* [License](#license)

---

## Features

* User authentication and authorization
* Add, edit, and delete tasks
* Bulk task upload via CSV
* Task search with server-side filtering
* Pagination for task lists
* CSV export of tasks
* Responsive UI with modals and popovers
* Avatar-based user profile menu
* Loader and zero-state handling
* Debounced search for efficient server-side calls

---

## Technologies

**Frontend:**

* React
* TypeScript
* Tailwind CSS
* Framer Motion (animations)
* Lucide Icons
* Axios (API requests)

**Backend:**

* Node.js
* Express.js
* PostgreSQL (Neon DB)
* JWT-based authentication
* RESTful API design

---

## File Structure

### Frontend (`/frontend`)

```
frontend/
├─ public/
│  └─ avatar.png           # Default avatar image
├─ src/
│  ├─ api/
│  │  └─ tasks.ts          # Axios functions for fetching tasks from backend
│  ├─ components/
│  │  ├─ ui/               # Reusable UI components (Table, Button, Badge, etc.)
│  │  ├─ TaskTable.tsx      # Main task table component with search & pagination
│  │  ├─ TaskModal.tsx      # Modal for add/edit/bulk upload tasks
│  │  └─ TablePagination.tsx # Pagination component
│  ├─ hooks/
│  │  └─ useAuth.ts         # Custom hook for authentication context
│  ├─ pages/
│  │  └─ index.tsx          # Main dashboard page
│  ├─ types/
│  │  └─ types.ts           # TypeScript interfaces for Task, User, etc.
│  └─ utils/
│     └─ helpers.ts         # Utility functions
└─ package.json
```

---

### Backend (`/server`)

```
server/
├─ src/
│  ├─ controllers/
│  │  └─ taskController.ts       # Task-related request handlers
│  ├─ middleware/
│  │  ├─ authMiddleware.ts       # JWT verification
│  │  └─ errorHandler.ts         # Global error handling
│  ├─ models/
│  │  └─ Task.ts                 # Mongoose schema for Task
│  ├─ routes/
│  │  └─ taskRoutes.ts           # Task-related routes
│  ├─ services/
│  │  └─ taskService.ts          # Business logic for tasks
│  ├─ utils/
│  │  └─ csvUtils.ts             # CSV export and bulk import helpers
│  ├─ app.ts                     # Express app setup
│  └─ server.ts                  # Server bootstrap
└─ package.json
```

---

## Methodologies

1. **Separation of Concerns**

   * Components, API calls, hooks, and utilities are separated in the frontend.
   * Backend separates controllers, services, models, and middleware for clean architecture.

2. **Server-Side Pagination & Filtering**

   * Instead of filtering tasks on the client, all search and pagination logic is handled via the backend API.
   * Reduces client memory usage and improves performance with large datasets.

3. **Debounced Search**

   * Input search uses a debounce mechanism to reduce unnecessary API calls.

4. **Modular & Reusable Components**

   * Table, buttons, badges, avatars, and modals are reusable across the app.

5. **State Management**

   * Local component state with `useState` and `useEffect` hooks.
   * Authentication state handled via custom `useAuth` hook and context.

6. **Asynchronous Data Handling**

   * `async/await` with try/catch for API calls.
   * Loading states, zero-state, and error handling implemented.

7. **RESTful API Design**

   * Backend exposes CRUD endpoints for tasks, with JWT-based authentication.
   * All endpoints follow consistent request/response structure.

8. **Accessibility & UI Feedback**

   * Loader animations for async operations.
   * Popovers for user menu with logout and CSV export.
   * Keyboard-accessible and screen-reader friendly UI components.

---

## Installation

### Pre requisite for backend
Initialize prisma

```bash
npx prisma generate      # generates Prisma client
npx prisma migrate dev   # applies migrations to your database
```

### Frontend

```bash
cd client
yarn install
yarn dev
```

### Backend

```bash
cd server
yarn install
yarn dev
```

### Environment structure

#### Backend
```bash
DATABASE_URL=<your db url>
PORT=8080
JWT_SECRET=<your jwt secret>

# required for nodemailer
SMTP_HOST=<smtp host>
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<app password>

MAIL_FROM="Task Manager <no-reply@taskmanager.com>"

GOOGLE_CLIENT_ID=<google client id>

```

#### Frontend
```bash
VITE_API_BASE=http://localhost:<port>

```

---

## Usage

1. Register/Login user (via backend auth endpoints).
2. Create, edit, or delete tasks.
3. Use search input to find tasks (server-side search).
4. Navigate between pages using pagination.
5. Export tasks as CSV or perform bulk uploads.

---

## API Endpoints (Sample)

| Endpoint            | Method | Description                        |
| ------------------- | ------ | ---------------------------------- |
| `/api/tasks/all`    | GET    | Fetch tasks with pagination/search |
| `/api/tasks`        | POST   | Add a new task                     |
| `/api/tasks/:id`    | PUT    | Edit an existing task              |
| `/api/tasks/:id`    | DELETE | Delete a task                      |
| `/api/tasks/bulk`   | POST   | Bulk upload tasks from CSV         |
| `/api/tasks/export` | GET    | Export tasks as CSV                |

---

## Contributing

1. Fork the repository.
2. Create a branch (`feature/your-feature`).
3. Commit changes (`git commit -m "Add feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Create a pull request.

---

## License

MIT License © 2025

---
