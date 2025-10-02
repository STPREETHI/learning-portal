import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Question } from '../types';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  private API_BASE_URL = 'http://localhost:5001/api';

  constructor(private http: HttpClient, private apiService: ApiService) { }

  private handleError(error: any) {
    const errorMessage = error.error?.message || error.statusText || 'An unknown AI service error occurred';
    return throwError(() => new Error(errorMessage));
  }

  generateQuizFromText(textContent: string, numQuestions: number): Observable<Question[]> {
    return this.http.post<{ questions: Question[] }>(`${this.API_BASE_URL}/ai/generate-quiz`, { textContent, numQuestions }, { headers: this.apiService.getAuthHeaders() })
      .pipe(
        map(response => response.questions),
        catchError(this.handleError)
      );
  }

  generatePerformanceReview(questions: Question[], userAnswers: string[], score: number): Observable<string> {
    return this.http.post<{ review: string }>(`${this.API_BASE_URL}/ai/generate-review`, { questions, userAnswers, score }, { headers: this.apiService.getAuthHeaders() })
      .pipe(
        map(response => response.review),
        catchError(this.handleError)
      );
  }
}
