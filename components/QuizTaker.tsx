import React, { useState } from 'react';
import { Quiz, WardSubmission } from '../types';
import AIPerformanceReview from './AIPerformanceReview';

interface QuizTakerProps {
  quiz: Quiz;
  onComplete: (submission: Omit<WardSubmission, 'wardId'>) => void;
  onRetake: () => void;
}

const QuizTaker: React.FC<QuizTakerProps> = ({ quiz, onComplete, onRetake }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(quiz.questions.length).fill(''));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finalAnswers, setFinalAnswers] = useState<string[]>([]);

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    let newScore = 0;
    quiz.questions.forEach((q, index) => {
      if (q.correctAnswer === userAnswers[index]) {
        newScore++;
      }
    });
    const finalScore = (newScore / quiz.questions.length) * 100;
    setScore(finalScore);
    setIsSubmitted(true);
    setFinalAnswers(userAnswers);

    // Find the highest attempt number for this user
    const latestAttempt = quiz.submissions.reduce((max, sub) => Math.max(max, sub.attempt), 0);
    onComplete({ score: finalScore, answers: userAnswers, attempt: latestAttempt + 1 });
  };

  if (isSubmitted) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 w-full max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-2">Quiz Completed!</h3>
        <p className="text-center text-4xl font-extrabold text-sky-600 dark:text-sky-400 mb-6">{score.toFixed(0)}%</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-3">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-white">Your Answers</h4>
                {quiz.questions.map((q, index) => (
                    <div key={index} className="p-4 border rounded-md border-slate-200 dark:border-slate-700">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{index + 1}. {q.question}</p>
                    <ul className="mt-2 space-y-1">
                        {q.options.map((opt) => {
                        const isCorrect = opt === q.correctAnswer;
                        const isUserChoice = opt === finalAnswers[index];
                        let colorClass = 'text-slate-600 dark:text-slate-400';
                        if (isCorrect) colorClass = 'text-green-600 dark:text-green-400';
                        else if (isUserChoice && !isCorrect) colorClass = 'text-red-500 dark:text-red-400';

                        return (
                            <li key={opt} className={`text-sm flex items-center ${colorClass} ${isUserChoice || isCorrect ? 'font-medium' : ''}`}>
                            <span className="mr-2">
                                {isCorrect ? '✓' : (isUserChoice ? '✗' : '•')}
                            </span>
                            {opt}
                            </li>
                        );
                        })}
                    </ul>
                    </div>
                ))}
            </div>
            <AIPerformanceReview questions={quiz.questions} userAnswers={finalAnswers} score={score} />
        </div>
        {quiz.retakeAllowed && (
            <div className="mt-6 text-center">
                <button
                    onClick={onRetake}
                    className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700"
                >
                    Retake Quiz
                </button>
            </div>
        )}
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-2">{quiz.title}</h2>
      <p className="text-center text-slate-500 dark:text-slate-400 mb-6">{quiz.questions.length} questions</p>

      <div className="my-6 min-h-[250px]">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">{currentQuestionIndex + 1}. {currentQuestion.question}</h3>
        <div className="space-y-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswerSelect(option)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                userAnswers[currentQuestionIndex] === option
                  ? 'bg-sky-100 dark:bg-sky-900/50 border-sky-500'
                  : 'bg-slate-50 dark:bg-slate-700/50 border-transparent hover:border-sky-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </span>
        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <button onClick={handleSubmit} className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
            Submit
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizTaker;
