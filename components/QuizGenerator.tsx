import React, { useState, useCallback } from 'react';
import { generateQuizFromText } from '../services/geminiService';
import { Question, Quiz } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';

interface QuizGeneratorProps {
  onQuizGenerated: (quiz: Omit<Quiz, 'id' | 'submissions'>) => void;
}

const MOCK_PPT_TEXT = `The Roman Republic was founded in 509 BC when the last king of Rome was overthrown. It was a state of the classical Roman civilization, characterized by a republican form of government. The Republic was governed by an elected Senate. Key figures from this era include Julius Caesar, Cicero, and Augustus. The Republic eventually transformed into the Roman Empire in 27 BC.`;

const MOCK_VIDEO_TRANSCRIPT = `(speaker) ...so, when we talk about astrophysics, we're really looking at the physics of the universe. This includes the properties and interactions of celestial objects. For example, stars like our sun are giant nuclear furnaces. They generate energy through nuclear fusion, primarily converting hydrogen into helium in their cores. This process releases a tremendous amount of energy, which is why stars shine. The lifecycle of a star depends heavily on its mass. Smaller stars become white dwarfs, while massive stars can end their lives in a spectacular supernova explosion...`;


const QuizGenerator: React.FC<QuizGeneratorProps> = ({ onQuizGenerated }) => {
  const [textContent, setTextContent] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allowRetakes, setAllowRetakes] = useState(true);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'txt') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTextContent(e.target?.result as string);
      };
      reader.readAsText(file);
    } else if (['ppt', 'pptx'].includes(extension || '')) {
      setIsLoading(true);
      setLoadingMessage('Extracting text from presentation...');
      setTimeout(() => {
        setTextContent(MOCK_PPT_TEXT);
        setIsLoading(false);
        setLoadingMessage(null);
      }, 2500);
    } else if (['mp4', 'mov', 'webm'].includes(extension || '')) {
      setIsLoading(true);
      setLoadingMessage('Transcribing video, this may take a moment...');
      setTimeout(() => {
        setTextContent(MOCK_VIDEO_TRANSCRIPT);
        setIsLoading(false);
        setLoadingMessage(null);
      }, 4000);
    } else {
      setError('Unsupported file type. Please upload a .txt, .ppt, .pptx, or video file.');
    }
    event.target.value = '';
  };

  const handleGenerateQuiz = useCallback(async () => {
    if (!textContent.trim() || !quizTitle.trim()) {
      setError('Please provide a quiz title and some content.');
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Generating Quiz with AI...');
    setError(null);
    setGeneratedQuestions(null);
    try {
      const questions = await generateQuizFromText(textContent, numQuestions);
      setGeneratedQuestions(questions);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
    }
  }, [textContent, quizTitle, numQuestions]);

  const handlePublishQuiz = () => {
    if (generatedQuestions && quizTitle) {
      onQuizGenerated({
        title: quizTitle,
        questions: generatedQuestions,
        retakeAllowed: allowRetakes,
      });
      setQuizTitle('');
      setTextContent('');
      setGeneratedQuestions(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 w-full">
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Create New Quiz</h3>
      
      {!generatedQuestions ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="quizTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Quiz Title</label>
            <input
              type="text"
              id="quizTitle"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              placeholder="e.g., Chapter 1: Introduction to React"
            />
          </div>
          <div>
            <label htmlFor="textContent" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Study Content</label>
            <textarea
              id="textContent"
              rows={10}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              placeholder="Paste your study material here, or upload a file."
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
                <span>Upload File</span>
                <input id="file-upload" name="file-upload" type="file" accept=".txt,.ppt,.pptx,.mp4,.mov,.webm" className="sr-only" onChange={handleFileChange} />
              </label>
            </div>
            <div>
              <label htmlFor="numQuestions" className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">Number of Questions:</label>
              <input
                type="number"
                id="numQuestions"
                min="1"
                max="10"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value, 10))}
                className="w-20 px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-center"
              />
            </div>
          </div>
          <button
            onClick={handleGenerateQuiz}
            disabled={isLoading}
            className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-300 disabled:cursor-not-allowed"
          >
            {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-3" /> {loadingMessage || 'Processing...'}</> : 'Generate Quiz with AI'}
          </button>
          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </div>
      ) : (
        <div>
          <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Review Generated Quiz: "{quizTitle}"</h4>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {generatedQuestions.map((q, index) => (
              <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-md">
                <p className="font-semibold text-slate-700 dark:text-slate-200">{index + 1}. {q.question}</p>
                <ul className="mt-2 space-y-1">
                  {q.options.map((opt, i) => (
                    <li key={i} className={`text-sm ${opt === q.correctAnswer ? 'text-green-600 dark:text-green-400 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                      {opt === q.correctAnswer ? '✓' : '•'} {opt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
           <div className="mt-4 flex items-center">
            <input
              id="allowRetakes"
              type="checkbox"
              checked={allowRetakes}
              onChange={(e) => setAllowRetakes(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
            />
            <label htmlFor="allowRetakes" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              Allow students to retake this quiz
            </label>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={() => setGeneratedQuestions(null)} className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
              Edit & Regenerate
            </button>
            <button onClick={handlePublishQuiz} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700">
              Publish Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
