
import React from 'react';
import { Quiz, Ward } from '../types';

interface LeaderboardProps {
  quiz: Quiz;
  wards: Ward[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ quiz, wards }) => {
  const sortedSubmissions = [...quiz.submissions].sort((a, b) => b.score - a.score);

  const getTrophy = (index: number) => {
    if (index === 0) return '🏆';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 text-center">Leaderboard: {quiz.title}</h3>
      {sortedSubmissions.length > 0 ? (
        <ul className="space-y-3">
          {sortedSubmissions.map((sub, index) => {
            const ward = wards.find(w => w.id === sub.wardId);
            return (
              <li key={sub.wardId} className={`flex items-center justify-between p-3 rounded-md ${index < 3 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-slate-50 dark:bg-slate-700'}`}>
                <div className="flex items-center">
                  <span className="text-lg font-bold w-10 text-center">{getTrophy(index)}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{ward?.name || 'Unknown Ward'}</span>
                </div>
                <span className="font-bold text-sky-600 dark:text-sky-400">{sub.score.toFixed(0)}%</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-slate-500 dark:text-slate-400 text-center py-8">No submissions yet for this quiz.</p>
      )}
    </div>
  );
};

export default Leaderboard;
