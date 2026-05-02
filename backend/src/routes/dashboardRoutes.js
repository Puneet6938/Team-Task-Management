import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

export const dashboardRouter = Router();

dashboardRouter.get('/', protect, getDashboard);
