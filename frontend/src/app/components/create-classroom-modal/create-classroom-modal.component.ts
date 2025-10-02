import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-classroom-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-classroom-modal.component.html',
})
export class CreateClassroomModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<{name: string, description: string}>();

  name = '';
  description = '';
  error: string | null = null;

  handleSubmit(): void {
    if (!this.name.trim() || !this.description.trim()) {
      this.error = 'Name and description are required.';
      return;
    }
    this.error = null;
    this.create.emit({ name: this.name, description: this.description });
  }
}
