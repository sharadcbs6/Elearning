const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    resourceId: {
        type: String
    }
});

const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    resources: [{
        type: {
            type: String,
            enum: ['video', 'document', '3d', 'link'],
            required: true
        },
        url: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        }
    }],
    order: {
        type: Number,
        required: true
    },
    completedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    notes: [noteSchema]
});

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A course must have a title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'A course must have a description']
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A course must have a teacher']
    },
    modules: [moduleSchema],
    enrolledStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    category: {
        type: String,
        required: [true, 'A course must have a category']
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    thumbnail: String,
    duration: Number,
    rating: {
        type: Number,
        default: 0,
        min: [0, 'Rating must be above 0'],
        max: [5, 'Rating must be below 5']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Update the updatedAt timestamp before saving
courseSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual populate reviews
courseSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'course',
    localField: '_id'
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
