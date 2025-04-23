const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Progress must belong to a student']
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'Progress must belong to a course']
  },
  completedModules: [{
    type: mongoose.Schema.ObjectId
  }],
  assignments: [{
    moduleId: {
      type: mongoose.Schema.ObjectId,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'graded'],
      default: 'pending'
    },
    submission: String,
    grade: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: String,
    submittedAt: Date,
    gradedAt: Date
  }],
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Index for efficient querying
progressSchema.index({ student: 1, course: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);
module.exports = Progress;
