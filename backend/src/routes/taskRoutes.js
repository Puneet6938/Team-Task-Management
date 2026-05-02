import { Router } from 'express';
import { createTask, deleteTask, listTasks, updateTask } from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTaskSchema, taskIdSchema, updateTaskSchema } from '../validators/taskSchemas.js';

export const taskRouter = Router();

taskRouter.use(protect);
taskRouter.route('/').get(listTasks).post(validate(createTaskSchema), createTask);
taskRouter.route('/:id').patch(validate(updateTaskSchema), updateTask).delete(validate(taskIdSchema), deleteTask);
