# Architecture Flow

Student (Browser)
-> Frontend (React)
-> API call
-> Backend (Express)
-> Database (SQLite)
-> Return lessons + YouTube URLs
-> Frontend embeds YouTube iframe
-> Student watches video from YouTube

## Data Principle

- No video files are uploaded or stored.
- Only metadata is stored:
  - YouTube URL or video ID
  - lesson title/order/duration
  - progress/enrollments/users

## Main Modules

1. Authentication: signup/login, role-based user records.
2. Course module: title, description, thumbnail, category, instructor.
3. Section/Lesson module: Course -> Sections -> Lessons (YouTube URL).
4. Enrollment module: student-course mapping with date.
5. Progress module: completed lessons, percentage, last watched lesson.
