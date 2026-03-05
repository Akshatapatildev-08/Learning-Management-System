# Full Stack LMS (YouTube-based)

This project is a full-stack Learning Management System that organizes YouTube video learning into courses.

- Videos are not stored in the system.
- Only YouTube URLs/IDs are stored in the database.
- Frontend embeds with `https://www.youtube.com/embed/{video_id}`.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: SQLite (`better-sqlite3`)

## Project Structure

- `backend/`: API server, DB schema, seed data
- `frontend/`: Student UI (courses, details, learning player)
- `docs/`: API and architecture notes

## Database Tables

- `users`
- `courses`
- `sections`
- `lessons`
- `enrollments`
- `progress`
- `last_watched` (for resume flow)

## Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

Backend runs on `http://localhost:5000`.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

If your backend URL is different, set:

```bash
VITE_API_BASE=http://localhost:5000/api
```

## Vercel Deployment (Frontend)

This repo is a monorepo. Deploy the frontend from the `frontend` directory.

- Framework preset: `Vite`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

SPA routing fix is included in `frontend/vercel.json` so React routes (for example `/courses/1`) do not return `NOT_FOUND` on refresh.

## Demo Users

- `admin@lms.com / admin123`
- `alice@lms.com / instructor123`
- `bob@lms.com / student123`

## Student Flow Implemented

1. Student opens a course learning page.
2. Frontend requests lessons for course.
3. Backend returns lessons with YouTube URLs + embed URLs.
4. Frontend loads selected lesson in iframe.
5. Student marks lesson completed.
6. Backend stores completion and returns updated percentage.
7. Resume starts from last watched lesson.

## API Summary

See `docs/API.md`.
