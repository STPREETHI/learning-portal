import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Assignment, AssignmentSubmission } from '../../types';

@Component({
  selector: 'app-assignment-grading-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assignment-grading-modal.component.html',
})
export class AssignmentGradingModalComponent implements OnInit {
  @Input() assignment!: Assignment;
  @Input() submission!: AssignmentSubmission;
  @Input() wardName!: string;
  @Output() close = new EventEmitter<void>();
  @Output() saveGrade = new EventEmitter<{wardId: string, grade: number, feedback: string}>();

  grade: string = '';
  feedback: string = '';

  ngOnInit(): void {
    this.grade = this.submission.grade?.toString() || '';
    this.feedback = this.submission.feedback || '';
  }

  handleSave(): void {
    const numericGrade = parseInt(this.grade, 10);
    if (!isNaN(numericGrade) && numericGrade >= 0 && numericGrade <= 100) {
      this.saveGrade.emit({
        wardId: this.submission.wardId,
        grade: numericGrade,
        feedback: this.feedback
      });
    } else {
      alert("Please enter a valid grade between 0 and 100.");
    }
  }
}
