// services/apiService.ts

import { User, UserRole, Classroom, Quiz, Assignment, WardSubmission, AssignmentSubmission, AttendanceRecord, Question } from '../types';

const API_BASE_URL = 'http://localhost:5001/api'; // The address of our backend

// Helper function to get the auth token
const getToken = () => localStorage.getItem('token');

// Helper function for authenticated fetch requests
const fetchAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  // Handle responses that might not have a body (e.g., 204 No Content)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  }
  return null; // or handle as needed
};


// --- Authentication ---
export const apiLogin = async (name: string, pass: string): Promise<{ token: string, user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password: pass }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(errorData.message);
    }
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
};

export const apiRegister = async (name: string, pass: string, role: UserRole): Promise<{ token: string, user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password: pass, role }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(errorData.message);
    }
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
};

export const apiFetchInitialData = async (): Promise<{classrooms: Classroom[], allWards: User[]}> => {
    return fetchAuth('/classrooms/initial-data');
};


// --- Classroom Management ---
export const apiCreateClassroom = async (name: string, description: string): Promise<Classroom> => {
    return fetchAuth('/classrooms', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
    });
};

export const apiJoinClassroom = async (code: string): Promise<Classroom> => {
    return fetchAuth('/classrooms/join', {
        method: 'POST',
        body: JSON.stringify({ code }),
    });
};

export const apiApproveJoinRequest = async (classroomId: string, wardId: string): Promise<Classroom> => {
    return fetchAuth(`/classrooms/${classroomId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ wardId }),
    });
};

// --- Content Management ---

export const apiAddQuizToClassroom = async (classroomId: string, quizData: Omit<Quiz, 'id' | 'submissions'>): Promise<Classroom> => {
    return fetchAuth(`/classrooms/${classroomId}/quizzes`, {
        method: 'POST',
        body: JSON.stringify(quizData),
    });
};

export const apiAddAssignmentToClassroom = async (classroomId: string, assignmentData: Omit<Assignment, 'id' | 'submissions'>): Promise<Classroom> => {
    return fetchAuth(`/classrooms/${classroomId}/assignments`, {
        method: 'POST',
        body: JSON.stringify(assignmentData),
    });
};

export const apiSubmitQuiz = async (classroomId: string, quizId: string, submission: Omit<WardSubmission, 'wardId'>): Promise<Classroom> => {
    return fetchAuth(`/classrooms/${classroomId}/quizzes/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify(submission),
    });
};

export const apiSubmitAssignment = async (classroomId: string, assignmentId: string, submission: Omit<AssignmentSubmission, 'wardId'>): Promise<Classroom> => {
    return fetchAuth(`/classrooms/${classroomId}/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body: JSON.stringify(submission),
    });
};

export const apiGradeAssignment = async (classroomId: string, assignmentId: string, wardId: string, grade: number, feedback: string): Promise<Classroom> => {
    return fetchAuth(`/classrooms/${classroomId}/assignments/${assignmentId}/grade`, {
        method: 'POST',
        body: JSON.stringify({ wardId, grade, feedback }),
    });
};

export const apiUpdateAttendance = async (classroomId: string, record: AttendanceRecord): Promise<Classroom> => {
    return fetchAuth(`/classrooms/${classroomId}/attendance`, {
        method: 'POST',
        body: JSON.stringify(record),
    });
};

// --- AI Service via Backend ---
export const apiGenerateQuiz = async (textContent: string, numQuestions: number): Promise<Question[]> => {
    const data = await fetchAuth('/ai/generate-quiz', {
        method: 'POST',
        body: JSON.stringify({ textContent, numQuestions }),
    });
    return data.questions;
};

export const apiGeneratePerformanceReview = async (questions: Question[], userAnswers: string[], score: number): Promise<string> => {
    const data = await fetchAuth('/ai/generate-review', {
        method: 'POST',
        body: JSON.stringify({ questions, userAnswers, score }),
    });
    return data.review;
};
