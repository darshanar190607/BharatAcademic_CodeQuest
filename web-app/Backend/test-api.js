import { GoogleGenerativeAI } from "@google/generative-ai";

async function testModels() {
    // API key confirmed by user (from .env.local)
    const apiKey = 'AIzaSyCPMSZDjJkwy-Zf72HI2qDYU2RcKL6TfPU';
    console.log('Testing API key:', apiKey.substring(0, 10) + '...');

    const genAI = new GoogleGenerativeAI(apiKey);

    // Testing available models
    const modelNames = ['gemini-2.0-flash', 'gemini-pro-latest', 'gemini-flash-latest'];

    for (const modelName of modelNames) {
        try {
            console.log(`\nTesting: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent("Respond with just 'OK' to confirm you're working.");
            const response = await result.response;
            const text = response.text();

            console.log(`✓ SUCCESS - ${modelName}`);
            console.log(`Response: ${text}`);
            return; // Exit on first success
        } catch (error) {
            console.log(`✗ FAILED - ${modelName}`);
            console.log(`Error: ${error.message}`);
        }
    }
}

testModels();
