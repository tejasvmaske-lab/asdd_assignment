# CampusCare

CampusCare is a smart campus service management system built with a React frontend, an Express backend, and a MySQL database.

## Features

- Student registration and login
- Service request registration with category, location, priority, and description
- Request tracking for students
- Admin dashboard and request management
- Search and filtering for service requests
- Dark themed responsive UI

## Stack

- Frontend: React + Vite + JavaScript
- Backend: Node.js + Express.js + JWT + bcrypt
- Database: MySQL

## Local setup

1. Install dependencies:
   npm install
   cd frontend && npm install
   cd ../backend && npm install

2. Start the backend:
   cd backend
   npm run dev

3. Start the frontend:
   cd frontend
   npm run dev

4. Open the frontend in your browser at http://localhost:5173

The backend runs on http://localhost:5000.

## MySQL configuration

Create a MySQL database named `campus_service_db` and update the `.env` file in `backend` with your local credentials.

## Docker

Run the full stack using Docker Compose:

```bash
docker compose up --build
```

The frontend will be available at http://localhost:5173 and the API at http://localhost:5000.

## Admin credentials

Default demo admin account:

- Email: admin@campuscare.edu
- Password: admin123

Default demo student account:

- Email: student@campuscare.edu
- Password: student123
