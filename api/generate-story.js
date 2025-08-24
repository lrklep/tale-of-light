const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/generate-story', async (req, res) => {
    try {
        console.log('📝 Story Generation API called');
        
        const { interviewData, outputType } = req.body;
        
        if (!interviewData || !Array.isArray(interviewData) || interviewData.length === 0) {
            return res.status(400).json({ error: 'Interview data is required' });
        }

        if (!outputType || !['blog', 'flyer'].includes(outputType)) {
            return res.status(400).json({ error: 'Output type must be "blog" or "flyer"' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Gemini API key not configured' });
        }

        // Use Gemini Flash 2.0 with optimized configuration
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            },
        });
        
        const storyPrompt = `
        You are Valdris, the mystical chronicler. Based on the community interview data below, create a compelling ${outputType} that documents this community's needs and calls for action.

        Interview Data: ${JSON.stringify(interviewData, null, 2)}

        ${outputType === 'blog' ? `
        CREATE A BLOG POST with the following structure:
        - Engaging headline
        - Opening hook that draws readers in
        - Clear problem statement with community impact details
        - Specific facts and statistics mentioned in the interview
        - Proposed solutions and opportunities for involvement
        - Strong call-to-action for readers
        - Compelling conclusion
        
        Make it 400-600 words, professional yet engaging.
        ` : `
        CREATE A FLYER with the following structure:
        - Eye-catching headline
        - Brief problem summary (2-3 sentences)
        - Key impact statistics
        - Clear action items for community members
        - Contact information placeholder
        - Urgency-driven call-to-action
        
        Make it concise (200-300 words), formatted for easy reading and posting.
        `}

        Write in a professional, engaging tone that motivates action while maintaining factual accuracy.
        `;

        console.log(`🎯 Generating ${outputType} with Gemini...`);
        const result = await model.generateContent(storyPrompt);
        const response = await result.response;
        const text = response.text();

        console.log('✅ Story generated successfully');
        
        res.json({ 
            story: text,
            type: outputType,
            generatedAt: new Date().toISOString(),
            status: 'success'
        });

    } catch (error) {
        console.error('❌ Story Generation error:', error);
        
        let errorMessage = 'Failed to forge the chronicle. The mystical energies are unstable.';
        
        if (error.message.includes('API_KEY')) {
            errorMessage = 'The ancient scrolls (API key) are missing for story generation.';
        } else if (error.message.includes('quota')) {
            errorMessage = 'The chronicle forge has exhausted its power for today.';
        }

        res.status(500).json({ 
            error: errorMessage,
            status: 'error'
        });
    }
});

module.exports = router;
