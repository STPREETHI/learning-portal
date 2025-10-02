const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctAnswer: String,
}, { _id: false });

const WardSubmissionSchema = new mongoose.Schema({
    wardId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    score: Number,
    answers: [String],
    attempt: Number,
}, { _id: false });

const QuizSchema = new mongoose.Schema({
    title: String,
    questions: [QuestionSchema],
    submissions: [WardSubmissionSchema],
    retakeAllowed: Boolean,
});

const AssignmentSubmissionSchema = new mongoose.Schema({
    wardId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    content: String,
    grade: { type: Number, default: null },
    feedback: { type: String, default: null },
}, { _id: false });

const AssignmentSchema = new mongoose.Schema({
    title: String,
    description: String,
    submissions: [AssignmentSubmissionSchema],
});

const SyllabusItemSchema = new mongoose.Schema({
    topic: String,
    completed: Boolean,
}, { _id: true }); // Use default _id for easier manipulation

const AttendanceStatusSchema = new mongoose.Schema({
    wardId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['present', 'absent', 'late'] },
}, { _id: false });

const AttendanceRecordSchema = new mongoose.Schema({
    date: String,
    statuses: [AttendanceStatusSchema],
}, { _id: false });


const ClassroomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    tutorId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    wardIds: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    joinRequests: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    code: { type: String, unique: true, required: true },
    course: {
        title: String,
        description: String,
        syllabus: [SyllabusItemSchema]
    },
    quizzes: [QuizSchema],
    assignments: [AssignmentSchema],
    attendance: [AttendanceRecordSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    toJSON: { virtuals: true, transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        // Transform nested documents
        ['quizzes', 'assignments', 'course.syllabus'].forEach(key => {
            const keys = key.split('.');
            let current = ret;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            if (current && current[keys[keys.length - 1]]) {
                current[keys[keys.length - 1]].forEach(item => {
                    if (item._id) {
                       item.id = item._id;
                       delete item._id;
                    }
                });
            }
        });
    }},
    toObject: { virtuals: true }
});

ClassroomSchema.virtual('id').get(function() {
    return this._id.toHexString();
});


module.exports = mongoose.model('Classroom', ClassroomSchema);
