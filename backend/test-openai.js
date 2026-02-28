require('dotenv').config();
const axios = require('axios');

async function testOpenAI() {
    const chosenApiKey = process.env.OPENAI_API_KEY;
    if (!chosenApiKey) {
        console.log("No OpenAI API key found.");
        return;
    }

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
                { role: 'user', content: 'Say hello' }
            ]
        }, {
            headers: { 'Authorization': `Bearer ${chosenApiKey}`, 'Content-Type': 'application/json' }
        });
        console.log("Success with OpenAI!");
        console.log(response.data.choices[0].message.content);
    } catch (err) {
        console.error("OpenAI Error:", err.response?.data || err.message);
    }
}
testOpenAI();
