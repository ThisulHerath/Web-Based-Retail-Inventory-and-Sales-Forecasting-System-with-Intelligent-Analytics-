import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function test() {
    try {
        console.log("Key:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: "test",
        });
        const result = await model.generateContent("hello");
        console.log("Success:", result.response.text());
    } catch(e) {
        console.error("Failure:", JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
    }
}
test();
