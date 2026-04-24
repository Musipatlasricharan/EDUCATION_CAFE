require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test(modelName) {
    console.log(`Testing ${modelName}...`);
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        console.log(`[${modelName}] Success:`, (await result.response).text());
        return true;
    } catch (e) {
        console.error(`[${modelName}] Error:`, e.message);
        return false;
    }
}

async function run() {
    await test("gemini-2.5-flash") || await test("gemini-flash-latest") || await test("gemini-3-flash-preview");
}
run();
