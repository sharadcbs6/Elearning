const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// Get all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().populate('teacher', 'profile');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses' });
    }
});

// Get enrolled courses for student
router.get('/enrolled', auth, async (req, res) => {
    try {
        const courses = await Course.find({
            enrolledStudents: req.user.userId
        }).populate('teacher', 'profile');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching enrolled courses' });
    }
});

// Get courses created by teacher
router.get('/teaching', auth, async (req, res) => {
    try {
        const courses = await Course.find({
            teacher: req.user.userId
        }).populate('teacher', 'profile');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teaching courses' });
    }
});

// Create a new course
router.post('/', auth, async (req, res) => {
    try {
        const course = new Course({
            ...req.body,
            teacher: req.user.userId
        });
        await course.save();
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error creating course' });
    }
});

// Get a single course by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('teacher', 'profile');
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user is teacher or enrolled student
        const isTeacher = course.teacher._id.toString() === req.user.userId;
        const isEnrolled = course.enrolledStudents.includes(req.user.userId);
        
        if (!isTeacher && !isEnrolled) {
            return res.status(403).json({ message: 'Not authorized to view this course' });
        }
        
        res.json(course);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ message: 'Error fetching course details' });
    }
});

// Update a course
router.put('/:id', auth, async (req, res) => {
    try {
        const course = await Course.findOneAndUpdate(
            { _id: req.params.id, teacher: req.user.userId },
            req.body,
            { new: true }
        ).populate('teacher', 'profile');
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found or unauthorized' });
        }
        res.json(course);
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Error updating course' });
    }
});

// Delete a course
router.delete('/:id', auth, async (req, res) => {
    try {
        const course = await Course.findOneAndDelete({
            _id: req.params.id,
            teacher: req.user.userId
        });
        if (!course) {
            return res.status(404).json({ message: 'Course not found or unauthorized' });
        }
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Error deleting course' });
    }
});

// Enroll in a course
router.post('/:id/enroll', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.enrolledStudents.includes(req.user.userId)) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        course.enrolledStudents.push(req.user.userId);
        await course.save();
        res.json({ message: 'Successfully enrolled in course' });
    } catch (error) {
        res.status(500).json({ message: 'Error enrolling in course' });
    }
});

// Unenroll from a course
router.post('/:id/unenroll', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if student is enrolled
        if (!course.enrolledStudents.includes(req.user.userId)) {
            return res.status(400).json({ message: 'Not enrolled in this course' });
        }

        // Remove student from enrolled list
        course.enrolledStudents = course.enrolledStudents.filter(
            studentId => studentId.toString() !== req.user.userId
        );

        // Remove all completion records for this student
        course.modules.forEach(module => {
            if (module.completedBy) {
                module.completedBy = module.completedBy.filter(
                    studentId => studentId.toString() !== req.user.userId
                );
            }
        });

        await course.save();
        res.json({ message: 'Successfully unenrolled from course' });
    } catch (error) {
        console.error('Error unenrolling from course:', error);
        res.status(500).json({ message: 'Error unenrolling from course' });
    }
});

// Add a module to a course
router.post('/:id/modules', auth, async (req, res) => {
    try {
        const course = await Course.findOne({
            _id: req.params.id,
            teacher: req.user.userId
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found or unauthorized' });
        }

        course.modules.push({
            title: req.body.title,
            content: req.body.content,
            resources: req.body.resources,
            order: req.body.order
        });

        await course.save();
        res.status(201).json(course);
    } catch (error) {
        console.error('Error adding module:', error);
        res.status(500).json({ message: 'Error adding module' });
    }
});

// Update a module
router.put('/:courseId/modules/:moduleId', auth, async (req, res) => {
    try {
        const course = await Course.findOne({
            _id: req.params.courseId,
            teacher: req.user.userId
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found or unauthorized' });
        }

        const module = course.modules.id(req.params.moduleId);
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        module.title = req.body.title;
        module.content = req.body.content;
        module.resources = req.body.resources;
        module.order = req.body.order;

        await course.save();
        res.json(course);
    } catch (error) {
        console.error('Error updating module:', error);
        res.status(500).json({ message: 'Error updating module' });
    }
});

// Delete a module
router.delete('/:courseId/modules/:moduleId', auth, async (req, res) => {
    try {
        const course = await Course.findOne({
            _id: req.params.courseId,
            teacher: req.user.userId
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found or unauthorized' });
        }

        course.modules.pull(req.params.moduleId);
        await course.save();
        res.json({ message: 'Module deleted successfully' });
    } catch (error) {
        console.error('Error deleting module:', error);
        res.status(500).json({ message: 'Error deleting module' });
    }
});

// Track module completion
router.post('/:courseId/modules/:moduleId/complete', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if student is enrolled
        if (!course.enrolledStudents.includes(req.user.userId)) {
            return res.status(403).json({ message: 'Not enrolled in this course' });
        }

        // Find the module
        const module = course.modules.id(req.params.moduleId);
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Add or update completion status
        if (!module.completedBy) {
            module.completedBy = [];
        }
        
        if (!module.completedBy.includes(req.user.userId)) {
            module.completedBy.push(req.user.userId);
            await course.save();
        }

        res.json({ message: 'Module marked as complete' });
    } catch (error) {
        console.error('Error marking module complete:', error);
        res.status(500).json({ message: 'Error updating module progress' });
    }
});

// Get student's course progress
router.get('/:courseId/progress', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if student is enrolled
        if (!course.enrolledStudents.includes(req.user.userId)) {
            return res.status(403).json({ message: 'Not enrolled in this course' });
        }

        // Calculate progress
        const totalModules = course.modules.length;
        const completedModules = course.modules.filter(module => 
            module.completedBy && module.completedBy.includes(req.user.userId)
        ).length;

        res.json({
            totalModules,
            completedModules,
            progress: totalModules ? (completedModules / totalModules) * 100 : 0
        });
    } catch (error) {
        console.error('Error getting progress:', error);
        res.status(500).json({ message: 'Error fetching progress' });
    }
});

