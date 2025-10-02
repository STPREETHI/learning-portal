import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Classroom, User, UserRole } from '../../types';
import { CreateClassroomModalComponent } from '../create-classroom-modal/create-classroom-modal.component';

@Component({
  selector: 'app-classroom-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateClassroomModalComponent],
  templateUrl: './classroom-list.component.html',
})
export class ClassroomListComponent {
  @Input() classrooms: Classroom[] = [];
  @Input() currentUser!: User;
  @Output() selectClassroom = new EventEmitter<string>();
  @Output() createClassroom = new EventEmitter<{name: string, description: string}>();
  @Output() joinClassroom = new EventEmitter<string>();

  isCreateModalOpen = false;
  isJoinModalOpen = false;
  joinCode = '';
  
  userRoleEnum = UserRole;

  get filteredClassrooms(): Classroom[] {
    if (!this.currentUser) return [];
    return this.currentUser.role === UserRole.Tutor
      ? this.classrooms.filter(c => c.tutorId === this.currentUser.id)
      : this.classrooms.filter(c => (c.wardIds as string[]).includes(this.currentUser.id));
  }

  handleCreate(data: { name: string, description: string }): void {
    this.createClassroom.emit(data);
    this.isCreateModalOpen = false;
  }

  handleJoin(): void {
    if (this.joinCode.trim()) {
      this.joinClassroom.emit(this.joinCode.trim());
      this.isJoinModalOpen = false;
      this.joinCode = '';
    }
  }
}
