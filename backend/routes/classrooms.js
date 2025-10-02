const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Classroom = require('../models/Classroom');
const User = require('../models/User');

const router = express.Router();

// All routes are protected
router.use(protect);

// Helper to generate a unique code
const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// GET /api/classrooms/initial-data
// Fetches all classrooms relevant to the user and all wards
router.get('/initial-data', async (req, res) => {
    try {
        let classrooms = [];
        if (req.user.role === 'tutor') {
            classrooms = await Classroom.find({ tutorId: req.user.id });
        } else { // ward
            classrooms = await Classroom.find({ wardIds: req.user.id });
        }
        
        const allWards = await User.find({ role: 'ward' });

        res.status(200).json({ classrooms, allWards });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/classrooms
// Create a new classroom (tutor only)
router.post('/', async (req, res) => {
    if (req.user.role !== 'tutor') {
        return res.status(403).json({ message: 'Only tutors can create classrooms' });
    }
    const { name, description } = req.body;
    try {
        const newClassroom = await Classroom.create({
            name,
            description,
            tutorId: req.user.id,
            code: generateCode(),
            course: { title: `${name} Course`, description: `Syllabus for ${name}`, syllabus: [] },
        });
        res.status(201).json(newClassroom);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create classroom' });
    }
});

// POST /api/classrooms/join
// Ward requests to join a classroom
router.post('/join', async (req, res) => {
    if (req.user.role !== 'ward') {
        return res.status(403).json({ message: 'Only wards can join classrooms' });
    }
    const { code } = req.body;
    try {
        const classroom = await Classroom.findOne({ code });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        if (classroom.wardIds.includes(req.user.id) || classroom.joinRequests.includes(req.user.id)) {
             return res.status(400).json({ message: 'You are already in this classroom or have a pending request' });
        }
        classroom.joinRequests.push(req.user.id);
        await classroom.save();
        res.status(200).json({ message: 'Join request sent' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to join classroom' });
    }
});

// POST /api/classrooms/:classroomId/approve
// Tutor approves a join request
router.post('/:classroomId/approve', async (req, res) => {
    if (req.user.role !== 'tutor') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const { classroomId } = req.params;
    const { wardId } = req.body;
    try {
        const classroom = await Classroom.findById(classroomId);
        if (!classroom || classroom.tutorId.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Classroom not found or you are not the tutor' });
        }
        if (classroom.joinRequests.includes(wardId)) {
            classroom.joinRequests = classroom.joinRequests.filter(id => id.toString() !== wardId);
            classroom.wardIds.push(wardId);
            await classroom.save();
        }
        res.status(200).json(classroom);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/classrooms/:classroomId/quizzes
// Add a quiz
router.post('/:classroomId/quizzes', async (req, res) => {
    const classroom = await Classroom.findById(req.params.classroomId);
    if (!classroom || classroom.tutorId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    classroom.quizzes.push({ ...req.body, submissions: [] });
    await classroom.save();
    res.status(201).json(classroom);
});

// POST /api/classrooms/:classroomId/assignments
// Add an assignment
router.post('/:classroomId/assignments', async (req, res) => {
    const classroom = await Classroom.findById(req.params.classroomId);
    if (!classroom || classroom.tutorId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    classroom.assignments.push({ ...req.body, submissions: [] });
    await classroom.save();
    res.status(201).json(classroom);
});

// POST /api/classrooms/:classroomId/quizzes/:quizId/submit
// Submit a quiz
router.post('/:classroomId/quizzes/:quizId/submit', async (req, res) => {
    const classroom = await Classroom.findById(req.params.classroomId);
    const quiz = classroom.quizzes.id(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    quiz.submissions.push({ ...req.body, wardId: req.user.id });
    await classroom.save();
    res.status(200).json(classroom);
});

// POST /api/classrooms/:classroomId/assignments/:assignmentId/submit
// Submit an assignment
router.post('/:classroomId/assignments/:assignmentId/submit', async (req, res) => {
    const classroom = await Classroom.findById(req.params.classroomId);
    const assignment = classroom.assignments.id(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    
    const existingSubmissionIndex = assignment.submissions.findIndex(s => s.wardId.toString() === req.user.id);
    if (existingSubmissionIndex > -1) {
        assignment.submissions[existingSubmissionIndex].content = req.body.content;
    } else {
        assignment.submissions.push({ ...req.body, wardId: req.user.id });
    }
    
    await classroom.save();
    res.status(200).json(classroom);
});

// POST /api/classrooms/:classroomId/assignments/:assignmentId/grade
// Grade an assignment
router.post('/:classroomId/assignments/:assignmentId/grade', async (req, res) => {
    const classroom = await Classroom.findById(req.params.classroomId);
    if (!classroom || classroom.tutorId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const assignment = classroom.assignments.id(req.params.assignmentId);
    const submission = assignment.submissions.find(s => s.wardId.toString() === req.body.wardId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    
    submission.grade = req.body.grade;
    submission.feedback = req.body.feedback;

    await classroom.save();
    res.status(200).json(classroom);
});

// POST /api/classrooms/:classroomId/attendance
// Update attendance
router.post('/:classroomId/attendance', async (req, res) => {
    const classroom = await Classroom.findById(req.params.classroomId);
    if (!classroom || classroom.tutorId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const { date, statuses } = req.body;
    const recordIndex = classroom.attendance.findIndex(r => r.date === date);
    if (recordIndex > -1) {
        classroom.attendance[recordIndex].statuses = statuses;
    } else {
        classroom.attendance.push({ date, statuses });
    }
    await classroom.save();
    res.status(200).json(classroom);
});

module.exports = router;
