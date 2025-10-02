import React, { useState } from 'react';
import { Assignment } from '../types';

interface AssignmentCreatorProps {
  onAssignmentCreated: (assignment: Omit<Assignment, 'id' | 'submissions'>) => void;
}

const AssignmentCreator: React.FC<AssignmentCreatorProps> = ({ onAssignmentCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please fill out both title and description.');
      return;
    }
    onAssignmentCreated({ title, description });
    setTitle('');
    setDescription('');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 w-full">
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Create New Assignment</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="assignmentTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assignment Title</label>
          <input
            type="text"
            id="assignmentTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            placeholder="e.g., Essay on the Fall of Rome"
          />
        </div>
        <div>
          <label htmlFor="assignmentDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description / Instructions</label>
          <textarea
            id="assignmentDescription"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            placeholder="Provide detailed instructions for the assignment."
          />
        </div>
        <button
          type="submit"
          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Publish Assignment
        </button>
      </form>
    </div>
  );
};

export default AssignmentCreator;
