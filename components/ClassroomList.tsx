import React, { useState } from 'react';
import { Classroom, User, UserRole } from '../types';
import CreateClassroomModal from './CreateClassroomModal';

interface ClassroomListProps {
  classrooms: Classroom[];
  currentUser: User;
  onSelectClassroom: (classroomId: string) => void;
  onCreateClassroom: (name: string, description: string) => void;
  onJoinClassroom: (code: string) => void;
}

const ClassroomList: React.FC<ClassroomListProps> = ({ classrooms, currentUser, onSelectClassroom, onCreateClassroom, onJoinClassroom }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const filteredClassrooms = currentUser.role === UserRole.Tutor
    ? classrooms.filter(c => c.tutorId === currentUser.id)
    : classrooms.filter(c => c.wardIds.includes(currentUser.id));

  const handleCreate = (name: string, description: string) => {
    onCreateClassroom(name, description);
    setIsCreateModalOpen(false);
  };
  
  const handleJoin = () => {
    if (joinCode.trim()) {
      onJoinClassroom(joinCode.trim());
      setIsJoinModalOpen(false);
      setJoinCode('');
    }
  };

  return (
    <>
      {isCreateModalOpen && (
        <CreateClassroomModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreate}
        />
      )}
       {isJoinModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Join Classroom</h2>
                <div>
                    <label htmlFor="joinCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Classroom Code</label>
                    <input
                        type="text"
                        id="joinCode"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
                        placeholder="Enter code from your tutor"
                    />
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={() => setIsJoinModalOpen(false)} className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-md">Cancel</button>
                    <button onClick={handleJoin} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700">Send Join Request</button>
                </div>
            </div>
        </div>
      )}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Your Classrooms</h2>
            </div>
            {currentUser.role === UserRole.Ward ? (
                <button onClick={() => setIsJoinModalOpen(true)} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">Join Classroom</button>
            ) : (
                 <button onClick={() => setIsCreateModalOpen(true)} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700">New Classroom</button>
            )}
        </div>
        
        {filteredClassrooms.length === 0 ? (
            <div className="text-center py-16 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                  {currentUser.role === UserRole.Tutor ? "You haven't created any classrooms yet." : "You are not enrolled in any classrooms."}
                </h3>
                <p className="mt-2 text-slate-500">
                  {currentUser.role === UserRole.Tutor ? "Click 'New Classroom' to get started." : "Use the 'Join Classroom' button and a code from your tutor to enroll."}
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClassrooms.map(classroom => (
                <div 
                  key={classroom.id} 
                  onClick={() => onSelectClassroom(classroom.id)}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden cursor-pointer group transform hover:-translate-y-1 transition-transform"
                >
                  <div className="h-24 bg-sky-600 dark:bg-sky-800"></div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold group-hover:text-sky-600 dark:group-hover:text-sky-400">{classroom.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{classroom.description}</p>
                    <div className="mt-4 flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{classroom.wardIds.length} Students</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )}
      </div>
    </>
  );
};

export default ClassroomList;