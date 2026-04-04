import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // list available models? No, the SDK does not easily expose listModels in this version without auth.
        // Wait, standard gemini models: test gemini-pro
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent("hello");
        console.log("Success gemini-pro:", result.response.text());
    } catch(e) {
        console.error("Failure gemini-pro:", e.message);
    }
}
test();
