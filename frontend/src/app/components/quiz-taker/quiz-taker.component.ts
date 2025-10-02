import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quiz, WardSubmission } from '../../types';
import { AIPerformanceReviewComponent } from '../ai-performance-review/ai-performance-review.component';

@Component({
  selector: 'app-quiz-taker',
  standalone: true,
  imports: [CommonModule, AIPerformanceReviewComponent],
  templateUrl: './quiz-taker.component.html',
})
export class QuizTakerComponent implements OnInit {
  @Input() quiz!: Quiz;
  @Output() complete = new EventEmitter<Omit<WardSubmission, 'wardId'>>();
  @Output() retake = new EventEmitter<void>();

  currentQuestionIndex = 0;
  userAnswers: string[] = [];
  isSubmitted = false;
  score = 0;
  finalAnswers: string[] = [];

  ngOnInit(): void {
    this.userAnswers = Array(this.quiz.questions.length).fill('');
  }

  handleAnswerSelect(answer: string): void {
    const newAnswers = [...this.userAnswers];
    newAnswers[this.currentQuestionIndex] = answer;
    this.userAnswers = newAnswers;
  }

  handleSubmit(): void {
    let newScore = 0;
    this.quiz.questions.forEach((q, index) => {
      if (q.correctAnswer === this.userAnswers[index]) {
        newScore++;
      }
    });
    const finalScore = (newScore / this.quiz.questions.length) * 100;
    this.score = finalScore;
    this.isSubmitted = true;
    this.finalAnswers = [...this.userAnswers];

    const latestAttempt = this.quiz.submissions.reduce((max, sub) => Math.max(max, sub.attempt), 0);
    this.complete.emit({ score: finalScore, answers: this.userAnswers, attempt: latestAttempt + 1 });
  }

  get currentQuestion() {
    return this.quiz.questions[this.currentQuestionIndex];
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.quiz.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }
}
