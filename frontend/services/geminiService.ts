
// frontend/services/geminiService.ts
import { Question } from '../types';

const API_BASE_URL = 'http://localhost:5001/api';

const getToken = () => localStorage.getItem('token');

const fetchAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown AI service error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};


export const generateQuizFromText = async (textContent: string, numQuestions: number): Promise<Question[]> => {
    try {
        const data = await fetchAuth('/ai/generate-quiz', {
            method: 'POST',
            body: JSON.stringify({ textContent, numQuestions }),
        });
        return data.questions;
    } catch (error) {
        console.error("Error generating quiz via backend:", error);
        throw new Error("Failed to generate quiz. The backend service may be unavailable.");
    }
};

export const generatePerformanceReview = async (questions: Question[], userAnswers: string[], score: number): Promise<string> => {
    try {
        const data = await fetchAuth('/ai/generate-review', {
            method: 'POST',
            body: JSON.stringify({ questions, userAnswers, score }),
        });
        return data.review;
    } catch (error) {
        console.error("Error generating performance review via backend:", error);
        throw new Error("Failed to generate performance review.");
    }
};