// Get notes for a module
router.get('/:courseId/modules/:moduleId/notes', auth, async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const { resourceId } = req.query;
        const userId = req.user.userId || req.user._id;

        console.log('Getting notes:', { courseId, moduleId, userId, resourceId });

        // Find the course and check if user is enrolled
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user is enrolled or is the teacher
        const isEnrolled = course.enrolledStudents.some(id => id.equals(userId));
        const isTeacher = course.teacher.equals(userId);

        if (!isEnrolled && !isTeacher) {
            return res.status(403).json({ message: 'You must be enrolled in this course to view notes' });
        }

        // Find the module
        const module = course.modules.id(moduleId);
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Get user's notes for this module and resource
        let notes = module.notes ? module.notes.filter(note => note.userId.equals(userId)) : [];
        
        // If resourceId is provided, filter notes by resourceId
        if (resourceId) {
            notes = notes.filter(note => note.resourceId === resourceId);
        }

        console.log('Found notes:', notes);
        res.json(notes);
    } catch (error) {
        console.error('Error getting notes:', error);
        res.status(500).json({ message: 'Error getting notes', error: error.message });
    }
});

// Save note for a module
router.post('/:courseId/modules/:moduleId/notes', auth, async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const { content, resourceId } = req.body;
        const userId = req.user.userId || req.user._id;

        console.log('Saving note:', { courseId, moduleId, userId, content, resourceId });

        // Validate input
        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        if (!resourceId) {
            return res.status(400).json({ message: 'ResourceId is required' });
        }

        // Find the course and check if user is enrolled
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user is enrolled or is the teacher
        const isEnrolled = course.enrolledStudents.some(id => id.equals(userId));
        const isTeacher = course.teacher.equals(userId);

        if (!isEnrolled && !isTeacher) {
            return res.status(403).json({ message: 'You must be enrolled in this course to add notes' });
        }

        // Find the module
        const module = course.modules.id(moduleId);
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Initialize notes array if it doesn't exist
        if (!module.notes) {
            module.notes = [];
        }

        // Create new note
        const note = {
            userId,
            content,
            resourceId,
            timestamp: new Date()
        };

        // Add note to module
        module.notes.push(note);

        // Save the course
        await course.save();

        // Return the newly created note
        res.status(201).json(note);
    } catch (error) {
        console.error('Error saving note:', error);
        res.status(500).json({ message: 'Error saving note', error: error.message });
    }
});

// Edit a note for a module
router.patch('/:courseId/modules/:moduleId/notes/:noteId', auth, async (req, res) => {
    try {
        const { courseId, moduleId, noteId } = req.params;
        const { content } = req.body;
        const userId = req.user.userId || req.user._id;
        
        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        const module = course.modules.id(moduleId);
        if (!module) return res.status(404).json({ message: 'Module not found' });
        if (!module.notes) return res.status(404).json({ message: 'No notes found' });
        const note = module.notes.id(noteId) || module.notes.find(n => n._id?.toString() === noteId || n.timestamp?.toISOString() === noteId);
        if (!note) return res.status(404).json({ message: 'Note not found' });
        if ((note.userId?.toString?.() || note.userId) !== userId.toString()) {
            return res.status(403).json({ message: 'You can only edit your own notes' });
        }
        note.content = content;
        await course.save();
        res.json(note);
    } catch (error) {
        console.error('Error editing note:', error);
        res.status(500).json({ message: 'Error editing note', error: error.message });
    }
});

// Delete a note for a module
router.delete('/:courseId/modules/:moduleId/notes/:noteId', auth, async (req, res) => {
    try {
        const { courseId, moduleId, noteId } = req.params;
        const userId = req.user.userId || req.user._id;
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        const module = course.modules.id(moduleId);
        if (!module) return res.status(404).json({ message: 'Module not found' });
        if (!module.notes) return res.status(404).json({ message: 'No notes found' });
        const noteIndex = module.notes.findIndex(n => (n._id?.toString?.() === noteId || n.timestamp?.toISOString() === noteId));
        if (noteIndex === -1) return res.status(404).json({ message: 'Note not found' });
        if ((module.notes[noteIndex].userId?.toString?.() || module.notes[noteIndex].userId) !== userId.toString()) {
            return res.status(403).json({ message: 'You can only delete your own notes' });
        }
        module.notes.splice(noteIndex, 1);
        await course.save();
        res.json({ message: 'Note deleted' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ message: 'Error deleting note', error: error.message });
    }
});

// Remove dummy course
router.delete('/remove-dummy-course', auth, async (req, res) => {
    try {
        // Only allow admin or teacher to remove dummy course
        if (!req.user.isTeacher && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to remove courses' });
        }

        const dummyCourse = await Course.findOneAndDelete({ title: 'Intro to Web Development' });
        
        if (!dummyCourse) {
            return res.status(404).json({ message: 'Dummy course not found' });
        }

        res.json({ message: 'Dummy course removed successfully', removedCourse: dummyCourse });
    } catch (error) {
        console.error('Error removing dummy course:', error);
        res.status(500).json({ message: 'Error removing dummy course' });
    }
});

module.exports = router;
