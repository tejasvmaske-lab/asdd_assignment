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

The frontend will be available at http://localhost:5173 and the Docker API at http://localhost:5001. The backend waits for the Docker MySQL service to become healthy and does not store data in memory if MySQL is unavailable. Port 5001 is used on the host to avoid colliding with the port used by local development.

To inspect data saved by the Docker Compose app:

```bash
docker exec -it campuscare-db mysql -u campuscare -pcampuscare123 campus_service_db
```

Starting the frontend/backend directly with `npm run dev` uses the MySQL server configured in `backend/.env`, which is separate from the MySQL container. Use one run mode consistently when checking records.

## Admin credentials

Default admin account:

- Email: admin@campuscare.edu
- Password: admin123

Students create accounts using the Register page.
