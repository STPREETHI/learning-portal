import React, { useState, useMemo } from 'react';
import { Classroom, Ward, Quiz, Assignment, AssignmentSubmission, AttendanceRecord } from '../types';
import QuizGenerator from './QuizGenerator';
import AssignmentCreator from './AssignmentCreator';
import AttendanceTracker from './AttendanceTracker';
import QuizAnalytics from './QuizAnalytics';
import Leaderboard from './Leaderboard';
import AssignmentGradingModal from './AssignmentGradingModal';

interface TutorDashboardProps {
  classroom: Classroom;
  allWards: Ward[];
  onBack: () => void;
  onQuizCreated: (quiz: Omit<Quiz, 'id' | 'submissions'>) => void;
  onAssignmentCreated: (assignment: Omit<Assignment, 'id' | 'submissions'>) => void;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onApproveRequest: (wardId: string) => void;
  onGradeAssignment: (assignmentId: string, wardId: string, grade: number, feedback: string) => void;
}

type Tab = 'quizzes' | 'assignments' | 'students' | 'attendance' | 'analytics';

const TutorDashboard: React.FC<TutorDashboardProps> = ({
  classroom,
  allWards,
  onBack,
  onQuizCreated,
  onAssignmentCreated,
  onUpdateAttendance,
  onApproveRequest,
  onGradeAssignment,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('quizzes');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);

  const enrolledWards = useMemo(() => allWards.filter(w => classroom.wardIds.includes(w.id)), [allWards, classroom.wardIds]);
  const joinRequestWards = useMemo(() => allWards.filter(w => classroom.joinRequests.includes(w.id)), [allWards, classroom.joinRequests]);

  const handleGradeClick = (assignment: Assignment, submission: AssignmentSubmission) => {
    setSelectedAssignment(assignment);
    setSelectedSubmission(submission);
  }

  const handleSaveGrade = (wardId: string, grade: number, feedback: string) => {
    if (selectedAssignment) {
      onGradeAssignment(selectedAssignment.id, wardId, grade, feedback);
      setSelectedAssignment(null);
      setSelectedSubmission(null);
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'quizzes':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <QuizGenerator onQuizGenerated={onQuizCreated} />
            </div>
            <div className="lg:col-span-2 space-y-8">
              {classroom.quizzes.map(quiz => (
                <Leaderboard key={quiz.id} quiz={quiz} wards={enrolledWards} />
              ))}
            </div>
          </div>
        );
      case 'assignments':
        return (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <AssignmentCreator onAssignmentCreated={onAssignmentCreated} />
            </div>
            <div className="lg:col-span-2 space-y-6">
              {classroom.assignments.map(assignment => (
                <div key={assignment.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white">{assignment.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{assignment.submissions.length} / {enrolledWards.length} submitted</p>
                    <div className="mt-4">
                        <h5 className="text-sm font-semibold mb-2">Submissions:</h5>
                        {assignment.submissions.length > 0 ? (
                            <ul className="space-y-2">
                                {assignment.submissions.map(sub => {
                                    const ward = enrolledWards.find(w => w.id === sub.wardId);
                                    return <li key={sub.wardId} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                        <span>{ward?.name}</span>
                                        <button onClick={() => handleGradeClick(assignment, sub)} className="text-sm font-medium text-sky-600 hover:underline">
                                          {sub.grade !== null ? `View / Edit Grade (${sub.grade}%)` : 'Grade Now'}
                                        </button>
                                    </li>
                                })}
                            </ul>
                        ) : <p className="text-sm text-slate-400">No submissions yet.</p>}
                    </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'students':
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Enrolled Students ({enrolledWards.length})</h3>
                    <ul className="space-y-2">
                        {enrolledWards.map(ward => <li key={ward.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md font-medium">{ward.name}</li>)}
                    </ul>
                </div>
                 <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Join Requests ({joinRequestWards.length})</h3>
                     {joinRequestWards.length > 0 ? (
                        <ul className="space-y-2">
                            {joinRequestWards.map(ward => <li key={ward.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                <span className="font-medium">{ward.name}</span>
                                <button onClick={() => onApproveRequest(ward.id)} className="px-3 py-1 text-xs font-semibold rounded-md text-white bg-green-600 hover:bg-green-700">Approve</button>
                            </li>)}
                        </ul>
                     ) : <p className="text-slate-500 dark:text-slate-400">No pending join requests.</p>}
                </div>
            </div>
        );
      case 'attendance':
        return <AttendanceTracker wards={enrolledWards} attendanceRecords={classroom.attendance} onUpdateAttendance={onUpdateAttendance} />;
      case 'analytics':
        return <QuizAnalytics classroom={classroom} allWards={allWards} />;
      default:
        return null;
    }
  };

  const tabs: { id: Tab, name: string }[] = [
      { id: 'quizzes', name: 'Quizzes' },
      { id: 'assignments', name: 'Assignments' },
      { id: 'students', name: 'Students' },
      { id: 'attendance', name: 'Attendance' },
      { id: 'analytics', name: 'Analytics' },
  ];

  return (
    <>
      {selectedAssignment && selectedSubmission && (
        <AssignmentGradingModal 
          assignment={selectedAssignment}
          submission={selectedSubmission}
          wardName={enrolledWards.find(w => w.id === selectedSubmission.wardId)?.name || 'Unknown'}
          onClose={() => { setSelectedAssignment(null); setSelectedSubmission(null); }}
          onSaveGrade={handleSaveGrade}
        />
      )}
      <div className="space-y-8">
        <div>
          <button onClick={onBack} className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline mb-2">
            &larr; Back to Classrooms
          </button>
          <div className="md:flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{classroom.name}</h2>
              <p className="text-slate-500 dark:text-slate-400">{classroom.course.title}</p>
            </div>
            <div className="mt-2 md:mt-0 text-sm font-mono bg-slate-100 dark:bg-slate-700 p-2 rounded-md">
                Join Code: <span className="font-bold text-sky-600 dark:text-sky-400">{classroom.code}</span>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabs.map(tab => (
                 <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}>
                    {tab.name}
                </button>
            ))}
          </nav>
        </div>

        <div>
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default TutorDashboard;
