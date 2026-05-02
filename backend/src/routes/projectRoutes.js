import { Router } from 'express';
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createProjectSchema, projectIdSchema, updateProjectSchema } from '../validators/projectSchemas.js';

export const projectRouter = Router();

projectRouter.use(protect);
projectRouter.route('/').get(listProjects).post(validate(createProjectSchema), createProject);
projectRouter
  .route('/:id')
  .get(validate(projectIdSchema), getProject)
  .patch(validate(updateProjectSchema), updateProject)
  .delete(validate(projectIdSchema), deleteProject);
