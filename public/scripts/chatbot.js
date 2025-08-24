/**
 * Dark Fantasy Community Impact Chatbot
 * Enhanced with full UI interactions, error handling, and animations
 */

class CommunityImpactChatbot {
    constructor() {
        // DOM elements
        this.messagesContainer = document.getElementById('messagesContainer');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendButton');
        this.generateBlogBtn = document.getElementById('generateBlog');
        this.generateFlyerBtn = document.getElementById('generateFlyer');
        this.storyOutput = document.getElementById('storyOutput');
        this.outputTitle = document.getElementById('outputTitle');
        this.outputContent = document.getElementById('outputContent');
        this.copyButton = document.getElementById('copyButton');
        this.closeOutput = document.getElementById('closeOutput');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.characterCount = document.getElementById('characterCount');
        
        // State management
        this.conversationHistory = [];
        this.interviewData = [];
        this.isProcessing = false;
        this.messageCount = 0;
        
        // Initialize
        this.initializeEventListeners();
        this.initializeTextarea();
        this.updateCharacterCount();
        this.addWelcomeMessage();
        
        console.log('🏰 Dark Fantasy Chatbot initialized');
    }
    
    initializeEventListeners() {
        // Chat input events
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.chatInput.addEventListener('input', () => this.updateCharacterCount());
        
        // Story generation events
        this.generateBlogBtn.addEventListener('click', () => this.generateStory('blog'));
        this.generateFlyerBtn.addEventListener('click', () => this.generateStory('flyer'));
        
        // Output actions
        this.copyButton.addEventListener('click', () => this.copyToClipboard());
        this.closeOutput.addEventListener('click', () => this.closeStoryOutput());
        
        // Window events
        window.addEventListener('beforeunload', (e) => {
            if (this.isProcessing) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }
    
    initializeTextarea() {
        // Auto-resize textarea
        this.chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }
    
    addWelcomeMessage() {
        // Add initial typing effect to the welcome message
        const welcomeMessage = this.messagesContainer.querySelector('.message.bot .message-content');
        if (welcomeMessage) {
            const text = welcomeMessage.textContent;
            welcomeMessage.innerHTML = '';
            this.typeMessage(welcomeMessage, text, 30);
        }
    }
    
    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }
    
    updateCharacterCount() {
        const count = this.chatInput.value.length;
        const maxCount = this.chatInput.maxLength;
        this.characterCount.textContent = `${count}/${maxCount}`;
        
        // Change color based on character count
        if (count > maxCount * 0.9) {
            this.characterCount.style.color = 'var(--accent-red)';
        } else if (count > maxCount * 0.7) {
            this.characterCount.style.color = 'var(--accent-gold)';
        } else {
            this.characterCount.style.color = 'var(--text-muted)';
        }
    }
    
    updateStatus(text, type = 'default') {
        const statusText = this.statusIndicator.querySelector('.status-text');
        const statusDot = this.statusIndicator.querySelector('.status-dot');
        
        statusText.textContent = text;
        
        // Update status dot color based on type
        switch(type) {
            case 'processing':
                statusDot.style.background = 'var(--accent-gold)';
                break;
            case 'error':
                statusDot.style.background = 'var(--accent-red)';
                break;
            case 'success':
                statusDot.style.background = 'var(--accent-green)';
                break;
            default:
                statusDot.style.background = 'var(--accent-green)';
        }
    }
    
    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isProcessing) return;
        
        this.isProcessing = true;
        this.updateStatus('Valdris is contemplating your words...', 'processing');
        
        // Add user message to UI
        this.addMessage(message, 'user');
        this.chatInput.value = '';
        this.updateCharacterCount();
        this.chatInput.style.height = 'auto';
        
        // Store in conversation history
        this.conversationHistory.push({ role: 'user', content: message });
        this.interviewData.push(message);
        
        // Disable send button
        this.setSendButtonState(false);
        
        // Show loading message
        const loadingMessageId = this.addLoadingMessage();
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversationHistory: this.conversationHistory.slice(-6) // Keep last 6 messages for context
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Remove loading message
            this.removeMessage(loadingMessageId);
            
