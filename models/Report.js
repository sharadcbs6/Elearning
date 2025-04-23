const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
  assessmentTitle: String,
  score: Number,
  percentage: Number,
  modulesDone: [String], // Array of module IDs or names
  modulesLeft: [String],
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);
