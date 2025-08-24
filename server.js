const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local or .env
const result = dotenv.config({ path: path.resolve(process.cwd(), '.env.local') }) 
if (result.error) {
    dotenv.config(); // fallback to .env
}

// Verify environment variables are loaded
console.log('Environment Check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- API Key Status:', process.env.GEMINI_API_KEY ? 'Set' : 'Missing');
console.log('- API Key:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'Not Found');
console.log('- Port:', process.env.PORT || 3000);

// Verify environment variables are loaded
console.log('Environment Check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- API Key Status:', process.env.GEMINI_API_KEY ? 'Set' : 'Missing');
console.log('- Port:', process.env.PORT || 3000);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Import API routes
const chatRoutes = require('./api/chat');
const storyRoutes = require('./api/generate-story');

// API routes
app.use('/api', chatRoutes);
app.use('/api', storyRoutes);

// Serve frontend - Fixed wildcard route (Express v5 compatible)
app.get('/*path', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🏰 Dark Fantasy Chatbot Server running at http://localhost:${PORT}`);
    console.log(`📡 Chat API: http://localhost:${PORT}/api/chat`);
    console.log(`📝 Story API: http://localhost:${PORT}/api/generate-story`);
    console.log(`🎨 Frontend: http://localhost:${PORT}`);
});
