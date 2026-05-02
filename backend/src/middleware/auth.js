import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = authHeader.split(' ')[1];
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(payload.id).select('-password');

  if (!user || !user.isActive) {
    throw new AppError('User no longer exists or is inactive', 401);
  }

  req.user = user;
  next();
});

export const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  next();
};
