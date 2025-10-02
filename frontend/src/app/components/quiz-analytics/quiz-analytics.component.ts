import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Classroom, User, Quiz } from '../../types';

interface AnalyticsData {
  participationRate: number;
  averageScore: number;
  questionDifficulty: { question: string, incorrectCount: number }[];
}

@Component({
  selector: 'app-quiz-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz-analytics.component.html',
})
export class QuizAnalyticsComponent implements OnChanges {
  @Input() classroom!: Classroom;
  @Input() allWards: User[] = [];

  selectedQuizId: string | null = null;
  analytics: AnalyticsData | null = null;
  enrolledWards: User[] = [];
  selectedQuiz: Quiz | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['classroom'] || changes['allWards']) {
      this.enrolledWards = this.allWards.filter(w => (this.classroom.wardIds as string[]).includes(w.id));
      if (!this.selectedQuizId && this.classroom.quizzes.length > 0) {
        this.selectedQuizId = this.classroom.quizzes[0].id;
      }
      this.calculateAnalytics();
    }
  }
  
  onQuizSelectionChange(): void {
      this.calculateAnalytics();
  }

  calculateAnalytics(): void {
    this.selectedQuiz = this.classroom.quizzes.find(q => q.id === this.selectedQuizId);
    if (!this.selectedQuiz || this.enrolledWards.length === 0) {
      this.analytics = null;
      return;
    }

    const participationCount = new Set(this.selectedQuiz.submissions.map(s => s.wardId)).size;
    const participationRate = (participationCount / this.enrolledWards.length) * 100;
    const averageScore = this.selectedQuiz.submissions.length > 0
      ? this.selectedQuiz.submissions.reduce((acc, sub) => acc + sub.score, 0) / this.selectedQuiz.submissions.length
      : 0;

    const questionDifficulty = this.selectedQuiz.questions.map((q, index) => {
      const incorrectCount = this.selectedQuiz!.submissions.filter(s => s.answers[index] !== q.correctAnswer).length;
      return { question: q.question, incorrectCount };
    }).sort((a, b) => b.incorrectCount - a.incorrectCount);

    this.analytics = { participationRate, averageScore, questionDifficulty };
  }
}
