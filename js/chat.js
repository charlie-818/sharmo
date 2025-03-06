/**
 * Chat functionality for sharmo
 * Handles all chat-related operations
 * Integrates with Perplexity API for AI responses
 * Environment variables are loaded from .env file
 */
import { CONFIG } from './config.js';

console.log('Chat script loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing chat...');
    
    // Initialize chat variables
    const chatContainer = document.querySelector('.chat-container');
    const openChatBtn = document.getElementById('openChat');
    const closeChatBtn = document.getElementById('closeChat');
    const sendMessageBtn = document.getElementById('sendMessage');
    const userInput = document.getElementById('userInput');
    
    console.log('Chat elements found:', {
        chatContainer: !!chatContainer,
        openChatBtn: !!openChatBtn,
        closeChatBtn: !!closeChatBtn,
        sendMessageBtn: !!sendMessageBtn,
        userInput: !!userInput
    });
    
    if (!chatContainer || !openChatBtn) {
        console.error('Critical chat elements not found, aborting initialization');
        return;
    }
    
    // Function to hide chat button
    function hideChatButton() {
        // Use visibility hidden instead of changing position
        openChatBtn.style.visibility = 'hidden';
        openChatBtn.style.opacity = '0';
        openChatBtn.classList.add('hide');
    }
    
    // Function to show chat button with animation
    function showChatButton() {
        // Keep the position fixed but restore visibility
        openChatBtn.style.visibility = 'visible';
        openChatBtn.style.opacity = '1';
        openChatBtn.classList.remove('hide');
        // Ensure it stays in fixed position
        openChatBtn.style.position = 'fixed';
        openChatBtn.style.bottom = '30px';
        openChatBtn.style.right = '30px';
        
        // Add the float-enter class for animation
        openChatBtn.classList.add('float-enter');
        
        // Remove the animation class after it completes
        setTimeout(() => {
            openChatBtn.classList.remove('float-enter');
        }, 500);
    }
    
    // Make sure the chat button is visible initially, but only if chat is not already open
    if (chatContainer.style.display === 'flex' || chatContainer.classList.contains('active')) {
        hideChatButton();
    } else {
        // Make sure chat window is hidden
        chatContainer.style.display = 'none';
        chatContainer.classList.remove('active');
        
        // Show chat button
        openChatBtn.style.display = 'flex';
        
        // Add a slight delay before floating in the chat button on page load
        setTimeout(() => {
            openChatBtn.classList.add('float-enter');
            // Remove the animation class after it completes
            setTimeout(() => {
                openChatBtn.classList.remove('float-enter');
                // Add attention-grabbing pulse after the float-in animation completes
                setTimeout(() => {
                    openChatBtn.classList.add('attention');
                    // Remove the attention class after animations complete
                    setTimeout(() => {
                        openChatBtn.classList.remove('attention');
                    }, 6000); // 3 pulses at 2 seconds each
                }, 500);
            }, 500);
        }, 1000);
    }
    
    // Initialize or get message count from localStorage
    let messageCount = parseInt(localStorage.getItem('chatMessageCount') || '0');
    const MAX_MESSAGES = 5;
    
    // Initialize session ID if not exists
    let sessionId = localStorage.getItem('chatSessionId');
    if (!sessionId) {
        sessionId = Date.now().toString();
        localStorage.setItem('chatSessionId', sessionId);
        localStorage.setItem('chatMessageCount', '0');
        messageCount = 0;
    }

    // Check if session is older than 24 hours
    const sessionAge = Date.now() - parseInt(sessionId);
    if (sessionAge > 24 * 60 * 60 * 1000) { // 24 hours in milliseconds
        // Reset session
        sessionId = Date.now().toString();
        localStorage.setItem('chatSessionId', sessionId);
        localStorage.setItem('chatMessageCount', '0');
        messageCount = 0;
    }

    // Add this near the top of your DOMContentLoaded event listener
    let welcomeMessageShown = localStorage.getItem('welcomeMessageShown') === 'true';

    // Update UI to reflect current message count
    updateRemainingMessages();
    
    // Disable input if max messages reached
    if (messageCount >= MAX_MESSAGES) {
        disableChat();
    }

    // Update chat UI with company branding
    updateChatUIWithBranding();

    // Open chat event listener
    openChatBtn.addEventListener('click', async () => {
        try {
            // Clear previous messages when opening chat
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.innerHTML = '';
            
            // Completely hide the chat button immediately
            hideChatButton();
            
            // Make container visible but keep it hidden with CSS transform
            chatContainer.style.display = 'flex';
            
            // Trigger the animation after a small delay to ensure display:flex is applied
            setTimeout(() => {
                chatContainer.classList.add('active');
            }, 10);
            
            // Always show welcome message when chat is opened
            console.log('Showing welcome message...');
            await showWelcomeMessage();
            console.log('Welcome message complete');
            
            // If max messages reached, show the limit message after welcome
            if (messageCount >= MAX_MESSAGES) {
                showMaxMessagesAlert();
            }
        } catch (error) {
            console.error('Error in chat open:', error);
        }
    });

    closeChatBtn.addEventListener('click', () => {
        // Start the closing animation
        chatContainer.classList.remove('active');
        
        // Wait for animation to complete before hiding completely
        setTimeout(() => {
        chatContainer.style.display = 'none';
            
            // Make chat button visible again with animation
            showChatButton();
        }, 400); // Match the transition duration in CSS
    });

    // Chat functionality
    if (sendMessageBtn && userInput) {
        // Update send button with a clearer icon
        sendMessageBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        
        // Add event listeners
        sendMessageBtn.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // Add scroll detection for automatic chat popup
    const hero = document.querySelector('.hero');
    if (hero) {
        let chatShown = false;

        window.addEventListener('scroll', () => {
            if (!chatShown) {
                const heroBottom = hero.offsetTop + hero.offsetHeight;
                const scrollPosition = window.scrollY + window.innerHeight;
                
                if (scrollPosition > heroBottom) {
                    // Show chat window
                    setTimeout(() => {
                        if (!chatShown && chatContainer.style.display !== 'flex') {
                            openChatBtn.click();
                    chatShown = true;
                        }
                    }, 1000);
                }
            }
        });
    }

    // Track shift key for new line in textarea
    let shiftPressed = false;
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Shift') shiftPressed = true;
    });

    userInput.addEventListener('keyup', (e) => {
        if (e.key === 'Shift') shiftPressed = false;
    });

    // Update chat UI with company branding
    function updateChatUIWithBranding() {
        // Update chat header with logo and better styling
        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader) {
            chatHeader.innerHTML = `
                <div class="chat-title">
                    <div class="chat-logo">
                        <img src="images/logo.png" alt="Sharmo logo" width="24" height="24">
                    </div>
                    <h3>Sharmo Assistant</h3>
                </div>
                <div class="chat-actions">
                    <button id="closeChat" aria-label="Close chat">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 6L18 18" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            `;
            
            // Re-attach event listener for close button
            const newCloseBtn = document.getElementById('closeChat');
            if (newCloseBtn) {
                newCloseBtn.addEventListener('click', () => {
                    // Start the closing animation
                    chatContainer.classList.remove('active');
                    
                    // Wait for animation to complete before hiding completely
                    setTimeout(() => {
                        chatContainer.style.display = 'none';
                        
                        // Make chat button visible again with animation
                        showChatButton();
                    }, 400); // Match the transition duration in CSS
                });
            }
        }
        
        // Update chat button style - only show icon, no text
        const openBtn = document.getElementById('openChat');
        if (openBtn) {
            openBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            openBtn.classList.add('icon-only');
        }
    }

    // Display welcome message in the chat
    async function showWelcomeMessage() {
        setTimeout(async () => {
            const welcomeDiv = document.createElement('div');
            welcomeDiv.classList.add('message', 'ai-message');
            
            // Add logo to welcome message
            const welcomeLogo = document.createElement('div');
            welcomeLogo.className = 'ai-logo';
            welcomeLogo.innerHTML = `<img src="images/logo.png" alt="Sharmo logo" width="20" height="20">`;
            welcomeDiv.appendChild(welcomeLogo);
            
            // Add message content container
            const welcomeContent = document.createElement('div');
            welcomeContent.className = 'message-content';
            welcomeDiv.appendChild(welcomeContent);
            
            document.getElementById('chatMessages').appendChild(welcomeDiv);
            
            // Welcome message text
            const welcomeText = "Welcome to Sharmo Chat! How can I assist you with real estate tokenization today?";
            
            // Stream the welcome message one character at a time
            let displayedText = '';
            for (const char of welcomeText) {
                await new Promise(resolve => setTimeout(resolve, 20)); // Medium typing speed
                displayedText += char;
                welcomeContent.innerHTML = displayedText;
                const chatMessages = document.getElementById('chatMessages');
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }, 500); // Short delay before showing welcome message
    }

    // Keep a history of chat messages for context
    let chatHistory = [];

    // API status tracking removed for production
    
    // Process the chat message and send it to the API
    async function sendMessage() {
        if (messageCount >= MAX_MESSAGES) {
            showMaxMessagesAlert();
            return;
        }

        const message = userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessageToChat(message, 'user');
        userInput.value = '';

        // Add to chat history
        chatHistory.push({ role: "user", content: message });

        // Scroll to bottom of chat
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Add loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'ai-message', 'loading');
        
        // Add logo to loading message
        const logoSpan = document.createElement('div');
        logoSpan.className = 'ai-logo';
        logoSpan.innerHTML = `<img src="images/logo.png" alt="Sharmo logo" width="20" height="20">`;
        loadingDiv.appendChild(logoSpan);
        
        // Add loading animation
        const loadingContent = document.createElement('div');
        loadingContent.className = 'message-content';
        loadingContent.innerHTML = `
            <div class="typing-indicator">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
        `;
        loadingDiv.appendChild(loadingContent);
        
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        try {
            // Log the request (without sensitive data)
            console.log('Sending message to API...');
            
            // IMPORTANT: This endpoint should be implemented on your server
            // The server should:
            // 1. Load the API key from environment variables
            // 2. Make the actual call to Perplexity API
            // 3. Return the response
            // This prevents exposing your API key in client-side code
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    history: chatHistory.slice(-5) // Send only the last 5 messages for context
                })
            });
            
            if (!response.ok) {
                throw new Error(`API response: ${response.status}`);
            }
            
            // Create a message div for the streaming response
            chatMessages.removeChild(loadingDiv);
            
            // Create the AI message container
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', 'ai-message');
            
            // Add logo to AI message
            const aiLogoSpan = document.createElement('div');
            aiLogoSpan.className = 'ai-logo';
            aiLogoSpan.innerHTML = `<img src="images/logo.png" alt="Sharmo logo" width="20" height="20">`;
            messageDiv.appendChild(aiLogoSpan);
            
            // Add content container
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            messageDiv.appendChild(contentDiv);
            
            // Add to chat window
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // For streaming response
            let fullResponse = '';
            
            // Check if the response is a stream
            if (response.headers.get('Content-Type')?.includes('text/event-stream')) {
                // Process the stream
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                
                // Function to process stream chunks
                async function processStream() {
                    while (true) {
                        const { done, value } = await reader.read();
                        
                        if (done) {
                            break;
                        }
                        
                        // Decode the chunk
                        const chunk = decoder.decode(value);
                        
                        // Process the SSE chunk
                        const lines = chunk.split('\n');
                        for (const line of lines) {
                            if (line.startsWith('data:')) {
                                try {
                                    const data = JSON.parse(line.slice(5));
                                    
                                    // Check if this is a complete message
                                    if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                                        const content = data.choices[0].delta.content;
                                        fullResponse += content;
                                        contentDiv.textContent = fullResponse;
                                        chatMessages.scrollTop = chatMessages.scrollHeight;
                                    }
                                } catch (e) {
                                    // Skip invalid JSON (like "data: [DONE]")
                                    if (!line.includes('[DONE]')) {
                                        console.error('Error parsing SSE chunk:', e);
                                    }
                                }
                            }
                        }
                    }
                    
                    // Add the complete response to chat history
                    if (fullResponse) {
                        chatHistory.push({ role: "assistant", content: fullResponse });
                    }
                }
                
                await processStream();
            } else {
                // Handle non-streaming response as before
                const data = await response.json();
                
                if (data && data.response) {
                    contentDiv.textContent = data.response;
                    fullResponse = data.response;
                    chatHistory.push({ role: "assistant", content: data.response });
                } else {
                    throw new Error('Invalid response format');
                }
            }
            
            // Increment message count and update display
            messageCount++;
            updateRemainingMessages();

        } catch (error) {
            // Handle errors gracefully
            console.error('Chat API error:', error);
            
            // Remove loading indicator if it's still there
            if (chatMessages.contains(loadingDiv)) {
                chatMessages.removeChild(loadingDiv);
            }
            
            // Show a friendly error message
            const errorMessage = "I'm sorry, I couldn't process your request right now. Please try again later.";
            addMessageToChat(errorMessage, 'ai');
            
            // Still count this against the message limit
            messageCount++;
            updateRemainingMessages();
        }
    }

    function addMessageToChat(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        if (sender === 'user') {
            // For user messages, just add the text
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = message;
            messageDiv.appendChild(contentDiv);
        } else {
            // For AI messages, add logo and content
            const logoSpan = document.createElement('div');
            logoSpan.className = 'ai-logo';
            logoSpan.innerHTML = `<img src="images/logo.png" alt="Sharmo logo" width="20" height="20">`;
            messageDiv.appendChild(logoSpan);
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = message;
            messageDiv.appendChild(contentDiv);
        }
        
        chatMessages.appendChild(messageDiv);
    }

    function updateRemainingMessages() {
        const remaining = MAX_MESSAGES - messageCount;
        const remainingText = remaining === 0 
            ? 'No messages remaining - Session complete' 
            : `${remaining}/${MAX_MESSAGES} questions remaining`;
        document.getElementById('remainingMessages').textContent = remainingText;
    }

    function disableChat() {
        userInput.disabled = true;
        sendMessageBtn.disabled = true;
        userInput.placeholder = 'Maximum messages reached for this session';
        
        // Add a message with the company branding
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'ai-message', 'limit-message');
        
        // Add logo to limit message
        const logoSpan = document.createElement('div');
        logoSpan.className = 'ai-logo';
        logoSpan.innerHTML = `<img src="images/logo.png" alt="Sharmo logo" width="20" height="20">`;
        messageDiv.appendChild(logoSpan);
        
        // Add content
        const contentSpan = document.createElement('div');
        contentSpan.className = 'message-content';
        contentSpan.textContent = 'You have reached the maximum number of messages for this session. Please try again in 24 hours.';
        messageDiv.appendChild(contentSpan);
        
        chatMessages.appendChild(messageDiv);
    }

    function showMaxMessagesAlert() {
        const alertMessage = document.createElement('div');
        alertMessage.classList.add('message', 'ai-message', 'limit-message');
        
        // Add logo to alert message
        const logoSpan = document.createElement('div');
        logoSpan.className = 'ai-logo';
        logoSpan.innerHTML = `<img src="images/logo.png" alt="Sharmo logo" width="20" height="20">`;
        alertMessage.appendChild(logoSpan);
        
        // Add content
        const contentSpan = document.createElement('div');
        contentSpan.className = 'message-content';
        contentSpan.textContent = 'You have reached the maximum number of messages for this session. Please try again in 24 hours.';
        alertMessage.appendChild(contentSpan);
        
        document.getElementById('chatMessages').appendChild(alertMessage);
    }
}); 