            if (data.status === 'success') {
                // Add bot response with typing effect
                const botMessageElement = this.addMessage('', 'bot');
                const contentElement = botMessageElement.querySelector('.message-content p');
                await this.typeMessage(contentElement, data.response, 25);
                
                this.conversationHistory.push({ role: 'assistant', content: data.response });
                this.updateStatus('Valdris awaits your next words', 'success');
                
                // Enable story generation if enough conversation
                this.updateStoryGenerationState();
                
            } else {
                throw new Error(data.error || 'Unknown error occurred');
            }
            
        } catch (error) {
            console.error('❌ Chat error:', error);
            this.removeMessage(loadingMessageId);
            
            let errorMessage = 'The mystical energies are disrupted. Please try again, traveler.';
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'The connection to Valdris\'s realm has been severed. Please check your connection and try again.';
            }
            
            this.addMessage(errorMessage, 'bot', 'error');
            this.updateStatus('Connection to the mystical realm lost', 'error');
        } finally {
            this.isProcessing = false;
            this.setSendButtonState(true);
            this.chatInput.focus();
        }
    }
    
    addMessage(content, sender, type = 'normal') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.setAttribute('data-message-id', ++this.messageCount);
        
        const avatar = sender === 'bot' ? '⚡' : '👤';
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <p>${content}</p>
            </div>
            <div class="message-time">${time}</div>
        `;
        
        if (type === 'error') {
            messageDiv.classList.add('error');
            messageDiv.querySelector('.message-content').style.background = 'rgba(220, 38, 38, 0.2)';
            messageDiv.querySelector('.message-content').style.borderColor = 'var(--accent-red)';
        }
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        return messageDiv;
    }
    
    addLoadingMessage() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot loading-message';
        loadingDiv.setAttribute('data-message-id', ++this.messageCount);
        
        loadingDiv.innerHTML = `
            <div class="message-avatar">⚡</div>
            <div class="message-content">
                <div class="loading">
                    <span class="loading-text">Valdris is weaving his response...</span>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(loadingDiv);
        this.scrollToBottom();
        
        return loadingDiv;
    }
    
    removeMessage(messageElement) {
        if (messageElement && messageElement.parentNode) {
            messageElement.style.opacity = '0';
            messageElement.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 300);
        }
    }
    
    async typeMessage(element, text, speed = 30) {
        element.innerHTML = '';
        let i = 0;
        
        return new Promise((resolve) => {
            const typeWriter = () => {
                if (i < text.length) {
                    element.innerHTML += text.charAt(i);
                    i++;
                    this.scrollToBottom();
                    setTimeout(typeWriter, speed);
                } else {
                    resolve();
                }
            };
            typeWriter();
        });
    }
    
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    setSendButtonState(enabled) {
        this.sendButton.disabled = !enabled;
        if (enabled) {
            this.sendButton.innerHTML = `
                <span class="button-icon">⚡</span>
                <span class="button-text">Send</span>
            `;
        } else {
            this.sendButton.innerHTML = `
                <div class="loading"></div>
            `;
        }
    }
    
    updateStoryGenerationState() {
        const hasEnoughContent = this.interviewData.length >= 2;
        
        this.generateBlogBtn.disabled = !hasEnoughContent;
        this.generateFlyerBtn.disabled = !hasEnoughContent;
        
        if (hasEnoughContent) {
            this.generateBlogBtn.style.opacity = '1';
            this.generateFlyerBtn.style.opacity = '1';
        } else {
            this.generateBlogBtn.style.opacity = '0.6';
            this.generateFlyerBtn.style.opacity = '0.6';
        }
    }
    
    async generateStory(type) {
        if (this.interviewData.length === 0) {
            this.showNotification('Please complete the interview first by chatting with Valdris.', 'warning');
            return;
        }
        
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        const button = type === 'blog' ? this.generateBlogBtn : this.generateFlyerBtn;
        const originalHTML = button.innerHTML;
        
        // Update button state
        button.disabled = true;
        button.innerHTML = `
            <div class="loading"></div>
            <span class="button-content">
                <span class="button-title">Forging ${type === 'blog' ? 'Blog' : 'Flyer'}...</span>
                <span class="button-subtitle">Valdris is weaving your chronicle</span>
            </span>
        `;
        
        this.updateStatus(`Forging your ${type} chronicle...`, 'processing');
        
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
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'success') {
                this.displayStoryOutput(data.story, type);
                this.updateStatus('Chronicle successfully forged!', 'success');
                this.showNotification(`Your ${type} chronicle has been created!`, 'success');
            } else {
                throw new Error(data.error || 'Failed to generate story');
            }
            
        } catch (error) {
            console.error('❌ Story generation error:', error);
            
            let errorMessage = 'Failed to forge the chronicle. The mystical energies are unstable.';
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Connection to the chronicle forge has been lost. Please try again.';
            }
            
            this.showNotification(errorMessage, 'error');
            this.updateStatus('Chronicle forge disrupted', 'error');
        } finally {
            this.isProcessing = false;
            button.disabled = false;
            button.innerHTML = originalHTML;
        }
    }
    
    displayStoryOutput(story, type) {
        this.outputTitle.textContent = `Your ${type.charAt(0).toUpperCase() + type.slice(1)} Chronicle`;
        this.outputContent.textContent = story;
        this.storyOutput.style.display = 'block';
        this.storyOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Add fade-in animation
        this.storyOutput.style.opacity = '0';
        this.storyOutput.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            this.storyOutput.style.transition = 'all 0.5s ease-out';
            this.storyOutput.style.opacity = '1';
            this.storyOutput.style.transform = 'translateY(0)';
        }, 100);
    }
    
    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.outputContent.textContent);
            
            // Visual feedback
            const originalText = this.copyButton.innerHTML;
            this.copyButton.innerHTML = '<span>✓</span>';
            this.copyButton.style.background = 'var(--accent-green)';
            
            setTimeout(() => {
                this.copyButton.innerHTML = originalText;
                this.copyButton.style.background = '';
            }, 2000);
            
            this.showNotification('Chronicle copied to clipboard!', 'success');
            
        } catch (error) {
            console.error('Failed to copy:', error);
            this.showNotification('Failed to copy chronicle', 'error');
        }
    }
    
    closeStoryOutput() {
        this.storyOutput.style.opacity = '0';
        this.storyOutput.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            this.storyOutput.style.display = 'none';
            this.storyOutput.style.opacity = '';
            this.storyOutput.style.transform = '';
            this.storyOutput.style.transition = '';
        }, 300);
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '10px',
            color: 'white',
            fontFamily: "'Cinzel', serif",
            fontWeight: '600',
            zIndex: '9999',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease-out',
            maxWidth: '300px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
        });
        
        // Set background color based on type
        switch(type) {
            case 'success':
                notification.style.background = 'linear-gradient(135deg, var(--accent-green), #10b981)';
                break;
            case 'error':
                notification.style.background = 'linear-gradient(135deg, var(--accent-red), #ef4444)';
                break;
            case 'warning':
                notification.style.background = 'linear-gradient(135deg, var(--accent-gold), #f59e0b)';
                notification.style.color = 'var(--primary-bg)';
                break;
            default:
                notification.style.background = 'linear-gradient(135deg, var(--accent-purple), var(--accent-purple-light))';
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        new CommunityImpactChatbot();
        console.log('🎭 Welcome to Valdris\'s mystical chamber!');
    } catch (error) {
        console.error('❌ Failed to initialize chatbot:', error);
        
        // Show fallback message
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 50px; color: var(--accent-red);">
                    <h2>🏰 The mystical chamber is temporarily unavailable</h2>
                    <p>Please refresh the page or try again later.</p>
                </div>
            `;
        }
    }
});

// Add some mystical console messages for fun
console.log('%c🏰 Dark Fantasy Community Impact Chatbot', 'color: #d4af37; font-size: 16px; font-weight: bold;');
console.log('%c⚡ Valdris\'s mystical powers are now active', 'color: #6b46c1; font-style: italic;');
