const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const AssessmentSubmission = require('../models/AssessmentSubmission');
const Report = require('../models/Report');
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// Create a new assessment (teacher only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Only teachers can create assessments' });
        }

        const assessment = new Assessment({
            ...req.body,
            createdBy: req.user.userId
        });
        await assessment.save();
        res.status(201).json(assessment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all assessments for a course
router.get('/course/:courseId', auth, async (req, res) => {
    try {
        const assessments = await Assessment.find({ courseId: req.params.courseId });
        res.json(assessments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all assessments for a course (alternate route for frontend compatibility)
router.get('/courses/:courseId/assessments', auth, async (req, res) => {
    try {
        const assessments = await Assessment.find({ courseId: req.params.courseId });
        res.json(assessments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all assessments for a course (for /api/courses/:courseId/assessments)
router.get('/:courseId/assessments', auth, async (req, res) => {
    try {
        const assessments = await Assessment.find({ courseId: req.params.courseId });
        res.json(assessments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific assessment
router.get('/:id', auth, async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }
        res.json(assessment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Submit an assessment (student only)
router.post('/:id/submit', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can submit assessments' });
        }

        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }

        // Calculate score
        let totalPoints = 0;
        const wrongQuestions = [];
        const answers = req.body.answers.map(answer => {
            const question = assessment.questions.id(answer.questionId);
            let isCorrect = false;
            let pointsEarned = 0;
            let yourAnswer = '';
            let correctAnswer = '';

            if (question.type === 'multiple-choice' || question.type === 'true-false') {
                const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt._id.toString());
                isCorrect = Array.isArray(answer.selectedOptions) &&
                    correctOptions.length === answer.selectedOptions.length &&
                    correctOptions.every(optId => answer.selectedOptions.includes(optId));
                pointsEarned = isCorrect ? question.points : 0;
                // For reporting
                yourAnswer = Array.isArray(answer.selectedOptions) ?
                    question.options.filter(opt => answer.selectedOptions.includes(opt._id.toString())).map(opt => opt.text) : [];
                correctAnswer = question.options.filter(opt => opt.isCorrect).map(opt => opt.text);
            } else if (question.type === 'short-answer') {
                // For short answer, teacher will need to grade manually
                pointsEarned = 0;
                isCorrect = null;
                yourAnswer = answer.textAnswer || '';
                correctAnswer = question.correctAnswer || '';
            }
            // Add to wrongQuestions if not correct (but only for auto-gradable)
            if (isCorrect === false) {
                wrongQuestions.push({
                    questionText: question.questionText,
                    yourAnswer,
                    correctAnswer
                });
            }
            totalPoints += pointsEarned;
            return { ...answer, isCorrect, pointsEarned };
        });

        const totalPossiblePoints = assessment.questions.reduce((sum, q) => sum + q.points, 0);
        const percentageScore = (totalPoints / totalPossiblePoints) * 100;

        const submission = new AssessmentSubmission({
            assessmentId: assessment._id,
            studentId: req.user.userId,
            answers,
            totalScore: totalPoints,
            percentageScore,
            passed: percentageScore >= assessment.passingScore
        });

        await submission.save();

        // Build questionResults for frontend accuracy chart
        const questionResults = answers.map(ans => ({
            questionId: ans.questionId,
            correct: ans.isCorrect === true
        }));

        // --- REPORT GENERATION FOR TEACHER DASHBOARD ---
        // Find course and module completion info
        const course = await Course.findById(assessment.courseId);
        let modulesDone = [], modulesLeft = [];
        if (course) {
            course.modules.forEach(mod => {
                if (mod.completedBy && mod.completedBy.map(id => id.toString()).includes(req.user.userId.toString())) {
                    modulesDone.push(mod.title);
                } else {
                    modulesLeft.push(mod.title);
                }
            });
        }
        // Save report for teacher dashboard
        if (course) {
            try {
                await Report.create({
                    studentId: req.user.userId,
                    teacherId: course.teacher,
                    courseId: course._id,
                    assessmentId: assessment._id,
                    assessmentTitle: assessment.title,
                    score: submission.totalScore,
                    percentage: submission.percentageScore,
                    modulesDone,
                    modulesLeft,
                    submittedAt: new Date()
                });
            } catch (err) {
                console.error('[REPORT DEBUG] Error creating report:', err);
            }
        } else {
            console.warn('[REPORT DEBUG] No course found for assessment:', assessment.courseId);
        }

        res.status(201).json({
            totalScore: submission.totalScore,
            percentageScore: submission.percentageScore,
            passed: submission.passed,
            totalPossiblePoints,
            wrongQuestions,
            questionResults
        });
    } catch (error) {
        console.error('[ERROR] Assessment submission:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get student's submissions for an assessment
router.get('/:id/submissions', auth, async (req, res) => {
    try {
        const submissions = await AssessmentSubmission.find({
            assessmentId: req.params.id,
            studentId: req.user._id
        }).sort({ createdAt: -1 });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update an assessment (teacher only)
router.patch('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Only teachers can update assessments' });
        }

        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }

        if (!assessment.createdBy || assessment.createdBy.toString() !== req.user.userId.toString()) {
            return res.status(403).json({ message: 'You can only update your own assessments' });
        }

        Object.assign(assessment, req.body);
        await assessment.save();
        res.json(assessment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an assessment (teacher only)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Only teachers can delete assessments' });
        }

        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }

        if (!assessment.createdBy || assessment.createdBy.toString() !== req.user.userId.toString()) {
            return res.status(403).json({ message: 'You can only delete your own assessments' });
        }

        await assessment.deleteOne();
        res.json({ message: 'Assessment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
