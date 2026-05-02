import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRouter } from './routes/authRoutes.js';
import { dashboardRouter } from './routes/dashboardRoutes.js';
import { projectRouter } from './routes/projectRoutes.js';
import { taskRouter } from './routes/taskRoutes.js';
import { userRouter } from './routes/userRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(',') || true,
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 350,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'team-task-manager' });
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/projects', projectRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/dashboard', dashboardRouter);

if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  app.use('/api', notFound);
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  app.use(notFound);
}

app.use(errorHandler);
