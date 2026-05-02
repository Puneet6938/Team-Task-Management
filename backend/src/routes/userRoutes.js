import { Router } from 'express';
import { listUsers } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

export const userRouter = Router();

userRouter.use(protect);
userRouter.get('/', listUsers);
