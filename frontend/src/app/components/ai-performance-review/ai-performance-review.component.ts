import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../types';
import { GeminiService } from '../../services/gemini.service';
import { SpinnerIconComponent } from '../icons/spinner-icon.component';

@Component({
  selector: 'app-ai-performance-review',
  standalone: true,
  imports: [CommonModule, SpinnerIconComponent],
  templateUrl: './ai-performance-review.component.html',
})
export class AIPerformanceReviewComponent implements OnInit {
  @Input() questions: Question[] = [];
  @Input() userAnswers: string[] = [];
  @Input() score: number = 0;

  review: string | null = null;
  isLoading = true;

  constructor(private geminiService: GeminiService) {}

  ngOnInit(): void {
    this.fetchReview();
  }

  fetchReview(): void {
    this.isLoading = true;
    this.geminiService.generatePerformanceReview(this.questions, this.userAnswers, this.score)
      .subscribe({
        next: (generatedReview) => {
          this.review = generatedReview;
          this.isLoading = false;
        },
        error: (error) => {
          console.error(error);
          this.review = "Could not generate a review at this time.";
          this.isLoading = false;
        }
      });
  }
}
