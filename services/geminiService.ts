// services/geminiService.ts
import { Question } from '../types';
import { apiGenerateQuiz, apiGeneratePerformanceReview } from './apiService';


export const generateQuizFromText = async (textContent: string, numQuestions: number): Promise<Question[]> => {
    try {
        const questions = await apiGenerateQuiz(textContent, numQuestions);
        return questions;
    } catch (error) {
        console.error("Error generating quiz via backend:", error);
        throw new Error("Failed to generate quiz. The backend service may be unavailable.");
    }
};

export const generatePerformanceReview = async (questions: Question[], userAnswers: string[], score: number): Promise<string> => {
    try {
        const review = await apiGeneratePerformanceReview(questions, userAnswers, score);
        return review;
    } catch (error) {
        console.error("Error generating performance review via backend:", error);
        throw new Error("Failed to generate performance review.");
    }
};
