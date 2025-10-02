import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Classroom, User, Quiz, Assignment, AssignmentSubmission, AttendanceRecord } from '../../types';
import { QuizGeneratorComponent } from '../quiz-generator/quiz-generator.component';
import { AssignmentCreatorComponent } from '../assignment-creator/assignment-creator.component';
import { AttendanceTrackerComponent } from '../attendance-tracker/attendance-tracker.component';
import { QuizAnalyticsComponent } from '../quiz-analytics/quiz-analytics.component';
import { LeaderboardComponent } from '../leaderboard/leaderboard.component';
import { AssignmentGradingModalComponent } from '../assignment-grading-modal/assignment-grading-modal.component';

type Tab = 'quizzes' | 'assignments' | 'students' | 'attendance' | 'analytics';

@Component({
  selector: 'app-tutor-dashboard',
  standalone: true,
  imports: [CommonModule, QuizGeneratorComponent, AssignmentCreatorComponent, AttendanceTrackerComponent, QuizAnalyticsComponent, LeaderboardComponent, AssignmentGradingModalComponent],
  templateUrl: './tutor-dashboard.component.html',
})
export class TutorDashboardComponent implements OnChanges {
  @Input() classroom!: Classroom;
  @Input() allWards: User[] = [];
  @Output() back = new EventEmitter<void>();
  @Output() quizCreated = new EventEmitter<Omit<Quiz, 'id' | 'submissions'>>();
  @Output() assignmentCreated = new EventEmitter<Omit<Assignment, 'id' | 'submissions'>>();
  @Output() updateAttendance = new EventEmitter<AttendanceRecord>();
  @Output() approveRequest = new EventEmitter<string>();
  @Output() gradeAssignment = new EventEmitter<{assignmentId: string, wardId: string, grade: number, feedback: string}>();

  activeTab: Tab = 'quizzes';
  selectedAssignment: Assignment | null = null;
  selectedSubmission: AssignmentSubmission | null = null;

  enrolledWards: User[] = [];
  joinRequestWards: User[] = [];

  tabs: { id: Tab, name: string }[] = [
    { id: 'quizzes', name: 'Quizzes' },
    { id: 'assignments', name: 'Assignments' },
    { id: 'students', name: 'Students' },
    { id: 'attendance', name: 'Attendance' },
    { id: 'analytics', name: 'Analytics' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['classroom'] || changes['allWards']) {
      this.updateWardLists();
    }
  }

  updateWardLists(): void {
    const wardIdSet = new Set((this.classroom.wardIds as string[]));
    const joinRequestIdSet = new Set((this.classroom.joinRequests as string[]));
    this.enrolledWards = this.allWards.filter(w => wardIdSet.has(w.id));
    this.joinRequestWards = this.allWards.filter(w => joinRequestIdSet.has(w.id));
  }

  handleGradeClick(assignment: Assignment, submission: AssignmentSubmission): void {
    this.selectedAssignment = assignment;
    this.selectedSubmission = submission;
  }
  
  handleSaveGrade(event: { wardId: string, grade: number, feedback: string }): void {
    if (this.selectedAssignment) {
      this.gradeAssignment.emit({ assignmentId: this.selectedAssignment.id, ...event });
      this.selectedAssignment = null;
      this.selectedSubmission = null;
    }
  }

  getWardName(wardId: string): string {
    return this.allWards.find(w => w.id === wardId)?.name || 'Unknown';
  }
}
