// c:/Users/sande/OneDrive/Desktop/Linkedin - project/postcraft-ai/backend/routes/generate.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Auto-select model based on heuristics
function selectModel(rawInput) {
  const lowerInput = rawInput.toLowerCase();
  if (lowerInput.match(/code|software|architecture|tech|api|system/)) return 'Claude';
  if (lowerInput.match(/business|career|leadership|management|strategy/)) return 'GPT-4o';
  if (lowerInput.match(/opinion|take|trending|controversial|agree|disagree/)) return 'Grok';
  if (lowerInput.match(/data|stats|percent|research|numbers|metrics/)) return 'Gemini';
  if (lowerInput.match(/news|facts|cited|study|report/)) return 'Perplexity';
  return 'Claude'; // Default
}

// Model Identifiers match exact Frontend and DB names (Claude, GPT-4o, Grok, Gemini, Perplexity)

const SYSTEM_PROMPT = `You are a world-class LinkedIn ghostwriter who has grown accounts to 100,000+ followers.
Writing style for [MODEL]:
Claude=thoughtful nuanced storytelling.
GPT-4o=sharp structured professional.
Grok=bold direct confident contrarian.
Gemini=data-driven analytical authoritative.
Perplexity=fact-grounded credible informative.

STRICT RULES:
1. NO emojis anywhere in the post
2. Simple clear English, no jargon, every professional must understand
3. LinkedIn format: short lines, max 2-3 sentences per block, blank line between every block
4. First line must be a strong hook: curiosity gap, bold claim, story opener, or pattern interrupt
5. Length: Medium=150-250 words, Long=300-450 words, Deep Long=500-700 words. Apply: [LENGTH]
6. Tone [0-100]: 0=purely professional, 50=balanced, 100=conversational. Apply: [TONE]
7. Apply CTA styles: Question CTA=end with direct question. Opinion Poll CTA=ask A or B in comments. Call to Action CTA=direct ask to follow/share/save. Story End CTA=invite readers to share their story. Curiosity Hook CTA=tease something next. Apply: [CTA_STYLES]
8. If analogMode ON: add text poll at end — "Which applies to you? A)... B)... C)..."
9. No hashtags in post body, return separately
10. First person I voice, personal experience framing
11. Structure strictly: Hook → Context/Story → Core Insight → Value/Lesson → CTA
12. Sound like a real human. Never use: "In today's world", "Game changer", "Leverage", "Delve"
13. Trigger one emotion: inspiration, curiosity, surprise, agreement, or reflection
14. If hookMode ON, provide 3 alternative opening hook lines for user to choose from

Return ONLY this exact JSON, no markdown, no extra text:
{
  "post": "full post with \\n for line breaks",
  "hooks": ["hook1","hook2","hook3"],
  "hashtags": ["tag1","tag2","tag3","tag4","tag5"],
  "viral_score": 85,
  "viral_breakdown": {"hook":88,"emotional_pull":82,"clarity":90,"cta_strength":80,"uniqueness":85},
  "best_time": "Tuesday or Wednesday, 7-9 AM or 12-1 PM local time",
  "best_time_reason": "brief explanation",
  "model_used": "[MODEL]",
  "model_reason": "why this model was chosen for this content"
}
`;

