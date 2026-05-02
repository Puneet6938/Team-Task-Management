import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const populateTask = [
  { path: 'project', select: 'name status dueDate' },
  { path: 'assignee', select: 'name email role title' },
  { path: 'createdBy', select: 'name email role title' }
];

function accessibleProjectQuery(user) {
  if (user.role === 'admin') return { owner: user._id };
  return { members: user._id };
}

async function findAccessibleTask(taskId, user) {
  const task = await Task.findById(taskId).populate('project');
  if (!task) throw new AppError('Task not found', 404);

  const memberIds = task.project.members.map(String);
  const isOwner = String(task.project.owner) === String(user._id);
  const isMember = memberIds.includes(String(user._id));
  if (user.role === 'admin' ? !isOwner : !isMember) {
    throw new AppError('Task not found', 404);
  }

  return task;
}

function canManageTask(task, user) {
  return (
    String(task.project.owner) === String(user._id) ||
    String(task.createdBy) === String(user._id) ||
    String(task.assignee) === String(user._id)
  );
}

export const listTasks = asyncHandler(async (req, res) => {
  const projects = await Project.find(accessibleProjectQuery(req.user)).select('_id');
  const projectIds = projects.map((project) => project._id);
  const projectIdSet = new Set(projectIds.map(String));
  const query = { project: { $in: projectIds } };

  if (req.query.status) query.status = req.query.status;
  if (req.query.assignee === 'me') query.assignee = req.user._id;
  if (req.query.project && projectIdSet.has(String(req.query.project))) {
    query.project = req.query.project;
  }

  const tasks = await Task.find(query)
    .populate(populateTask)
    .sort({ status: 1, dueDate: 1, updatedAt: -1 });

  res.json({ tasks });
});

export const createTask = asyncHandler(async (req, res) => {
  const { title, description, project: projectId, assignee, status, priority, dueDate } = req.validated.body;
  const project = await Project.findOne({ _id: projectId, ...accessibleProjectQuery(req.user) });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const projectMemberIds = project.members.map(String);
  if (!projectMemberIds.includes(String(assignee))) {
    throw new AppError('Assignee must be a member of the selected project', 400);
  }

  if (String(project.owner) !== String(req.user._id)) {
    throw new AppError('Only the project owner can create tasks', 403);
  }

  const task = await Task.create({
    title,
    description,
    project: project._id,
    assignee,
    createdBy: req.user._id,
    status,
    priority,
    dueDate
  });

  await task.populate(populateTask);
  res.status(201).json({ task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await findAccessibleTask(req.params.id, req.user);

  if (!canManageTask(task, req.user)) {
    throw new AppError('You can only update tasks you created or are assigned to', 403);
  }

  const updates = { ...req.validated.body };
  if (updates.assignee) {
    const projectMemberIds = task.project.members.map(String);
    if (!projectMemberIds.includes(String(updates.assignee))) {
      throw new AppError('Assignee must be a member of this project', 400);
    }
  }

  const updatedTask = await Task.findByIdAndUpdate(task._id, updates, {
    new: true,
    runValidators: true
  }).populate(populateTask);

  res.json({ task: updatedTask });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await findAccessibleTask(req.params.id, req.user);

  if (String(task.project.owner) !== String(req.user._id) && String(task.createdBy) !== String(req.user._id)) {
    throw new AppError('Only the project owner or task creator can delete tasks', 403);
  }

  await task.deleteOne();
  res.status(204).send();
});
