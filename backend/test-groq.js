require('dotenv').config();
const axios = require('axios');

async function testGroq() {
    const apiKey = process.env.XAI_API_KEY;
    console.log("Using API Key:", apiKey ? apiKey.substring(0, 8) + '...' : 'NONE');

    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama3-8b-8192',
            messages: [{ role: 'user', content: 'Say hello world' }]
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        console.log("Success! Response:");
        console.log(response.data.choices[0].message.content);
    } catch (error) {
        console.error("Error from Groq:");
        if (error.response) {
            console.error(error.response.status, error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testGroq();
