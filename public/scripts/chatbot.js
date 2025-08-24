class CommunityImpactChatbot {
    constructor() {
        this.messagesContainer = document.getElementById('messagesContainer');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendButton');
        this.generateBlogBtn = document.getElementById('generateBlog');
        this.generateFlyerBtn = document.getElementById('generateFlyer');
        this.storyOutput = document.getElementById('storyOutput');
        
        this.conversationHistory = [];
        this.interviewData = [];
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        this.generateBlogBtn.addEventListener('click', () => this.generateStory('blog'));
        this.generateFlyerBtn.addEventListener('click', () => this.generateStory('flyer'));
    }
    
    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        this.addMessage(message, 'user');
        this.chatInput.value = '';
        
        this.conversationHistory.push({ role: 'user', content: message });
        this.interviewData.push(message);
        
        const loadingId = this.addLoadingMessage();
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversationHistory: this.conversationHistory
                })
            });
            
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            
            this.removeMessage(loadingId);
            this.addMessage(data.response, 'bot');
            this.conversationHistory.push({ role: 'assistant', content: data.response });
            
        } catch (error) {
            console.error('Error:', error);
            this.removeMessage(loadingId);
            this.addMessage('The mystical energies are disrupted. Please try again, traveler.', 'bot');
        }
    }
    
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.innerHTML = `<p>${content}</p>`;
        
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        
        return messageDiv;
    }
    
    addLoadingMessage() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot';
        loadingDiv.innerHTML = '<div class="loading"></div>';
        
        this.messagesContainer.appendChild(loadingDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        
        return loadingDiv;
    }
    
    removeMessage(messageElement) {
        if (messageElement && messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement);
        }
    }
    
    async generateStory(type) {
        if (this.interviewData.length === 0) {
            alert('Please complete the interview first by chatting with Valdris.');
            return;
        }
        
        const button = type === 'blog' ? this.generateBlogBtn : this.generateFlyerBtn;
        const originalText = button.textContent;
        button.textContent = 'Forging Chronicle...';
        button.disabled = true;
        
        try {
            const response = await fetch('/api/generate-story', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    interviewData: this.interviewData,
                    outputType: type
                })
            });
            
            if (!response.ok) throw new Error('Story generation failed');
            
            const data = await response.json();
            
            this.storyOutput.textContent = data.story;
            this.storyOutput.style.display = 'block';
            this.storyOutput.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Error generating story:', error);
            alert('Failed to generate chronicle. The mystical energies are unstable.');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CommunityImpactChatbot();
});
