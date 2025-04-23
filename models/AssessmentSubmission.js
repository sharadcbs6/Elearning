const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    selectedOptions: [{
        type: String
    }],
    textAnswer: String,
    isCorrect: Boolean,
    pointsEarned: Number
});

const submissionSchema = new mongoose.Schema({
    assessmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [answerSchema],
    totalScore: {
        type: Number,
        required: true
    },
    percentageScore: {
        type: Number,
        required: true
    },
    passed: {
        type: Boolean,
        required: true
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AssessmentSubmission', submissionSchema);
