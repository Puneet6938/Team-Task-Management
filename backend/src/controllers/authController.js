import { User } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken } from '../utils/token.js';

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  title: user.title
});

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role, title } = req.validated.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError('An account with this email already exists', 409);
  }

  const user = await User.create({ name, email, password, role, title });
  const token = signToken(user);

  res.status(201).json({ token, user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('This account is inactive', 403);
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});
