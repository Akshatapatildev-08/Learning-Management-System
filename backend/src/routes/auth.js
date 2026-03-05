import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/index.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

router.post('/signup', (req, res) => {
  const { name, email, password, role = 'student' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, and password are required' });
  }

  if (!['student', 'instructor', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
    .run(name, email, passwordHash, role);

  const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(result.lastInsertRowid);

  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
  return res.status(201).json({ token, user });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  return res.json({ token, user: payload });
});

export default router;
