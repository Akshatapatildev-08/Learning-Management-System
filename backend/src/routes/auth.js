import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

router.post('/signup', async (req, res) => {
  const { name, email, password, role = 'student' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, and password are required' });
  }

  if (!['student', 'instructor', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const existing = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = await query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [
      name,
      email,
      passwordHash,
      role,
    ]);

    const users = await query('SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1', [result.insertId]);
    const user = users[0];
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ token, user });
  } catch (err) {
    return res.status(500).json({ message: 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  try {
    const users = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    const user = users[0];
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: payload });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed' });
  }
});

export default router;
