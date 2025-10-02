import React, { useState, useMemo } from 'react';
import { Classroom, Ward } from '../types';

interface QuizAnalyticsProps {
  classroom: Classroom;
  allWards: Ward[];
}

const QuizAnalytics: React.FC<QuizAnalyticsProps> = ({ classroom, allWards }) => {
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(classroom.quizzes[0]?.id || null);
  
  const enrolledWards = useMemo(() => allWards.filter(w => classroom.wardIds.includes(w.id)), [allWards, classroom.wardIds]);
  const selectedQuiz = useMemo(() => classroom.quizzes.find(q => q.id === selectedQuizId), [classroom.quizzes, selectedQuizId]);

  const analytics = useMemo(() => {
    if (!selectedQuiz || enrolledWards.length === 0) return null;

    const participationCount = new Set(selectedQuiz.submissions.map(s => s.wardId)).size;
    const participationRate = (participationCount / enrolledWards.length) * 100;
    const averageScore = selectedQuiz.submissions.length > 0 
      ? selectedQuiz.submissions.reduce((acc, sub) => acc + sub.score, 0) / selectedQuiz.submissions.length
      : 0;

    const questionDifficulty = selectedQuiz.questions.map((q, index) => {
        const incorrectCount = selectedQuiz.submissions.filter(s => s.answers[index] !== q.correctAnswer).length;
        return { question: q.question, incorrectCount };
    }).sort((a, b) => b.incorrectCount - a.incorrectCount);

    return { participationRate, averageScore, questionDifficulty };
  }, [selectedQuiz, enrolledWards]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Quiz Analytics</h3>
      
      <div>
        <label htmlFor="quiz-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Select a Quiz</label>
        <select
          id="quiz-select"
          value={selectedQuizId || ''}
          onChange={(e) => setSelectedQuizId(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md bg-white dark:bg-slate-700"
        >
          {classroom.quizzes.map(quiz => (
            <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
          ))}
        </select>
      </div>

      {!selectedQuiz ? (
        <p className="text-slate-500 dark:text-slate-400 text-center py-12">Select a quiz to view analytics or create one first.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-sky-600 dark:text-sky-400">{analytics?.averageScore.toFixed(1)}%</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Average Score</p>
            </div>
             <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-sky-600 dark:text-sky-400">{analytics?.participationRate.toFixed(0)}%</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Participation Rate</p>
            </div>
            <div className="col-span-1 md:col-span-3 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Most Difficult Questions</h4>
                <ul className="space-y-2">
                    {analytics?.questionDifficulty.slice(0, 3).map((item, index) => (
                        <li key={index} className="flex items-start justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-300 pr-4">{item.question}</span>
                            <span className="font-bold text-red-500 whitespace-nowrap">{item.incorrectCount} incorrect</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      )}
    </div>
  );
};

export default QuizAnalytics;
