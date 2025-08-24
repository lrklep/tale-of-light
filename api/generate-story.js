const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { interviewData, outputType } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const storyPrompt = `
    Based on the following community interview data, create a compelling ${outputType} (blog post or flyer):

    Interview Data: ${JSON.stringify(interviewData)}

    Requirements:
    - Extract key motivations, facts, and clear calls to action
    - Create an engaging narrative that highlights the community need
    - Include specific details and impact metrics if provided
    - End with actionable next steps for readers
    - Format appropriately for ${outputType}
    - Maintain a professional yet engaging tone

    Generate the content now:
    `;

    const result = await model.generateContent(storyPrompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ 
      story: text,
      type: outputType,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Story Generation Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate impact story' 
    });
  }
}
