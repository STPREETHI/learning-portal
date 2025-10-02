import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { generatePerformanceReview } from '../services/geminiService';
import SpinnerIcon from './icons/SpinnerIcon';

interface AIPerformanceReviewProps {
  questions: Question[];
  userAnswers: string[];
  score: number;
}

const AIPerformanceReview: React.FC<AIPerformanceReviewProps> = ({ questions, userAnswers, score }) => {
  const [review, setReview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      setIsLoading(true);
      try {
        const generatedReview = await generatePerformanceReview(questions, userAnswers, score);
        setReview(generatedReview);
      } catch (error) {
        console.error(error);
        setReview("Could not generate a review at this time.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReview();
  }, [questions, userAnswers, score]);

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
      <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">AI Performance Review</h4>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-48">
            <SpinnerIcon className="w-8 h-8 text-sky-500" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Generating your personalized feedback...</p>
        </div>
      ) : (
        <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
            {review}
        </div>
      )}
    </div>
  );
};

export default AIPerformanceReview;
