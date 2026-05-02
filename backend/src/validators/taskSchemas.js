import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2, 'Task title must be at least 2 characters').max(140),
    description: z.string().trim().max(1200).optional(),
    project: objectId,
    assignee: objectId,
    status: z.enum(['todo', 'in-progress', 'review', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueDate: z.string().datetime('Due date must be a valid date')
  })
});

export const updateTaskSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    title: z.string().trim().min(2).max(140).optional(),
    description: z.string().trim().max(1200).optional(),
    assignee: objectId.optional(),
    status: z.enum(['todo', 'in-progress', 'review', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueDate: z.string().datetime().optional()
  })
});

export const taskIdSchema = z.object({
  params: z.object({ id: objectId })
});
