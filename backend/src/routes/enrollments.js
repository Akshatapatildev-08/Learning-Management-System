import express from 'express';
import { query } from '../db/index.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authRequired, async (req, res) => {
  const { course_id } = req.body;
  const courseId = Number(course_id);

  if (!courseId) {
    return res.status(400).json({ message: 'course_id is required' });
  }

  try {
    await query('INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)', [req.user.id, courseId]);
    return res.status(201).json({ message: 'Enrolled successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY' || err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(409).json({ message: 'Already enrolled or invalid course' });
    }
    return res.status(500).json({ message: 'Enrollment failed' });
  }
});

router.get('/mine', authRequired, async (req, res) => {
  try {
    const courses = await query(
      `SELECT c.id, c.title, c.short_description, c.thumbnail, c.category,
              e.enrolled_at
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = ?
       ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    );

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load enrollments' });
  }
});

export default router;
