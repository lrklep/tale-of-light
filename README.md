# Community Impact Chronicles - Dark Fantasy Chatbot 🏰

A unique dark fantasy-themed chatbot application that helps document and generate compelling narratives for community impact stories. Built with Node.js, Express, and Google's Gemini AI.

## 🌟 Features

- **Interactive Chat Interface**: Engage with Valdris, the mystical chronicler
- **AI-Powered Conversations**: Powered by Google's Gemini AI
- **Story Generation**: Create blog posts and flyers for community impact
- **Dark Fantasy Theme**: Unique medieval fantasy styling
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js (>= 16.0.0)
- Docker (optional, for containerized deployment)
- Google Gemini API Key

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/community-impact-chatbot.git
   cd community-impact-chatbot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   NODE_ENV=development
   PORT=3000
   MAX_MESSAGE_LENGTH=1000
   MAX_CONVERSATION_HISTORY=10
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Visit `http://localhost:3000` in your browser

### 🐳 Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t community-impact-chatbot .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 \
     -e GEMINI_API_KEY=your_api_key \
     -e NODE_ENV=development \
     -e PORT=3000 \
     community-impact-chatbot
   ```

## 🚀 Deployment

### Deploying to Render

1. Fork this repository to your GitHub account

2. Create a new Web Service on Render:
   - Connect your GitHub repository
   - Select "Docker" as the environment
   - Choose the Free plan (or any other plan)
   - Set environment variables:
     - `GEMINI_API_KEY`: Your Google Gemini API key
     - `NODE_ENV`: production

3. Deploy! Render will automatically build and deploy your application

## 📁 Project Structure

```
community-impact-chatbot/
├── api/
│   ├── chat.js          # Chat endpoint handler
│   └── generate-story.js # Story generation endpoint
├── public/
│   ├── index.html
│   ├── scripts/
│   │   └── chatbot.js   # Frontend JavaScript
│   └── styles/
│       └── dark-fantasy.css
├── Dockerfile
├── server.js            # Express server
└── package.json
```

## 🛠 API Endpoints

### Chat API
- **POST** `/api/chat`
  ```json
  {
    "message": "Your message here",
    "conversationHistory": []
  }
  ```

### Story Generation API
- **POST** `/api/generate-story`
  ```json
  {
    "interviewData": ["array", "of", "responses"],
    "outputType": "blog" // or "flyer"
  }
  ```

## 🎨 Features & Functionality

- **Valdris, The Chronicler**: AI-powered chatbot with a dark fantasy persona
- **Community Impact Stories**: Generate compelling narratives about community needs
- **Dual Output Formats**: 
  - Blog posts for detailed stories
  - Flyers for quick distribution
- **Real-time Chat**: Instant responses with typing animations
- **Responsive Design**: Works on all device sizes
- **Error Handling**: Graceful error management with user-friendly messages
- **Environment Management**: Support for development and production environments

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Powered by Google's Gemini AI
- Express.js for the backend framework
- Dark fantasy theme inspiration from medieval chronicles
- Community impact focus for meaningful storytelling
