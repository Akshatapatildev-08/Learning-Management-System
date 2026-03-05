import express from 'express';
import db from '../db/index.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.get('/course/:courseId', authRequired, (req, res) => {
  const courseId = Number(req.params.courseId);

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
    .get(courseId, req.user.id, courseId);

  const lastWatched = db
    .prepare('SELECT lesson_id FROM last_watched WHERE user_id = ? AND course_id = ?')
    .get(req.user.id, courseId);

  const completion_percentage =
    totals.total_lessons === 0 ? 0 : Math.round((totals.completed_lessons / totals.total_lessons) * 100);

  res.json({
    course_id: courseId,
    completed_lessons: totals.completed_lessons,
    total_lessons: totals.total_lessons,
    completion_percentage,
    last_watched_lesson_id: lastWatched?.lesson_id || null,
  });
});

export default router;
