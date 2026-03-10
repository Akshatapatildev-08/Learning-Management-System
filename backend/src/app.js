import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db/migrate.js';
import authRoutes from './routes/auth.js';
import coursesRoutes from './routes/courses.js';
import enrollmentsRoutes from './routes/enrollments.js';
import learningRoutes from './routes/learning.js';
import progressRoutes from './routes/progress.js';

dotenv.config();

const app = express();
const dbReady = initDb();

app.use(cors());
app.use(express.json());

app.use(async (_req, res, next) => {
  try {
    await dbReady;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Database initialization failed' });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/progress', progressRoutes);

export default app;
