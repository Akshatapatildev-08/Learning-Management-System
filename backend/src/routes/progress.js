import express from 'express';
import { query } from '../db/index.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.get('/course/:courseId', authRequired, async (req, res) => {
  const courseId = Number(req.params.courseId);

  try {
    const totalsRows = await query(
      `SELECT
         (SELECT COUNT(*)
          FROM lessons l
          JOIN sections s ON s.id = l.section_id
          WHERE s.course_id = ?) as total_lessons,
         (SELECT COUNT(*)
          FROM progress p
          WHERE p.user_id = ? AND p.course_id = ? AND p.status = 'completed') as completed_lessons`,
      [courseId, req.user.id, courseId]
    );
    const totals = totalsRows[0];

    const lastWatchedRows = await query('SELECT lesson_id FROM last_watched WHERE user_id = ? AND course_id = ? LIMIT 1', [
      req.user.id,
      courseId,
    ]);

    const totalLessons = Number(totals.total_lessons || 0);
    const completedLessons = Number(totals.completed_lessons || 0);
    const completion_percentage = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

    res.json({
      course_id: courseId,
      completed_lessons: completedLessons,
      total_lessons: totalLessons,
      completion_percentage,
      last_watched_lesson_id: lastWatchedRows[0]?.lesson_id || null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load progress' });
  }
});

export default router;
