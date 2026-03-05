import express from 'express';
import db from '../db/index.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authRequired, (req, res) => {
  const { course_id } = req.body;
  const courseId = Number(course_id);

  if (!courseId) {
    return res.status(400).json({ message: 'course_id is required' });
  }

  try {
    db.prepare('INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)').run(req.user.id, courseId);
    return res.status(201).json({ message: 'Enrolled successfully' });
  } catch {
    return res.status(409).json({ message: 'Already enrolled or invalid course' });
  }
});

router.get('/mine', authRequired, (req, res) => {
  const courses = db
    .prepare(
      `SELECT c.id, c.title, c.short_description, c.thumbnail, c.category,
              e.enrolled_at
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = ?
       ORDER BY e.enrolled_at DESC`
    )
    .all(req.user.id);

  res.json(courses);
});

export default router;
