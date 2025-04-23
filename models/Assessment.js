const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    options: [{
        text: String,
        isCorrect: Boolean
    }],
    type: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'short-answer'],
        default: 'multiple-choice'
    },
    points: {
        type: Number,
        default: 1
    }
});

const assessmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    questions: [questionSchema],
    timeLimit: {
        type: Number, // in minutes
        default: 60
    },
    passingScore: {
        type: Number,
        default: 60
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Assessment', assessmentSchema);
