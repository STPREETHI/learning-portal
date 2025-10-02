import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Classroom, User, UserRole, Quiz, Assignment,
  WardSubmission, AssignmentSubmission, AttendanceRecord
} from './types';
import { ApiService } from './services/api.service';

// Components
import { HeaderComponent } from './components/header/header.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { SpinnerIconComponent } from './components/icons/spinner-icon.component';
import { ClassroomListComponent } from './components/classroom-list/classroom-list.component';
import { TutorDashboardComponent } from './components/tutor-dashboard/tutor-dashboard.component';
import { WardDashboardComponent } from './components/ward-dashboard/ward-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    LoginPageComponent,
    SpinnerIconComponent,
    ClassroomListComponent,
    TutorDashboardComponent,
    WardDashboardComponent
  ],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-sans">
      <app-header [isAuthenticated]="!!currentUser" (logout)="handleLogout()"></app-header>
      <main class="container mx-auto p-4 sm:p-6 lg:p-8">
        <div *ngIf="isAuthLoading" class="flex justify-center items-center h-screen">
          <app-spinner-icon [className]="'w-10 h-10'"></app-spinner-icon>
        </div>

        <ng-container *ngIf="!isAuthLoading">
          <app-login-page *ngIf="!currentUser" (login)="handleLogin($event)" (register)="handleRegister($event)"></app-login-page>
          
          <ng-container *ngIf="currentUser">
            <div *ngIf="isLoading" class="flex justify-center items-center h-[calc(100vh-10rem)]">
              <app-spinner-icon [className]="'w-10 h-10'"></app-spinner-icon>
            </div>

            <ng-container *ngIf="!isLoading">
              <app-classroom-list 
                *ngIf="!selectedClassroom"
                [classrooms]="classrooms"
                [currentUser]="currentUser"
                (selectClassroom)="setSelectedClassroomId($event)"
                (createClassroom)="handleCreateClassroom($event)"
                (joinClassroom)="handleJoinClassroom($event)">
              </app-classroom-list>
              
              <app-tutor-dashboard
                *ngIf="selectedClassroom && currentUser.role === userRoleEnum.Tutor"
                [classroom]="selectedClassroom"
                [allWards]="allWards"
                (back)="setSelectedClassroomId(null)"
                (quizCreated)="handleQuizCreated($event)"
                (assignmentCreated)="handleAssignmentCreated($event)"
                (updateAttendance)="handleUpdateAttendance($event)"
                (approveRequest)="handleApproveRequest($event)"
                (gradeAssignment)="handleGradeAssignment($event)">
              </app-tutor-dashboard>
              
              <app-ward-dashboard
                *ngIf="selectedClassroom && currentUser.role === userRoleEnum.Ward"
                [classroom]="selectedClassroom"
                [currentUser]="currentUser"
                (quizCompleted)="handleQuizCompleted($event)"
                (assignmentSubmitted)="handleAssignmentSubmitted($event)"
                (back)="setSelectedClassroomId(null)">
              </app-ward-dashboard>
            </ng-container>
          </ng-container>
        </ng-container>
      </main>
    </div>
  `,
})
export class AppComponent implements OnInit {
  currentUser: User | null = null;
  classrooms: Classroom[] = [];
  allWards: User[] = [];
  selectedClassroomId: string | null = null;
  isLoading = false;
  isAuthLoading = true;
  userRoleEnum = UserRole;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
        try {
            this.currentUser = JSON.parse(user);
        } catch (e) {
            this.handleLogout();
        }
    }
    this.isAuthLoading = false;
    if (this.currentUser) {
      this.fetchData();
    }
  }

  get selectedClassroom(): Classroom | undefined {
    return this.classrooms.find(c => c.id === this.selectedClassroomId);
  }

  fetchData(): void {
    this.isLoading = true;
    this.apiService.fetchInitialData().subscribe({
        next: data => {
            this.classrooms = data.classrooms;
            this.allWards = data.allWards;
            this.isLoading = false;
        },
        error: error => {
            console.error("Failed to fetch initial data:", error);
            this.handleLogout();
            this.isLoading = false;
        }
    });
  }

  private updateClassroomState(updatedClassroom: Classroom): void {
    const index = this.classrooms.findIndex(c => c.id === updatedClassroom.id);
    if (index > -1) {
      this.classrooms[index] = updatedClassroom;
      this.classrooms = [...this.classrooms];
    }
  }

  handleLogin({ name, pass }: { name: string, pass: string }): void {
    this.apiService.login(name, pass).subscribe({
      next: ({ user }) => {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUser = user;
        this.fetchData();
      },
      error: error => {
        console.error(error);
        alert(error.message || 'Login failed.');
      }
    });
  }

  handleRegister({ name, pass, role }: { name: string, pass: string, role: UserRole }): void {
    this.apiService.register(name, pass, role).subscribe({
      next: ({ user }) => {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUser = user;
        if (role === UserRole.Ward) {
          this.allWards = [...this.allWards, user];
        }
        this.fetchData();
      },
      error: error => {
        console.error(error);
        alert(error.message || 'Registration failed.');
      }
    });
  }

  handleLogout(): void {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.currentUser = null;
      this.selectedClassroomId = null;
      this.classrooms = [];
      this.allWards = [];
  }

  setSelectedClassroomId(id: string | null): void {
    this.selectedClassroomId = id;
  }

  handleCreateClassroom({ name, description }: { name: string, description: string }): void {
    this.apiService.createClassroom(name, description).subscribe({
      next: newClassroom => {
        this.classrooms = [...this.classrooms, newClassroom];
      },
      error: error => {
        console.error(error);
        alert(error.message || 'Failed to create classroom.');
      }
    });
  }

  handleJoinClassroom(code: string): void {
    this.apiService.joinClassroom(code).subscribe({
      next: () => {
        alert("Join request sent to the tutor for approval.");
        this.fetchData(); // Refresh data to see pending request if applicable
      },
      error: error => {
        console.error(error);
        alert(error.message || 'Failed to join classroom.');
      }
    });
  }

  handleApproveRequest(wardId: string): void {
    if (this.selectedClassroomId) {
      this.apiService.approveJoinRequest(this.selectedClassroomId, wardId).subscribe({
        next: updatedClassroom => this.updateClassroomState(updatedClassroom),
        error: error => console.error(error)
      });
    }
  }
  
  handleQuizCreated(quizData: Omit<Quiz, 'id' | 'submissions'>): void {
    if (this.selectedClassroomId) {
      this.apiService.addQuizToClassroom(this.selectedClassroomId, quizData).subscribe({
        next: updatedClassroom => this.updateClassroomState(updatedClassroom),
        error: error => console.error(error)
      });
    }
  }
  
  handleAssignmentCreated(assignmentData: Omit<Assignment, 'id'|'submissions'>): void {
    if (this.selectedClassroomId) {
      this.apiService.addAssignmentToClassroom(this.selectedClassroomId, assignmentData).subscribe({
        next: updatedClassroom => this.updateClassroomState(updatedClassroom),
        error: error => console.error(error)
      });
    }
  }

  handleQuizCompleted({ quizId, submission }: { quizId: string, submission: Omit<WardSubmission, 'wardId'> }): void {
    if (this.selectedClassroomId) {
      this.apiService.submitQuiz(this.selectedClassroomId, quizId, submission).subscribe({
        next: updatedClassroom => this.updateClassroomState(updatedClassroom),
        error: error => console.error(error)
      });
    }
  }

  handleAssignmentSubmitted({ assignmentId, submission }: { assignmentId: string, submission: Omit<AssignmentSubmission, 'wardId'> }): void {
    if (this.selectedClassroomId) {
      this.apiService.submitAssignment(this.selectedClassroomId, assignmentId, submission).subscribe({
        next: updatedClassroom => this.updateClassroomState(updatedClassroom),
        error: error => console.error(error)
      });
    }
  }
  
  handleGradeAssignment({ assignmentId, wardId, grade, feedback }: { assignmentId: string, wardId: string, grade: number, feedback: string }): void {
      if (this.selectedClassroomId) {
        this.apiService.gradeAssignment(this.selectedClassroomId, assignmentId, wardId, grade, feedback).subscribe({
          next: updatedClassroom => this.updateClassroomState(updatedClassroom),
          error: error => console.error(error)
        });
      }
  }

  handleUpdateAttendance(record: AttendanceRecord): void {
    if (this.selectedClassroomId) {
      this.apiService.updateAttendance(this.selectedClassroomId, record).subscribe({
        next: updatedClassroom => this.updateClassroomState(updatedClassroom),
        error: error => console.error(error)
      });
    }
  }
}
