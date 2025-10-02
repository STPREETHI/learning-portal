import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Assignment } from '../../types';

@Component({
  selector: 'app-assignment-creator',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './assignment-creator.component.html',
})
export class AssignmentCreatorComponent {
  @Output() assignmentCreated = new EventEmitter<Omit<Assignment, 'id' | 'submissions'>>();

  title = '';
  description = '';

  handleSubmit(): void {
    if (!this.title.trim() || !this.description.trim()) {
      alert('Please fill out both title and description.');
      return;
    }
    this.assignmentCreated.emit({ title: this.title, description: this.description });
    this.title = '';
    this.description = '';
  }
}
