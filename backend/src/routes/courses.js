import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const courses = await query(
      `SELECT c.id, c.title, c.short_description, c.thumbnail, c.category,
              u.name as instructor_name
       FROM courses c
       JOIN users u ON u.id = c.instructor_id
       ORDER BY c.id DESC`
    );
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load courses' });
  }
});

router.get('/:courseId', async (req, res) => {
  const courseId = Number(req.params.courseId);

  try {
    const courses = await query(
      `SELECT c.*, u.name as instructor_name
       FROM courses c
       JOIN users u ON u.id = c.instructor_id
       WHERE c.id = ?
       LIMIT 1`,
      [courseId]
    );

    const course = courses[0];
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const statsRows = await query(
      `SELECT COUNT(l.id) as total_lessons, COALESCE(SUM(l.duration_seconds),0) as total_duration_seconds
       FROM sections s
       LEFT JOIN lessons l ON l.section_id = s.id
       WHERE s.course_id = ?`,
      [courseId]
    );
    const lessonStats = statsRows[0];

    res.json({
      ...course,
      total_lessons: Number(lessonStats.total_lessons || 0),
      total_duration_seconds: Number(lessonStats.total_duration_seconds || 0),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load course details' });
  }
});

router.get('/:courseId/lessons', async (req, res) => {
  const courseId = Number(req.params.courseId);

  try {
    const sections = await query(
      'SELECT id, title, order_number FROM sections WHERE course_id = ? ORDER BY order_number',
      [courseId]
    );

    const lessonsBySection = await query(
      `SELECT l.id, l.section_id, l.title, l.order_number, l.youtube_url, l.duration_seconds
       FROM lessons l
       JOIN sections s ON s.id = l.section_id
       WHERE s.course_id = ?
       ORDER BY s.order_number, l.order_number`,
      [courseId]
    );

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
  } catch (err) {
    res.status(500).json({ message: 'Failed to load lessons' });
  }
});

export default router;
