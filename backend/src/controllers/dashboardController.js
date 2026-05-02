import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function accessibleProjectQuery(user) {
  if (user.role === 'admin') return { owner: user._id };
  return { members: user._id };
}

export const getDashboard = asyncHandler(async (req, res) => {
  const projects = await Project.find(accessibleProjectQuery(req.user)).select('_id name status dueDate members');
  const projectIds = projects.map((project) => project._id);
  const now = new Date();

  const [tasks, statusCounts, priorityCounts] = await Promise.all([
    Task.find({ project: { $in: projectIds } })
      .populate('project', 'name')
      .populate('assignee', 'name email title')
      .sort({ dueDate: 1 })
      .limit(8),
    Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ])
  ]);

  const overdue = await Task.countDocuments({
    project: { $in: projectIds },
    dueDate: { $lt: now },
    status: { $ne: 'done' }
  });

  const myTasks = await Task.countDocuments({
    project: { $in: projectIds },
    assignee: req.user._id,
    status: { $ne: 'done' }
  });

  res.json({
    metrics: {
      projects: projects.length,
      totalTasks: statusCounts.reduce((sum, item) => sum + item.count, 0),
      overdue,
      myTasks
    },
    statusCounts,
    priorityCounts,
    upcomingTasks: tasks
  });
});
