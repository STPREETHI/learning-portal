export enum UserRole {
  Tutor = 'tutor',
  Ward = 'ward',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  password?: string; // For simulation purposes
}

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  submissions: WardSubmission[];
  retakeAllowed?: boolean;
}

export interface SyllabusItem {
  id: string;
  topic: string;
  completed: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  syllabus: SyllabusItem[];
}

export interface Ward {
  id: string;
  name: string;
}

export interface WardSubmission {
  wardId: string;
  score: number;
  answers: string[];
  attempt: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  wardId: string;
  content: string;
  grade: number | null;
  feedback: string | null;
}

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface AttendanceRecord {
    date: string; // YYYY-MM-DD
    statuses: { wardId: string; status: AttendanceStatus }[];
}

export interface Classroom {
    id: string;
    name:string;
    description: string;
    tutorId: string;
    wardIds: string[];
    joinRequests: string[]; // wardIds of students requesting to join
    code: string; // Unique join code
    course: Course;
    quizzes: Quiz[];
    assignments: Assignment[];
    attendance: AttendanceRecord[];
}