const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Course = require('../models/Course');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all reports for a teacher (optionally filter by course)
router.get('/teacher/:teacherId', auth, async (req, res) => {
  try {
    // Ensure string comparison for userId
    if (req.user.role !== 'teacher' || req.user.userId.toString() !== req.params.teacherId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const filter = { teacherId: req.params.teacherId };
    if (req.query.courseId) filter.courseId = req.query.courseId;
    const reports = await Report.find(filter)
      .populate('studentId', 'profile email')
      .populate('courseId', 'title')
      .populate('assessmentId', 'title')
      .sort({ submittedAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a report by id (teacher only)
router.delete('/:reportId', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    // Only allow teacher who owns the report to delete
    if (req.user.role !== 'teacher' || report.teacherId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await Report.findByIdAndDelete(req.params.reportId);
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
