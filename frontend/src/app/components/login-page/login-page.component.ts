import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserRole } from '../../types';
import { SpinnerIconComponent } from '../icons/spinner-icon.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerIconComponent],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  @Output() login = new EventEmitter<{name: string, pass: string}>();
  @Output() register = new EventEmitter<{name: string, pass: string, role: UserRole}>();

  mode: 'signin' | 'signup' = 'signin';
  name = '';
  password = '';
  role: UserRole = UserRole.Ward;
  error: string | null = null;
  isLoading = false;

  userRoleEnum = UserRole;

  setMode(newMode: 'signin' | 'signup'): void {
    this.mode = newMode;
    this.error = null;
  }

  setRole(newRole: UserRole): void {
    this.role = newRole;
  }

  handleSubmit(): void {
    this.error = null;
    this.isLoading = true;
    
    // The parent component handles the actual API call and loading state.
    // This component emits the event and relies on the parent's response.
    if (this.mode === 'signin') {
      this.login.emit({ name: this.name, pass: this.password });
    } else {
      this.register.emit({ name: this.name, pass: this.password, role: this.role });
    }

    // A timeout to prevent the spinner from getting stuck if the parent
    // component has a synchronous error before the API call.
    setTimeout(() => { if (this.isLoading) this.isLoading = false; }, 5000); 
  }
}
