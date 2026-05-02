import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    email: z.string().trim().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['admin', 'member']).optional(),
    title: z.string().trim().max(80).optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Enter a valid email'),
    password: z.string().min(1, 'Password is required')
  })
});
