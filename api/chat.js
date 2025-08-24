const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/chat', async (req, res) => {
    try {
        console.log('📞 Chat API called');
        
        const { message, conversationHistory } = req.body;
        
        if (!message) {
            return res.status(400).json({ 
                error: 'Message is required',
                status: 'error'
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ 
                error: 'Gemini API key not configured',
                status: 'error'
            });
        }

        // Use Gemini Flash 2.0 with optimized configuration
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
        });
        
        const systemPrompt = `
        You are Valdris, a wise chronicler from a mystical realm who has been tasked with documenting the struggles and triumphs of communities. Your role is to conduct interviews about local community needs with the gravitas of a dark fantasy sage.

        INTERVIEW GUIDELINES:
        1. Ask probing questions about community challenges, needs, and potential solutions
        2. Extract key motivations, specific facts, and calls to action
        3. Maintain an atmospheric, slightly mystical tone while being respectful and professional
        4. Guide the conversation to gather: problem identification, community impact, proposed solutions, and stakeholder involvement
        5. After gathering sufficient information, offer to generate their "impact chronicle" (story/flyer)
        6. Keep responses under 200 words
        7. Use mystical language but stay professional and helpful

        Previous conversation: ${conversationHistory ? JSON.stringify(conversationHistory) : 'None'}
        
        User's latest message: "${message}"
        
        Respond as Valdris would, maintaining the dark fantasy atmosphere while conducting a meaningful community interview.
        `;

        console.log('🤖 Generating response with Gemini Flash 2.0...');
        
        try {
            const result = await model.generateContent(systemPrompt);
            const response = await result.response;
            const text = response.text();
            console.log('✅ Response generated successfully');
            
            return res.json({ 
                response: text,
                timestamp: new Date().toISOString(),
                status: 'success'
            });
        } catch (aiError) {
            console.error('Gemini API Error:', aiError);
            throw new Error(`Gemini API Error: ${aiError.message}`);
        }

    } catch (error) {
        console.error('❌ Chat API error:', error);
        
        let errorMessage = 'The mystical energies are disrupted. Please try again, traveler.';
        
        if (error.message.includes('API_KEY')) {
            errorMessage = 'The ancient scrolls (API key) are missing. Please configure them properly.';
        } else if (error.message.includes('quota')) {
            errorMessage = 'The mystical energies have been exhausted for today. Please try again later.';
        } else if (error.message.includes('model not found')) {
            errorMessage = 'The chosen mystical pathway (model) is not available. Please check your configuration.';
        }

        return res.status(500).json({ 
            error: errorMessage,
            status: 'error'
        });
    }
});

module.exports = router;
