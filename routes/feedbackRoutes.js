const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');

// POST /api/feedback - student submits feedback
router.post('/', auth, async (req, res) => {
  try {
    const { courseId, assessmentId, rating, text } = req.body;
    if (!courseId || !assessmentId || !rating || !text) {
      return res.status(400).json({ message: 'All fields required' });
    }
    const feedback = new Feedback({
      studentId: req.user.userId,
      courseId,
      assessmentId,
      rating,
      text
    });
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/feedback/teacher/:teacherId - get feedback for teacher's courses/assessments
router.get('/teacher/:teacherId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher' || req.user.userId !== req.params.teacherId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    // Find feedback for courses/assessments owned by this teacher
    // Get courses created by teacher
    const teacherCourses = await require('../models/Course').find({ teacher: req.params.teacherId }, '_id');
    const courseIds = teacherCourses.map(c => c._id);
    const feedbacks = await require('../models/Feedback').find({ courseId: { $in: courseIds } })
      .populate('studentId', 'profile email')
      .populate('courseId', 'title')
      .populate('assessmentId', 'title');
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/feedback/course/:courseId - get feedback for a specific course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    // Only allow teacher or admin
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const feedbacks = await require('../models/Feedback').find({ courseId: req.params.courseId })
      .populate('studentId', 'profile email')
      .populate('assessmentId', 'title');
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/courses/:courseId/feedback - get feedback for a specific course (for modal)
router.get('/courses/:courseId/feedback', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const feedbacks = await require('../models/Feedback').find({ courseId: req.params.courseId })
      .populate('studentId', 'profile email')
      .populate('assessmentId', 'title');
    const formatted = feedbacks.map(f => ({
      _id: f._id,
      studentName: f.studentId?.profile?.name || f.studentId?.email || 'Unknown',
      feedback: f.text,
      rating: f.rating,
      assessment: f.assessmentId?.title || '',
      createdAt: f.createdAt
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/feedback/:feedbackId - delete a feedback entry
router.delete('/:feedbackId', auth, async (req, res) => {
  try {
    // Only allow teacher or admin
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const deleted = await require('../models/Feedback').findByIdAndDelete(req.params.feedbackId);
    if (!deleted) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
