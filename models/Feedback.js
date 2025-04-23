const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.ObjectId, ref: 'Course', required: true },
  assessmentId: { type: mongoose.Schema.ObjectId, ref: 'Assessment', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
