import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true })
    .select('name email role title createdAt')
    .sort({ name: 1 });

  res.json({ users });
});
