import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quiz, Classroom, WardSubmission, Assignment, AssignmentSubmission, User } from '../../types';
import { QuizTakerComponent } from '../quiz-taker/quiz-taker.component';
import { AssignmentModalComponent } from '../assignment-modal/assignment-modal.component';

@Component({
  selector: 'app-ward-dashboard',
  standalone: true,
  imports: [CommonModule, QuizTakerComponent, AssignmentModalComponent],
  templateUrl: './ward-dashboard.component.html',
})
export class WardDashboardComponent {
  @Input() classroom!: Classroom;
  @Input() currentUser!: User;
  @Output() quizCompleted = new EventEmitter<{quizId: string, submission: Omit<WardSubmission, 'wardId'>}>();
  @Output() assignmentSubmitted = new EventEmitter<{assignmentId: string, submission: Omit<AssignmentSubmission, 'wardId'>}>();
  @Output() back = new EventEmitter<void>();

  activeQuiz: Quiz | null = null;
  activeAssignment: Assignment | null = null;

  get attendanceHistory() {
    return this.classroom.attendance
      .map(record => ({
        date: record.date,
        status: record.statuses.find(s => s.wardId === this.currentUser.id)?.status
      }))
      .filter(record => record.status)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  getLatestSubmission(quiz: Quiz): WardSubmission | undefined {
    return quiz.submissions
      .filter(s => s.wardId === this.currentUser.id)
      .sort((a, b) => b.attempt - a.attempt)[0];
  }

  getAssignmentSubmission(assignment: Assignment): AssignmentSubmission | undefined {
    return assignment.submissions.find(s => s.wardId === this.currentUser.id);
  }

  handleQuizComplete(submission: Omit<WardSubmission, 'wardId'>): void {
    if (this.activeQuiz) {
      this.quizCompleted.emit({ quizId: this.activeQuiz.id, submission });
    }
  }

  handleAssignmentSubmit(content: string): void {
    if (this.activeAssignment) {
      this.assignmentSubmitted.emit({
        assignmentId: this.activeAssignment.id,
        submission: { content, grade: null, feedback: null }
      });
      this.activeAssignment = null;
    }
  }
}
