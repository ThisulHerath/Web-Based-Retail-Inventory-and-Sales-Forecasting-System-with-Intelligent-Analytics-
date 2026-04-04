import { GoogleGenerativeAI } from '@google/generative-ai';

// Controller to handle the AI chat
export const askAssistant = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        // Initialize Gemini model
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: 'AI Assistant API key is missing. Please restart your backend server if you just added it.' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // System prompt configuration for the specific business context
        const systemInstruction = "You are the secure Business Intelligence AI for 7 Super City. You advise managers on inventory, sales, and retail strategy. Keep answers concise, professional, and data-focused. Refuse to answer non-business questions.";

        // Use gemini-1.5-flash which is the standard, fast model
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: systemInstruction,
        });

        // Generate response
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return res.status(200).json({ answer: responseText });
    } catch (error) {
        console.error('Error generating AI response:', error);
        return res.status(500).json({ message: 'Failed to generate response from AI Assistant' });
    }
};
