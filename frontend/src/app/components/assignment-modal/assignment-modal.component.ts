import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Assignment, AssignmentSubmission, User } from '../../types';

@Component({
  selector: 'app-assignment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assignment-modal.component.html',
})
export class AssignmentModalComponent implements OnInit {
  @Input() assignment!: Assignment;
  @Input() currentUser!: User;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<string>();

  existingSubmission: AssignmentSubmission | undefined;
  content = '';

  ngOnInit(): void {
    this.existingSubmission = this.assignment.submissions.find(s => s.wardId === this.currentUser.id);
    if (this.existingSubmission) {
      this.content = this.existingSubmission.content;
    }
  }

  handleSubmit(): void {
    if (this.content.trim()) {
      this.submit.emit(this.content);
    }
  }
}
