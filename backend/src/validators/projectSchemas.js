import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Project name must be at least 2 characters').max(120),
    description: z.string().trim().max(800).optional(),
    members: z.array(objectId).optional(),
    status: z.enum(['planning', 'active', 'paused', 'completed']).optional(),
    dueDate: z.string().datetime().optional().or(z.literal(''))
  })
});

export const updateProjectSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(800).optional(),
    members: z.array(objectId).optional(),
    status: z.enum(['planning', 'active', 'paused', 'completed']).optional(),
    dueDate: z.string().datetime().optional().or(z.literal(''))
  })
});

export const projectIdSchema = z.object({
  params: z.object({ id: objectId })
});
