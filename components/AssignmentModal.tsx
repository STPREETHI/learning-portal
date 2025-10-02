import React, { useState, useEffect } from 'react';
import { Assignment, AssignmentSubmission, User } from '../types';

interface AssignmentModalProps {
  assignment: Assignment;
  currentUser: User;
  onClose: () => void;
  onSubmit: (content: string) => void;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({ assignment, currentUser, onClose, onSubmit }) => {
  const existingSubmission = assignment.submissions.find(s => s.wardId === currentUser.id);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (existingSubmission) {
      setContent(existingSubmission.content);
    }
  }, [existingSubmission]);

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{assignment.title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Assignment</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
          <div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Instructions</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{assignment.description}</p>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          <div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Your Submission</h3>
            {existingSubmission?.grade !== null ? (
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{content}</p>
                </div>
            ) : (
                <textarea
                    rows={12}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
                    placeholder="Type your submission here..."
                />
            )}
          </div>

           {existingSubmission?.grade !== null && (
            <div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Feedback & Grade</h3>
              <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg space-y-3">
                 <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{existingSubmission.grade}%</p>
                 {existingSubmission.feedback && <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{existingSubmission.feedback}"</p>}
              </div>
            </div>
           )}

        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-md">
            Close
          </button>
          {!existingSubmission || existingSubmission.grade === null && (
            <button onClick={handleSubmit} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
              {existingSubmission ? 'Update Submission' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;