// Helper to strip markdown fences securely
function stripMarkdownAndParse(text) {
  let cleaned = text.trim();

  // Find the first { and last } to extract just the JSON object
  // This explicitly strips out any conversational filler the LLM prepends or appends
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  } else {
    // Fallback if no braces found
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/```$/, '').trim();
    }
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // If it fails due to unescaped literal newlines in strings, fix it
    let inString = false;
    let escaped = false;
    let fixed = '';
    for (let i = 0; i < cleaned.length; i++) {
      let c = cleaned[i];
      if (c === '"' && !escaped) inString = !inString;
      if (c === '\\' && !escaped) escaped = true;
      else escaped = false;

      if (inString && c === '\n') fixed += '\\n';
      else if (inString && c === '\r') fixed += '\\r';
      else if (inString && c === '\t') fixed += '\\t';
      else fixed += c;
    }
    return JSON.parse(fixed);
  }
}

// POST /api/generate
router.post('/', async (req, res) => {
  const { rawInput, length, tone, ctaStyles, hookMode, analogMode, selectedHook, modelOverride, triedModels = [] } = req.body;

  if (!rawInput) return res.status(400).json({ error: 'Raw input required' });

  try {
    // 1. Determine Model
    // Normalize modelOverride if it comes back as something like "Gemini 2.5 Flash Lite"
    let normalizedOverride = modelOverride;
    if (modelOverride && modelOverride.includes('Gemini')) normalizedOverride = 'Gemini';

    // Check for explicit mention in prompt before applying heuristics
    let userPromptOverride = null;
    const lowerRawInput = rawInput.toLowerCase();

    // Check Groq/Grok FIRST
    if (lowerRawInput.includes('groq') || lowerRawInput.includes('grok')) {
      userPromptOverride = 'Grok';
    }
    // Check Gemini/Google next
    else if (lowerRawInput.includes('gemini') || lowerRawInput.includes('google')) {
      userPromptOverride = 'Gemini';
    }
    // Check Claude/Anthropic
    else if (lowerRawInput.includes('claude') || lowerRawInput.includes('anthropic')) {
      userPromptOverride = 'Claude';
    }
    // Check GPT/OpenAI
    else if (lowerRawInput.includes('gpt') || lowerRawInput.includes('openai')) {
      userPromptOverride = 'GPT-4o';
    }
    // Check Perplexity
    else if (lowerRawInput.includes('perplexity')) {
      userPromptOverride = 'Perplexity';
    }

    // Force userPromptOverride if it exists, ignoring heuristics entirely
    let targetModel = normalizedOverride || userPromptOverride || selectModel(rawInput);

    // Fetch user keys from environment variables instead of database
    const keyMap = {
      'Claude': process.env.ANTHROPIC_API_KEY,
      'GPT-4o': process.env.OPENAI_API_KEY,
      'Grok': process.env.XAI_API_KEY,
      'Gemini': process.env.GEMINI_API_KEY,
      'Perplexity': process.env.PERPLEXITY_API_KEY
    };

    // Fallback logic if key is missing or model was already tried
    let chosenModel = targetModel;
    let chosenApiKey = keyMap[targetModel];

    // ONLY attempt automatic key-based fallback if the user DID NOT explicitly choose a model via the dropdown
    if (!normalizedOverride) {
      if (!chosenApiKey || triedModels.includes(chosenModel)) {
        if (keyMap['Gemini'] && !triedModels.includes('Gemini')) {
          chosenModel = 'Gemini';
          chosenApiKey = keyMap['Gemini'];
        } else if (keyMap['Grok'] && !triedModels.includes('Grok')) {
          chosenModel = 'Grok';
          chosenApiKey = keyMap['Grok'];
        } else {
          const availableModels = ['Claude', 'GPT-4o', 'Grok', 'Gemini', 'Perplexity'];
          for (const m of availableModels) {
            if (keyMap[m] && !triedModels.includes(m)) {
              chosenModel = m;
              chosenApiKey = keyMap[m];
              break;
            }
          }
        }
      }
    }

    if (!chosenApiKey) {
      return res.status(400).json({
        error: `No valid API key found for ${chosenModel}. Please add the ${chosenModel} API key to the backend .env file to use this model.`,
        code: 'MISSING_API_KEY'
      });
    }

    // 2. Prepare Prompt
    let currentSystemPrompt = SYSTEM_PROMPT.replace(/\[MODEL\]/g, chosenModel)
      .replace(/\[LENGTH\]/g, length || 'Medium')
      .replace(/\[TONE\]/g, tone || 50)
      .replace(/\[CTA_STYLES\]/g, (ctaStyles || []).join(', ') || 'None');

    let instructions = `Raw Input: ${rawInput}\nHook Mode: ${hookMode ? 'ON' : 'OFF'}\nAnalog/Poll Mode: ${analogMode ? 'ON' : 'OFF'}`;
    if (selectedHook) {
      instructions += `\nCRITICAL: You MUST use this exact line as the starting hook: "${selectedHook}"`;
    }

    let responseText = '';

    // Engine executor wrapper to allow fallback retries
    const executeLLM = async (modelName, apiKey) => {
      if (modelName === 'Claude') {
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          system: currentSystemPrompt,
          messages: [{ role: 'user', content: instructions }]
        }, { headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' } });
        return { text: response.data.content[0].text, finalModel: 'Claude' };
      }
      else if (modelName === 'GPT-4o') {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-4o',
          messages: [{ role: 'system', content: currentSystemPrompt }, { role: 'user', content: instructions }]
        }, { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' } });
        return { text: response.data.choices[0].message.content, finalModel: 'GPT-4o' };
      }
      else if (modelName === 'Grok') {
        // Groq API uses openai compatible endpoints
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'system', content: currentSystemPrompt }, { role: 'user', content: instructions }]
        }, { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' } });
        return { text: response.data.choices[0].message.content, finalModel: 'Groq (Llama 3.3 70B)' };
      }
      else if (modelName === 'Gemini') {
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
          system_instruction: { parts: { text: currentSystemPrompt } },
          contents: [{ parts: [{ text: instructions }] }]
        }, { headers: { 'Content-Type': 'application/json' } });
        return { text: response.data.candidates[0].content.parts[0].text, finalModel: 'Gemini 2.5 Flash Lite' };
      }
      else if (modelName === 'Perplexity') {
        const response = await axios.post('https://api.perplexity.ai/chat/completions', {
          model: 'sonar-pro',
          messages: [{ role: 'system', content: currentSystemPrompt }, { role: 'user', content: instructions }]
        }, { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' } });
        return { text: response.data.choices[0].message.content, finalModel: 'Perplexity' };
      }
      throw new Error(`Unsupported model selected: ${modelName}`);
    };

    let actualUsedModelName = chosenModel;

    // 3. Call External LLM API with Fallback Logic
    try {
      const result = await executeLLM(chosenModel, chosenApiKey);
      responseText = result.text;
      actualUsedModelName = result.finalModel;
    } catch (primaryError) {
      console.warn(`Primary model [${chosenModel}] failed:`, primaryError.response?.data || primaryError.message);

      // Determine Fallback between Gemini and Grok
      let fallbackModel = null;
      let fallbackApiKey = null;

      // ONLY fallback if the user didn't explicitly select a model (i.e. modelOverride is null/undefined)
      if (!modelOverride) {
        if (chosenModel === 'Gemini' && keyMap['Grok']) {
          fallbackModel = 'Grok';
          fallbackApiKey = keyMap['Grok'];
        } else if (chosenModel === 'Grok' && keyMap['Gemini']) {
          fallbackModel = 'Gemini';
          fallbackApiKey = keyMap['Gemini'];
        }
      }

      if (fallbackModel && fallbackApiKey) {
        console.log(`Attempting fallback to [${fallbackModel}]...`);
        try {
          // Rebuild system prompt for fallback model to ensure accurate internal model name representation
          currentSystemPrompt = SYSTEM_PROMPT.replace(/\[MODEL\]/g, fallbackModel)
            .replace(/\[LENGTH\]/g, length || 'Medium')
            .replace(/\[TONE\]/g, tone || 50)
            .replace(/\[CTA_STYLES\]/g, (ctaStyles || []).join(', ') || 'None');

          const fallbackResult = await executeLLM(fallbackModel, fallbackApiKey);
          responseText = fallbackResult.text;
          actualUsedModelName = fallbackResult.finalModel;
        } catch (fallbackError) {
          console.error(`Fallback model [${fallbackModel}] also failed:`, fallbackError.response?.data || fallbackError.message);
          throw fallbackError; // Give up and throw
        }
      } else {
        // If they explicitly picked a model, or no fallback is possible, throw a clear error explaining why
        if (primaryError.response?.status === 429) {
          throw new Error(`${chosenModel} Quota Exceeded. You have run out of API tokens for ${chosenModel}. Please try selecting a different LLM from the Models dropdown.`);
        }
        throw primaryError; // No valid fallback, throw original error
      }
    }

    // 4. Parse Response safely
    let parsedResult;
    try {
      parsedResult = stripMarkdownAndParse(responseText);
    } catch (parseError) {
      console.error('Failed to parse LLM Response:', responseText);
      return res.status(500).json({ error: 'LLM returned invalid format (not valid JSON).' });
    }

    // Fix model name to correctly reflect what we actually used
    parsedResult.model_used = actualUsedModelName;

    // 5. Auto-save to posts table
    let postId = null;
    if (!hookMode || selectedHook) {
      const pid = uuidv4();
      try {
        const insertStmt = db.prepare(`
          INSERT INTO posts(id, user_id, title, raw_input, generated_post, model_used, viral_score, viral_breakdown, hashtags, length_type, tone_value, cta_styles, best_time, best_time_reason)
          VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertStmt.run(
          pid, req.user.id, rawInput.substring(0, 50) + '...', rawInput, parsedResult.post || '', actualUsedModelName,
          parsedResult.viral_score || 0, JSON.stringify(parsedResult.viral_breakdown || {}), JSON.stringify(parsedResult.hashtags || []),
          length, tone, JSON.stringify(ctaStyles || []), parsedResult.best_time || '', parsedResult.best_time_reason || ''
        );
        postId = pid;
      } catch (dbErr) {
        console.error('Failed to auto-save post:', dbErr);
      }
    }

    // 6. Return response
    res.json({ success: true, result: parsedResult, postId });

  } catch (error) {
    console.error('Generate Error Details:', error.response?.data || error.message);
    const apiError = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    res.status(500).json({ error: `LLM API Error: ${apiError}` });
  }
});

module.exports = router;
