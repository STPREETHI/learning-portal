import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quiz, User } from '../../types';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
})
export class LeaderboardComponent implements OnChanges {
  @Input() quiz!: Quiz;
  @Input() wards: User[] = [];

  sortedSubmissions: any[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['quiz'] || changes['wards']) {
      this.updateLeaderboard();
    }
  }

  updateLeaderboard(): void {
    this.sortedSubmissions = [...this.quiz.submissions]
      .sort((a, b) => b.score - a.score)
      .map(sub => ({
        ...sub,
        wardName: this.wards.find(w => w.id === sub.wardId)?.name || 'Unknown Ward'
      }));
  }

  getTrophy(index: number): string {
    if (index === 0) return '🏆';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  }
}
