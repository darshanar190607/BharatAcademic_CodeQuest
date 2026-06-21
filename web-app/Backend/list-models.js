import { GoogleGenerativeAI } from "@google/generative-ai";

async function listModels() {
    const apiKey = 'AIzaSyCPMSZDjJkwy-Zf72HI2qDYU2RcKL6TfPU';
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // Unfortunately GoogleGenerativeAI SDK doesn't have a simple listModels yet 
        // in all versions, let's use the REST API to be sure.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        if (data.models) {
            console.log("Available models:");
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log("No models found:", data);
        }
    } catch (error) {
        console.log('Error:', error.message);
    }
}

listModels();
