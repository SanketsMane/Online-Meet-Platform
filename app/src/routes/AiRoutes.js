'use strict';

const express = require('express');
const router = express.Router();
const config = require('../config');
const OpenAI = require('openai');
const Logger = require('../Logger');
const settingsService = require('../services/SettingsService');
const log = new Logger('AiRoutes');

/**
 * Helper to get OpenAI instance with latest settings
 */
async function getOpenAI() {
    const enabled = await settingsService.get('CHATGPT_ENABLED');
    const apiKey = await settingsService.get('CHATGPT_API_KEY');
    const basePath = await settingsService.get('CHATGPT_BASE_PATH') || config.integrations?.chatGPT?.basePath || 'https://api.openai.com/v1/';

    if (!enabled || !apiKey) return null;

    return new OpenAI({
        apiKey: apiKey,
        baseURL: basePath,
    });
}

/**
 * POST /api/v1/ai/summarize
 * Generates a meeting summary from transcripts
 */
router.post('/summarize', async (req, res) => {
    try {
        const { roomId, transcripts } = req.body;
        const openai = await getOpenAI();

        if (!openai) {
            return res.status(503).json({
                success: false,
                message: 'AI Summarization is not configured or enabled on this server.',
            });
        }

        if (!transcripts || !Array.isArray(transcripts) || transcripts.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No transcripts provided for summarization.',
            });
        }

        // Prepare the transcript text
        const transcriptText = transcripts
            .map((t) => `[${t.time}] ${t.name}: ${t.caption}`)
            .join('\n');

        log.debug(`Summarizing meeting for room: ${roomId}`, { transcriptLength: transcriptText.length });

        const prompt = `
            Please provide a professional summary of the following meeting transcript.
            Format the output with the following sections:
            1. **Meeting Overview**: A brief summary of the main topic.
            2. **Key Discussion Points**: Bullet points of the most important things discussed.
            3. **Action Items**: A list of tasks or next steps identified.

            Transcript:
            ${transcriptText}
        `;

        const model = await settingsService.get('CHATGPT_MODEL') || 'gpt-3.5-turbo';
        const max_tokens = await settingsService.get('CHATGPT_MAX_TOKENS') || 1024;
        const temperature = await settingsService.get('CHATGPT_TEMPERATURE') || 0.7;

        const completion = await openai.chat.completions.create({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: max_tokens,
            temperature: temperature,
        });

        const summary = completion.choices[0].message.content.trim();

        return res.json({
            success: true,
            summary: summary,
        });
    } catch (error) {
        log.error('Summarization Error', error);
        return res.status(500).json({
            success: false,
            message: 'Error generating meeting summary: ' + error.message,
        });
    }
});

module.exports = router;

module.exports = router;
