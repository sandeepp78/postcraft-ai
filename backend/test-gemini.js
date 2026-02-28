require('dotenv').config();
const axios = require('axios');

async function testGeminiFlash() {
    const chosenApiKey = process.env.GEMINI_API_KEY;
    if (!chosenApiKey) {
        console.log("No Gemini API key found.");
        return;
    }

    try {
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${chosenApiKey}`, {
            contents: [{ parts: [{ text: "Hello, just testing the flash model." }] }]
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log("Success with gemini-2.5-flash-lite!");
        console.log(response.data.candidates[0].content.parts[0].text);
    } catch (err) {
        console.error("Gemini Error:", err.response?.data || err.message);
    }
}
testGeminiFlash();
