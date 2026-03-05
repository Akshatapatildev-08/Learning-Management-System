# API Endpoints

Base URL: `/api`

## Auth

- `POST /auth/signup`
  - body: `{ name, email, password, role? }`
- `POST /auth/login`
  - body: `{ email, password }`

## Courses

- `GET /courses`
  - Course listing with thumbnail, instructor, short description.
- `GET /courses/:courseId`
  - Course details with total lessons and total duration.
- `GET /courses/:courseId/lessons`
  - Section + lesson metadata.

## Enrollments

- `POST /enrollments` (auth)
  - body: `{ course_id }`
- `GET /enrollments/mine` (auth)

## Learning

- `GET /learning/course/:courseId` (auth)
  - Returns:
    - lessons (with `video_id`, `embed_url`, `completed`)
    - `last_watched_lesson_id`
    - `completion_percentage`
- `GET /learning/lesson/:lessonId` (auth)
  - Returns lesson + embed URL, updates last watched.
- `POST /learning/complete` (auth)
  - body: `{ lesson_id }`
  - Marks lesson completed and returns updated progress.

## Progress

- `GET /progress/course/:courseId` (auth)
  - Returns completed lessons, total lessons, percentage, last watched lesson.
