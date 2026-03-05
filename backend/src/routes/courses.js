import express from 'express';
import db from '../db/index.js';

const router = express.Router();

router.get('/', (req, res) => {
  const courses = db
    .prepare(
      `SELECT c.id, c.title, c.short_description, c.thumbnail, c.category,
              u.name as instructor_name
       FROM courses c
       JOIN users u ON u.id = c.instructor_id
       ORDER BY c.id DESC`
    )
    .all();

  res.json(courses);
});

router.get('/:courseId', (req, res) => {
  const courseId = Number(req.params.courseId);
  const course = db
    .prepare(
      `SELECT c.*, u.name as instructor_name
       FROM courses c
       JOIN users u ON u.id = c.instructor_id
       WHERE c.id = ?`
    )
    .get(courseId);

  if (!course) return res.status(404).json({ message: 'Course not found' });

  const lessonStats = db
    .prepare(
      `SELECT COUNT(l.id) as total_lessons, COALESCE(SUM(l.duration_seconds),0) as total_duration_seconds
       FROM sections s
       LEFT JOIN lessons l ON l.section_id = s.id
       WHERE s.course_id = ?`
    )
    .get(courseId);

  res.json({
    ...course,
    total_lessons: lessonStats.total_lessons,
    total_duration_seconds: lessonStats.total_duration_seconds,
  });
});

router.get('/:courseId/lessons', (req, res) => {
  const courseId = Number(req.params.courseId);

  const sections = db
    .prepare('SELECT id, title, order_number FROM sections WHERE course_id = ? ORDER BY order_number')
    .all(courseId);

  const lessonsBySection = db
    .prepare(
      `SELECT l.id, l.section_id, l.title, l.order_number, l.youtube_url, l.duration_seconds
       FROM lessons l
       JOIN sections s ON s.id = l.section_id
       WHERE s.course_id = ?
       ORDER BY s.order_number, l.order_number`
    )
    .all(courseId);

  const result = sections.map((section) => ({
    ...section,
    lessons: lessonsBySection
      .filter((lesson) => lesson.section_id === section.id)
      .map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        order_number: lesson.order_number,
        youtube_url: lesson.youtube_url,
        duration_seconds: lesson.duration_seconds,
      })),
  }));

  res.json(result);
});

export default router;
