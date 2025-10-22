import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const plannerModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function generateJSON(contents, generationConfig = {}) {
    const result = await plannerModel.generateContent({
        contents, generationConfig: {
            temperature: 0.2, responseMimeType: "application/json", ...generationConfig }
        });
    return result.response.text();
}
