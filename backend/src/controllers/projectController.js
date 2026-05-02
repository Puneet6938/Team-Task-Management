import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const memberSelection = 'name email role title';

function projectQueryFor(user) {
  if (user.role === 'admin') return {};
  return { members: user._id };
}

async function ensureUsersExist(ids = []) {
  const uniqueIds = [...new Set(ids.map(String))];
  if (!uniqueIds.length) return uniqueIds;

  const count = await User.countDocuments({ _id: { $in: uniqueIds }, isActive: true });
  if (count !== uniqueIds.length) {
    throw new AppError('One or more members are invalid', 400);
  }

  return uniqueIds;
}

export const listProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find(projectQueryFor(req.user))
    .populate('owner', memberSelection)
    .populate('members', memberSelection)
    .sort({ updatedAt: -1 });

  res.json({ projects });
});

export const createProject = asyncHandler(async (req, res) => {
  const { name, description, members = [], status, dueDate } = req.validated.body;
  const memberIds = await ensureUsersExist([...members, req.user._id]);

  const project = await Project.create({
    name,
    description,
    members: memberIds,
    owner: req.user._id,
    status,
    dueDate: dueDate || undefined
  });

  await project.populate([
    { path: 'owner', select: memberSelection },
    { path: 'members', select: memberSelection }
  ]);

  res.status(201).json({ project });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, ...projectQueryFor(req.user) })
    .populate('owner', memberSelection)
    .populate('members', memberSelection);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const tasks = await Task.find({ project: project._id })
    .populate('assignee', memberSelection)
    .populate('createdBy', memberSelection)
    .sort({ dueDate: 1 });

  res.json({ project, tasks });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  if (req.user.role !== 'admin' && String(project.owner) !== String(req.user._id)) {
    throw new AppError('Only admins or project owners can update projects', 403);
  }

  const updates = { ...req.validated.body };
  if (updates.members) {
    updates.members = await ensureUsersExist([...updates.members, project.owner]);
  }
  if (updates.dueDate === '') updates.dueDate = undefined;

  const updatedProject = await Project.findByIdAndUpdate(project._id, updates, {
    new: true,
    runValidators: true
  })
    .populate('owner', memberSelection)
    .populate('members', memberSelection);

  res.json({ project: updatedProject });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  if (req.user.role !== 'admin' && String(project.owner) !== String(req.user._id)) {
    throw new AppError('Only admins or project owners can delete projects', 403);
  }

  await Task.deleteMany({ project: project._id });
  await project.deleteOne();

  res.status(204).send();
});
