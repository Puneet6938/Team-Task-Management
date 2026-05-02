import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    description: {
      type: String,
      trim: true,
      maxlength: 800,
      default: ''
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    status: {
      type: String,
      enum: ['planning', 'active', 'paused', 'completed'],
      default: 'active'
    },
    dueDate: Date
  },
  { timestamps: true }
);

projectSchema.index({ owner: 1, name: 1 });
projectSchema.index({ members: 1 });

export const Project = mongoose.model('Project', projectSchema);
