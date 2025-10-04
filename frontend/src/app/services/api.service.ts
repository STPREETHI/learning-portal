import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, UserRole, Classroom, Quiz, Assignment, WardSubmission, AssignmentSubmission, AttendanceRecord } from '../types';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private API_BASE_URL = environment.apiUrl;

  constructor(private http: HttpClient) { }
  
  public getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  
  private handleError(error: any) {
    const errorMessage = error.error?.message || error.statusText || 'An unknown error occurred';
    return throwError(() => new Error(errorMessage));
  }

  // --- Authentication ---
  login(name: string, pass: string): Observable<{ token: string, user: User }> {
    return this.http.post<{ token: string, user: User }>(`${this.API_BASE_URL}/auth/login`, { name, password: pass })
      .pipe(
        map(response => {
          localStorage.setItem('token', response.token);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  register(name: string, pass: string, role: UserRole): Observable<{ token: string, user: User }> {
    return this.http.post<{ token: string, user: User }>(`${this.API_BASE_URL}/auth/register`, { name, password: pass, role })
      .pipe(
        map(response => {
          localStorage.setItem('token', response.token);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  fetchInitialData(): Observable<{ classrooms: Classroom[], allWards: User[] }> {
    return this.http.get<{ classrooms: Classroom[], allWards: User[] }>(`${this.API_BASE_URL}/classrooms/initial-data`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // --- Classroom Management ---
  createClassroom(name: string, description: string): Observable<Classroom> {
    return this.http.post<Classroom>(`${this.API_BASE_URL}/classrooms`, { name, description }, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  joinClassroom(code: string): Observable<Classroom> {
    return this.http.post<Classroom>(`${this.API_BASE_URL}/classrooms/join`, { code }, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  approveJoinRequest(classroomId: string, wardId: string): Observable<Classroom> {
    return this.http.post<Classroom>(`${this.API_BASE_URL}/classrooms/${classroomId}/approve`, { wardId }, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // --- Content Management ---
  addQuizToClassroom(classroomId: string, quizData: Omit<Quiz, 'id' | 'submissions'>): Observable<Classroom> {
    return this.http.post<Classroom>(`${this.API_BASE_URL}/classrooms/${classroomId}/quizzes`, quizData, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  addAssignmentToClassroom(classroomId: string, assignmentData: Omit<Assignment, 'id' | 'submissions'>): Observable<Classroom> {
    return this.http.post<Classroom>(`${this.API_BASE_URL}/classrooms/${classroomId}/assignments`, assignmentData, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  submitQuiz(classroomId: string, quizId: string, submission: Omit<WardSubmission, 'wardId'>): Observable<Classroom> {
    return this.http.post<Classroom>(`${this.API_BASE_URL}/classrooms/${classroomId}/quizzes/${quizId}/submit`, submission, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }
  
  submitAssignment(classroomId: string, assignmentId: string, submission: Omit<AssignmentSubmission, 'wardId'>): Observable<Classroom> {
    return this.http.post<Classroom>(`${this.API_BASE_URL}/classrooms/${classroomId}/assignments/${assignmentId}/submit`, submission, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  gradeAssignment(classroomId: string, assignmentId: string, wardId: string, grade: number, feedback: string): Observable<Classroom> {
    return this.http.post<Classroom>(`${this.API_BASE_URL}/classrooms/${classroomId}/assignments/${assignmentId}/grade`, { wardId, grade, feedback }, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateAttendance(classroomId: string, record: AttendanceRecord): Observable<Classroom> {
    return this.http.post<Classroom>(`${this.API_BASE_URL}/classrooms/${classroomId}/attendance`, record, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }
}
