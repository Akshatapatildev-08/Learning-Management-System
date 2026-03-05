import express from 'express';
import db from '../db/index.js';
import { authRequired } from '../middleware/auth.js';
import { extractYouTubeVideoId, toEmbedUrl } from '../utils/youtube.js';

const router = express.Router();

function ensureEnrollment(userId, courseId) {
  return db.prepare('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?').get(userId, courseId);
}

router.get('/course/:courseId', authRequired, (req, res) => {
  const courseId = Number(req.params.courseId);

  const enrolled = ensureEnrollment(req.user.id, courseId);
  if (!enrolled) return res.status(403).json({ message: 'Please enroll first' });

  const lessons = db
    .prepare(
      `SELECT l.id, l.title, l.order_number, l.youtube_url, l.duration_seconds,
              s.id as section_id, s.title as section_title, s.order_number as section_order
       FROM lessons l
       JOIN sections s ON s.id = l.section_id
       WHERE s.course_id = ?
       ORDER BY s.order_number, l.order_number`
    )
    .all(courseId);

  const lastWatched = db
    .prepare('SELECT lesson_id FROM last_watched WHERE user_id = ? AND course_id = ?')
    .get(req.user.id, courseId);

  const completedRows = db
    .prepare(
      `SELECT lesson_id FROM progress
       WHERE user_id = ? AND course_id = ? AND status = 'completed'`
    )
    .all(req.user.id, courseId);

  const completedSet = new Set(completedRows.map((r) => r.lesson_id));

  const lessonList = lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    order_number: lesson.order_number,
    section: {
      id: lesson.section_id,
      title: lesson.section_title,
      order_number: lesson.section_order,
    },
    duration_seconds: lesson.duration_seconds,
    youtube_url: lesson.youtube_url,
    video_id: extractYouTubeVideoId(lesson.youtube_url),
    embed_url: toEmbedUrl(lesson.youtube_url),
    completed: completedSet.has(lesson.id),
  }));

  const total = lessonList.length;
  const completed = lessonList.filter((l) => l.completed).length;
  const completion_percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  res.json({
    lessons: lessonList,
    last_watched_lesson_id: lastWatched?.lesson_id || null,
    completion_percentage,
  });
});

router.get('/lesson/:lessonId', authRequired, (req, res) => {
  const lessonId = Number(req.params.lessonId);
  const lesson = db
    .prepare(
      `SELECT l.id, l.title, l.order_number, l.youtube_url, l.duration_seconds,
              s.course_id
       FROM lessons l
       JOIN sections s ON s.id = l.section_id
       WHERE l.id = ?`
    )
    .get(lessonId);

  if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

  const enrolled = ensureEnrollment(req.user.id, lesson.course_id);
  if (!enrolled) return res.status(403).json({ message: 'Please enroll first' });

  db.prepare(
    `INSERT INTO last_watched (user_id, course_id, lesson_id, updated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(user_id, course_id)
     DO UPDATE SET lesson_id=excluded.lesson_id, updated_at=CURRENT_TIMESTAMP`
  ).run(req.user.id, lesson.course_id, lesson.id);

  res.json({
    ...lesson,
    video_id: extractYouTubeVideoId(lesson.youtube_url),
    embed_url: toEmbedUrl(lesson.youtube_url),
  });
});

router.post('/complete', authRequired, (req, res) => {
  const lessonId = Number(req.body.lesson_id);
  if (!lessonId) return res.status(400).json({ message: 'lesson_id is required' });

  const lesson = db
    .prepare(
      `SELECT l.id, s.course_id
       FROM lessons l
       JOIN sections s ON s.id = l.section_id
       WHERE l.id = ?`
    )
    .get(lessonId);

  if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

  const enrolled = ensureEnrollment(req.user.id, lesson.course_id);
  if (!enrolled) return res.status(403).json({ message: 'Please enroll first' });

  db.prepare(
    `INSERT INTO progress (user_id, course_id, lesson_id, status, completed_at, updated_at)
     VALUES (?, ?, ?, 'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT(user_id, lesson_id)
     DO UPDATE SET status='completed', completed_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP`
  ).run(req.user.id, lesson.course_id, lesson.id);

  db.prepare(
    `INSERT INTO last_watched (user_id, course_id, lesson_id, updated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(user_id, course_id)
     DO UPDATE SET lesson_id=excluded.lesson_id, updated_at=CURRENT_TIMESTAMP`
  ).run(req.user.id, lesson.course_id, lesson.id);

  const totals = db
    .prepare(
      `SELECT
         (SELECT COUNT(*)
          FROM lessons l
          JOIN sections s ON s.id = l.section_id
          WHERE s.course_id = ?) as total_lessons,
         (SELECT COUNT(*)
          FROM progress p
          WHERE p.user_id = ? AND p.course_id = ? AND p.status = 'completed') as completed_lessons`
    )
    .get(lesson.course_id, req.user.id, lesson.course_id);

  const completion_percentage =
    totals.total_lessons === 0 ? 0 : Math.round((totals.completed_lessons / totals.total_lessons) * 100);

  res.json({
    message: 'Lesson marked completed',
    course_id: lesson.course_id,
    lesson_id: lesson.id,
    completion_percentage,
  });
});

export default router;
