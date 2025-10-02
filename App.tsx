
import React, { useState, useEffect, useCallback } from 'react';
import { Classroom, User, UserRole, Ward, WardSubmission, AssignmentSubmission, Quiz, Assignment, AttendanceRecord } from './types';
import { 
    apiLogin, apiRegister, apiFetchInitialData, apiCreateClassroom, apiJoinClassroom, 
    apiApproveJoinRequest, apiAddQuizToClassroom, apiAddAssignmentToClassroom,
    apiSubmitQuiz, apiSubmitAssignment, apiGradeAssignment, apiUpdateAttendance 
} from './services/apiService';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import ClassroomList from './components/ClassroomList';
import TutorDashboard from './components/TutorDashboard';
import WardDashboard from './components/WardDashboard';
import SpinnerIcon from './components/icons/SpinnerIcon';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [allWards, setAllWards] = useState<User[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Check for existing token on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
        try {
            setCurrentUser(JSON.parse(user));
        } catch (e) {
            // Clear invalid data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
    setIsAuthLoading(false);
  }, []);

  // Fetch data when user logs in
  useEffect(() => {
    const fetchData = async () => {
        if (currentUser) {
            setIsLoading(true);
            try {
                const data = await apiFetchInitialData();
                setClassrooms(data.classrooms);
                setAllWards(data.allWards);
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
                // Handle token expiration - log user out
                handleLogout();
            } finally {
                setIsLoading(false);
            }
        }
    };
    fetchData();
  }, [currentUser]);
  
  const updateClassroomState = (updatedClassroom: Classroom) => {
    setClassrooms(prev => prev.map(c => c.id === updatedClassroom.id ? updatedClassroom : c));
  };

  const handleLogin = async (name: string, pass: string): Promise<boolean> => {
    try {
      const { user } = await apiLogin(name, pass);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const handleRegister = async (name: string, pass: string, role: UserRole): Promise<boolean> => {
    try {
      const { user } = await apiRegister(name, pass, role);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      if (role === UserRole.Ward) {
        setAllWards(prev => [...prev, user]);
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };
  
  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      setSelectedClassroomId(null);
      setClassrooms([]);
      setAllWards([]);
  };

  const handleCreateClassroom = async (name: string, description: string) => {
    try {
      const newClassroom = await apiCreateClassroom(name, description);
      setClassrooms(prev => [...prev, newClassroom]);
    } catch (error) { console.error(error); }
  };

  const handleJoinClassroom = async (code: string) => {
    try {
      await apiJoinClassroom(code);
      alert("Join request sent to the tutor for approval.");
    } catch (error) { 
        console.error(error);
        alert((error as Error).message);
    }
  };

  const handleApproveRequest = async (wardId: string) => {
    if (selectedClassroomId) {
      try {
        const updatedClassroom = await apiApproveJoinRequest(selectedClassroomId, wardId);
        updateClassroomState(updatedClassroom);
      } catch (error) { console.error(error); }
    }
  };
  
  const handleQuizCreated = async (quizData: Omit<Quiz, 'id' | 'submissions'>) => {
    if (selectedClassroomId) {
      try {
        const updatedClassroom = await apiAddQuizToClassroom(selectedClassroomId, quizData);
        updateClassroomState(updatedClassroom);
      } catch (error) { console.error(error); }
    }
  };
  
  const handleAssignmentCreated = async (assignmentData: Omit<Assignment, 'id'|'submissions'>) => {
    if (selectedClassroomId) {
      try {
        const updatedClassroom = await apiAddAssignmentToClassroom(selectedClassroomId, assignmentData);
        updateClassroomState(updatedClassroom);
      } catch (error) { console.error(error); }
    }
  };

  const handleQuizCompleted = async (quizId: string, submission: Omit<WardSubmission, 'wardId'>) => {
    if (selectedClassroomId) {
      try {
        const updatedClassroom = await apiSubmitQuiz(selectedClassroomId, quizId, submission);
        updateClassroomState(updatedClassroom);
      } catch (error) { console.error(error); }
    }
  };

  const handleAssignmentSubmitted = async (assignmentId: string, submission: Omit<AssignmentSubmission, 'wardId'>) => {
    if (selectedClassroomId) {
      try {
        const updatedClassroom = await apiSubmitAssignment(selectedClassroomId, assignmentId, submission);
        updateClassroomState(updatedClassroom);
      } catch (error) { console.error(error); }
    }
  };
  
  const handleGradeAssignment = async (assignmentId: string, wardId: string, grade: number, feedback: string) => {
      if (selectedClassroomId) {
          try {
            const updatedClassroom = await apiGradeAssignment(selectedClassroomId, assignmentId, wardId, grade, feedback);
            updateClassroomState(updatedClassroom);
          } catch (error) { console.error(error); }
      }
  }

  const handleUpdateAttendance = async (record: AttendanceRecord) => {
    if (selectedClassroomId) {
      try {
        const updatedClassroom = await apiUpdateAttendance(selectedClassroomId, record);
        updateClassroomState(updatedClassroom);
      } catch (error) { console.error(error); }
    }
  };

  const selectedClassroom = classrooms.find(c => c.id === selectedClassroomId);

  const renderContent = () => {
    if (isAuthLoading) {
      return <div className="flex justify-center items-center h-screen"><SpinnerIcon className="w-10 h-10" /></div>;
    }
    
    if (!currentUser) {
      return <LoginPage onLogin={handleLogin} onRegister={handleRegister} />;
    }
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-[calc(100vh-10rem)]"><SpinnerIcon className="w-10 h-10" /></div>;
    }

    if (!selectedClassroom) {
      return <ClassroomList 
        classrooms={classrooms} 
        currentUser={currentUser} 
        onSelectClassroom={setSelectedClassroomId}
        onCreateClassroom={handleCreateClassroom}
        onJoinClassroom={handleJoinClassroom}
      />;
    }

    if (currentUser.role === UserRole.Tutor) {
      return <TutorDashboard 
        classroom={selectedClassroom} 
        allWards={allWards}
        onBack={() => setSelectedClassroomId(null)} 
        onQuizCreated={handleQuizCreated}
        onAssignmentCreated={handleAssignmentCreated}
        onUpdateAttendance={handleUpdateAttendance}
        onApproveRequest={handleApproveRequest}
        onGradeAssignment={handleGradeAssignment}
      />;
    }
    
    if (currentUser.role === UserRole.Ward) {
        return <WardDashboard 
            classroom={selectedClassroom}
            currentUser={currentUser}
            onQuizCompleted={handleQuizCompleted}
            onAssignmentSubmitted={handleAssignmentSubmitted}
            onBack={() => setSelectedClassroomId(null)}
        />
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-sans">
      <Header isAuthenticated={!!currentUser} onLogout={handleLogout} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
