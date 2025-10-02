const express = require('express');
const { GoogleGenAI, Type } = require('@google/genai');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect); // All AI routes are protected

// Initialize the GoogleGenAI client on the backend with the correct method
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const quizGenerationSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING }
        },
        required: ['question', 'options', 'correctAnswer']
    }
};

router.post('/generate-quiz', async (req, res) => {
    const { textContent, numQuestions } = req.body;

    if (!textContent || !numQuestions) {
        return res.status(400).json({ message: 'Missing text content or number of questions' });
    }

    const prompt = `Based on the following text, generate a multiple-choice quiz with exactly ${numQuestions} questions. Each question should have 4 options. For each question, identify the single correct answer. Ensure the 'correctAnswer' field exactly matches one of the strings in the 'options' array. Text: --- ${textContent} ---`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: quizGenerationSchema,
            }
        });
        
        const jsonText = response.text;
        const parsedQuiz = JSON.parse(jsonText);

        res.json({ questions: parsedQuiz });

    } catch (error) {
        console.error("Error generating quiz from backend:", error);
        res.status(500).json({ message: "Failed to generate quiz from AI service." });
    }
});

router.post('/generate-review', async (req, res) => {
    const { questions, userAnswers, score } = req.body;

    const incorrectQuestions = questions.map((q, i) => ({
        question: q.question,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswers[i]
    })).filter(item => item.userAnswer !== item.correctAnswer);

    const prompt = `A student has just completed a quiz. Their score was ${score.toFixed(0)}%. Here are the questions they answered incorrectly: ${incorrectQuestions.length > 0 ? incorrectQuestions.map(iq => `- Question: "${iq.question}", Correct Answer: "${iq.correctAnswer}", Their Answer: "${iq.userAnswer}"`).join('\n') : 'None. Great job!'} Please provide a brief, constructive, and encouraging performance review (2-4 sentences).`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        res.json({ review: response.text });
    } catch (error) {
        console.error("Error generating performance review from backend:", error);
        res.status(500).json({ message: "Failed to generate performance review." });
    }
});

module.exports = router;
