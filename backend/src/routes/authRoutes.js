import { Router } from 'express';
import { login, me, signup } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, signupSchema } from '../validators/authSchemas.js';

export const authRouter = Router();

authRouter.post('/signup', validate(signupSchema), signup);
authRouter.post('/login', validate(loginSchema), login);
authRouter.get('/me', protect, me);
