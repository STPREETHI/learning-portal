import React, { useState } from 'react';
import { Quiz, Classroom, WardSubmission, Assignment, AssignmentSubmission, User } from '../types';
import QuizTaker from './QuizTaker';
import Leaderboard from './Leaderboard';
import AssignmentModal from './AssignmentModal';

interface WardDashboardProps {
  classroom: Classroom;
  currentUser: User;
  onQuizCompleted: (quizId: string, submission: Omit<WardSubmission, 'wardId'>) => void;
  onAssignmentSubmitted: (assignmentId: string, submission: Omit<AssignmentSubmission, 'wardId'>) => void;
  onBack: () => void;
}

const WardDashboard: React.FC<WardDashboardProps> = ({ classroom, currentUser, onQuizCompleted, onAssignmentSubmitted, onBack }) => {
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);

  const { course, quizzes, assignments, attendance } = classroom;

  const handleQuizComplete = (submission: Omit<WardSubmission, 'wardId'>) => {
    if (activeQuiz) {
      onQuizCompleted(activeQuiz.id, submission);
    }
  };
  
  const handleAssignmentSubmit = (content: string) => {
    if(activeAssignment) {
      onAssignmentSubmitted(activeAssignment.id, { content, grade: null, feedback: null });
      setActiveAssignment(null);
    }
  }

  const wardAttendanceHistory = attendance
    .map(record => ({
        date: record.date,
        status: record.statuses.find(s => s.wardId === currentUser.id)?.status
    }))
    .filter(record => record.status)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (activeQuiz) {
    return (
       <>
         <button onClick={() => setActiveQuiz(null)} className="mb-4 px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
          &larr; Back to Dashboard
        </button>
        <QuizTaker 
            quiz={activeQuiz} 
            onComplete={handleQuizComplete} 
            onRetake={() => setActiveQuiz(activeQuiz)} // Re-renders the quiz taker
        />
       </>
    );
  }

  return (
    <>
      {activeAssignment && (
        <AssignmentModal 
          assignment={activeAssignment}
          currentUser={currentUser}
          onClose={() => setActiveAssignment(null)}
          onSubmit={handleAssignmentSubmit}
        />
      )}
      <div className="space-y-8">
        <div>
            <button onClick={onBack} className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline mb-2">
                &larr; Back to Classrooms
            </button>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{classroom.name}</h2>
            <p className="text-slate-500 dark:text-slate-400">{course.title}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Your Tasks</h3>
                     {quizzes.length === 0 && assignments.length === 0 ? (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-8">Your tutor hasn't assigned any tasks yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {quizzes.map(quiz => {
                                const userSubmissions = quiz.submissions.filter(s => s.wardId === currentUser.id);
                                const latestSubmission = userSubmissions.sort((a,b) => b.attempt - a.attempt)[0];

                                return <div key={quiz.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-5 flex flex-col justify-between">
                                    <div>
                                        <span className="text-xs font-semibold uppercase text-sky-500 dark:text-sky-400">Quiz</span>
                                        <h4 className="font-bold text-lg text-slate-800 dark:text-white mt-1">{quiz.title}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{quiz.questions.length} Questions</p>
                                    </div>
                                    <div className="mt-4">
                                        {latestSubmission ? (
                                            <div className="text-center">
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Latest Score</p>
                                                <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{latestSubmission.score.toFixed(0)}%</p>
                                            </div>
                                        ) : (
                                            <button onClick={() => setActiveQuiz(quiz)} className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700">Start Quiz</button>
                                        )}
                                    </div>
                                </div>
                            })}
                            {assignments.map(assignment => {
                                const submission = assignment.submissions.find(s => s.wardId === currentUser.id);
                                return <div key={assignment.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-5 flex flex-col justify-between">
                                    <div>
                                        <span className="text-xs font-semibold uppercase text-indigo-500 dark:text-indigo-400">Assignment</span>
                                        <h4 className="font-bold text-lg text-slate-800 dark:text-white mt-1">{assignment.title}</h4>
                                    </div>
                                    <div className="mt-4">
                                        {submission ? (
                                            <button onClick={() => setActiveAssignment(assignment)} className="w-full px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm">View Submission</button>
                                        ) : (
                                            <button onClick={() => setActiveAssignment(assignment)} className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">Start Assignment</button>
                                        )}
                                    </div>
                                </div>
                            })}
                        </div>
                    )}
                </div>
            </div>
            <div className="space-y-8">
                 <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Syllabus</h3>
                    {course.syllabus.length > 0 ? (
                        <ul className="space-y-2">
                            {course.syllabus.map(item => (
                                <li key={item.id} className="flex items-center">
                                    <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mr-3 ${item.completed ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                        {item.completed && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <span className={` ${item.completed ? 'text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>{item.topic}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-4">The course syllabus has not been added yet.</p>
                    )}
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Your Attendance</h3>
                     {wardAttendanceHistory.length > 0 ? (
                        <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {wardAttendanceHistory.slice(0, 5).map((record, i) => (
                                <li key={i} className="flex justify-between items-center text-sm p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                    <span className="text-slate-600 dark:text-slate-300">{new Date(record.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                                    <span className={`font-semibold capitalize px-2 py-0.5 rounded-full text-xs ${
                                        record.status === 'present' ? 'bg-green-100 text-green-800' :
                                        record.status === 'absent' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>{record.status}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-4">Your attendance has not been recorded yet.</p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default WardDashboard;
