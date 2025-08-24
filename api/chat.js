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
    const { message, conversationHistory } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const systemPrompt = `
    You are Valdris, a wise chronicler from a mystical realm who has been tasked with documenting the struggles and triumphs of communities. Your role is to conduct interviews about local community needs with the gravitas of a dark fantasy sage.

    INTERVIEW GUIDELINES:
    1. Ask probing questions about community challenges, needs, and potential solutions
    2. Extract key motivations, specific facts, and calls to action
    3. Maintain an atmospheric, slightly mystical tone while being respectful and professional
    4. Guide the conversation to gather: problem identification, community impact, proposed solutions, and stakeholder involvement
    5. After gathering sufficient information, offer to generate their "impact chronicle" (story/flyer)

    Current conversation context: ${conversationHistory || 'Beginning of conversation'}
    User message: ${message}
    
    Respond as Valdris would, maintaining the dark fantasy atmosphere while conducting a meaningful interview.
    `;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ 
      response: text,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      error: 'The mystical energies are disrupted. Please try again.' 
    });
  }
}
