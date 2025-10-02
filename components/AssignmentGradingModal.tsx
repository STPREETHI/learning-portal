import React, { useState } from 'react';
import { Assignment, AssignmentSubmission } from '../types';

interface AssignmentGradingModalProps {
  assignment: Assignment;
  submission: AssignmentSubmission;
  wardName: string;
  onClose: () => void;
  onSaveGrade: (wardId: string, grade: number, feedback: string) => void;
}

const AssignmentGradingModal: React.FC<AssignmentGradingModalProps> = ({ assignment, submission, wardName, onClose, onSaveGrade }) => {
  const [grade, setGrade] = useState<string>(submission.grade?.toString() || '');
  const [feedback, setFeedback] = useState<string>(submission.feedback || '');

  const handleSave = () => {
    const numericGrade = parseInt(grade, 10);
    if (!isNaN(numericGrade) && numericGrade >= 0 && numericGrade <= 100) {
      onSaveGrade(submission.wardId, numericGrade, feedback);
      onClose();
    } else {
      alert("Please enter a valid grade between 0 and 100.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Grade Assignment</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{assignment.title} - {wardName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 overflow-y-auto pr-2 flex-grow">
            <div className="space-y-4">
                <div>
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Student's Submission</h3>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap h-96 overflow-y-auto">
                        {submission.content}
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <label htmlFor="grade" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Grade (%)</label>
                    <input
                        type="number"
                        id="grade"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
                        placeholder="0-100"
                    />
                </div>
                <div>
                    <label htmlFor="feedback" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Feedback</label>
                    <textarea
                        id="feedback"
                        rows={10}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
                        placeholder="Provide constructive feedback..."
                    />
                </div>
            </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-md">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            Save Grade & Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentGradingModal;
