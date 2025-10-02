import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { Question, Quiz } from '../../types';
import { SpinnerIconComponent } from '../icons/spinner-icon.component';

@Component({
  selector: 'app-quiz-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerIconComponent],
  templateUrl: './quiz-generator.component.html',
})
export class QuizGeneratorComponent {
  @Output() quizGenerated = new EventEmitter<Omit<Quiz, 'id' | 'submissions'>>();

  textContent = '';
  quizTitle = '';
  numQuestions = 5;
  generatedQuestions: Question[] | null = null;
  isLoading = false;
  loadingMessage: string | null = null;
  error: string | null = null;
  allowRetakes = true;
  
  MOCK_PPT_TEXT = `The Roman Republic was founded in 509 BC when the last king of Rome was overthrown. It was a state of the classical Roman civilization, characterized by a republican form of government. The Republic was governed by an elected Senate. Key figures from this era include Julius Caesar, Cicero, and Augustus. The Republic eventually transformed into the Roman Empire in 27 BC.`;
  MOCK_VIDEO_TRANSCRIPT = `(speaker) ...so, when we talk about astrophysics, we're really looking at the physics of the universe. This includes the properties and interactions of celestial objects. For example, stars like our sun are giant nuclear furnaces. They generate energy through nuclear fusion, primarily converting hydrogen into helium in their cores. This process releases a tremendous amount of energy, which is why stars shine. The lifecycle of a star depends heavily on its mass. Smaller stars become white dwarfs, while massive stars can end their lives in a spectacular supernova explosion...`;

  constructor(private geminiService: GeminiService) {}

  handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.error = null;
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'txt') {
      const reader = new FileReader();
      reader.onload = (e) => this.textContent = e.target?.result as string;
      reader.readAsText(file);
    } else if (['ppt', 'pptx'].includes(extension || '')) {
      this.isLoading = true;
      this.loadingMessage = 'Extracting text from presentation...';
      setTimeout(() => {
        this.textContent = this.MOCK_PPT_TEXT;
        this.isLoading = false;
        this.loadingMessage = null;
      }, 2500);
    } else if (['mp4', 'mov', 'webm'].includes(extension || '')) {
      this.isLoading = true;
      this.loadingMessage = 'Transcribing video...';
      setTimeout(() => {
        this.textContent = this.MOCK_VIDEO_TRANSCRIPT;
        this.isLoading = false;
        this.loadingMessage = null;
      }, 4000);
    } else {
      this.error = 'Unsupported file type.';
    }
    input.value = '';
  }

  handleGenerateQuiz(): void {
    if (!this.textContent.trim() || !this.quizTitle.trim()) {
      this.error = 'Please provide a quiz title and content.';
      return;
    }
    this.isLoading = true;
    this.loadingMessage = 'Generating Quiz with AI...';
    this.error = null;
    this.generatedQuestions = null;
    
    this.geminiService.generateQuizFromText(this.textContent, this.numQuestions).subscribe({
      next: (questions) => {
        this.generatedQuestions = questions;
        this.isLoading = false;
        this.loadingMessage = null;
      },
      error: (err) => {
        this.error = err.message || 'An unknown error occurred.';
        this.isLoading = false;
        this.loadingMessage = null;
      }
    });
  }

  handlePublishQuiz(): void {
    if (this.generatedQuestions && this.quizTitle) {
      this.quizGenerated.emit({
        title: this.quizTitle,
        questions: this.generatedQuestions,
        retakeAllowed: this.allowRetakes,
      });
      this.quizTitle = '';
      this.textContent = '';
      this.generatedQuestions = null;
    }
  }
}
