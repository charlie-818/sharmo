/**
 * Chat functionality for sharmo
 * Handles all chat-related operations
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize chat variables
    const chatContainer = document.querySelector('.chat-container');
    const openChatBtn = document.getElementById('openChat');
    const closeChatBtn = document.getElementById('closeChat');
    const sendMessageBtn = document.getElementById('sendMessage');
    const userInput = document.getElementById('userInput');
    
    if (!chatContainer || !openChatBtn || !closeChatBtn) return;
    
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

    // Open chat event listener
    openChatBtn.addEventListener('click', async () => {
        try {
            // Clear previous messages when opening chat
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.innerHTML = '';
            
            chatContainer.style.display = 'flex';
            openChatBtn.style.display = 'none';
            
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
        chatContainer.style.display = 'none';
        openChatBtn.style.display = 'block';
    });

    // Chat functionality
    if (sendMessageBtn && userInput) {
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
                    chatContainer.style.display = 'flex';
                    openChatBtn.style.display = 'none';
                    
                    // Show welcome message
                    showWelcomeMessage();
                    
                    // Update flag to prevent multiple triggers
                    chatShown = true;
                }
            }
        });
    }

    // Add secret key combination handler
    let ctrlPressed = false;
    let shiftPressed = false;
    document.addEventListener('keydown', (e) => {
        // Check for Ctrl + Shift + R
        if (e.key === 'Control') ctrlPressed = true;
        if (e.key === 'Shift') shiftPressed = true;
        
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            e.preventDefault(); // Prevent page refresh
            messageCount = 0;
            localStorage.setItem('chatMessageCount', '0');
            updateRemainingMessages();
            
            // Re-enable chat if it was disabled
            userInput.disabled = false;
            sendMessageBtn.disabled = false;
            userInput.placeholder = 'Ask about tokenization...';
            
            // Show subtle confirmation
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                const resetMsg = document.createElement('div');
                resetMsg.classList.add('message', 'ai-message');
                resetMsg.style.opacity = '0.7';
                resetMsg.textContent = '🔄 Message limit reset';
                chatMessages.appendChild(resetMsg);
                setTimeout(() => resetMsg.remove(), 2000);
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'Control') ctrlPressed = false;
        if (e.key === 'Shift') shiftPressed = false;
    });

    // Chat Helper Functions
    async function showWelcomeMessage() {
        const welcomeMessage = `Hello! I'm TokenAI, your dedicated real estate tokenization specialist.

I'm here to help you understand how Sharmo is revolutionizing real estate investment through blockchain technology.

I can explain:

• How real estate tokenization works
• Fractional property ownership benefits
• Liquidity in real estate investments
• Security features with sharmo tokens
• How to start investing with as little as $50

What would you like to know more about?`;

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'ai-message');
        document.getElementById('chatMessages').appendChild(messageDiv);

        try {
            let displayedText = '';
            for (const char of welcomeMessage) {
                await new Promise(resolve => setTimeout(resolve, 20));
                displayedText += char;
                messageDiv.innerHTML = displayedText.replace(/\n/g, '<br>');
            }
        } catch (error) {
            console.error('Error in welcome message:', error);
        }
    }

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

        // Scroll to bottom of chat
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Add loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'ai-message', 'loading');
        loadingDiv.innerHTML = `
            <div class="typing-indicator">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
            <span class="loading-text">Connecting to AI...</span>
        `;
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            // Call the Netlify function that connects to Perplexity API
            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            // Remove loading indicator
            loadingDiv.remove();

            // First check if the response is ok
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                throw new Error(`Connection error (${response.status}). Please try again later.`);
            }

            // Get the response text first
            const responseText = await response.text();
            
            // Try to parse the JSON, handle empty or malformed JSON
            let data;
            try {
                data = responseText ? JSON.parse(responseText) : { error: "Empty response" };
            } catch (jsonError) {
                console.error("JSON parse error:", jsonError, "Response:", responseText);
                throw new Error(`Unable to process response. Please try again.`);
            }
            
            if (data.error) {
                console.error("API returned error:", data.error);
                throw new Error(data.error);
            }

            // Create response message container
            const responseDiv = document.createElement('div');
            responseDiv.classList.add('message', 'ai-message');
            chatMessages.appendChild(responseDiv);

            // Stream the response message one character at a time
            let displayedText = '';
            const streamDelay = 10; // Fast typing speed (milliseconds)
            for (const char of data.message) {
                await new Promise(resolve => setTimeout(resolve, streamDelay));
                displayedText += char;
                responseDiv.innerHTML = displayedText.replace(/\n/g, '<br>');
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }

            // Update message count
            messageCount++;
            localStorage.setItem('chatMessageCount', messageCount.toString());
            updateRemainingMessages();

            // Check if max messages reached
            if (messageCount >= MAX_MESSAGES) {
                disableChat();
            }

        } catch (error) {
            console.error('Error:', error);
            const errorDiv = document.createElement('div');
            errorDiv.classList.add('message', 'ai-message', 'error-message');
            
            // Create a more user-friendly error message
            let errorMessage = "Sorry, I encountered an error processing your request.";
            let errorDetails = error.message || "Please try again later.";
            
            // Check for specific error types
            if (error.message && error.message.includes("Connection error")) {
                errorMessage = "Unable to connect to the AI service.";
                errorDetails = "This could be due to network issues or the service being temporarily unavailable.";
            } else if (error.message && error.message.includes("timed out")) {
                errorMessage = "The request took too long to process.";
                errorDetails = "Please try asking a simpler question or try again later.";
            }
            
            errorDiv.innerHTML = `
                <p>${errorMessage}</p>
                <p class="error-details">${errorDetails}</p>
                <button class="retry-button">Try Again</button>
            `;
            chatMessages.appendChild(errorDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Add event listener to retry button
            const retryButton = errorDiv.querySelector('.retry-button');
            if (retryButton) {
                retryButton.addEventListener('click', () => {
                    // Remove the error message
                    errorDiv.remove();
                    // If there was a message in the input, resend it
                    if (message) {
                        userInput.value = message;
                        sendMessage();
                    }
                });
            }
        }
    }

    function addMessageToChat(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
    }

    function updateRemainingMessages() {
        const remaining = MAX_MESSAGES - messageCount;
        const remainingText = remaining === 0 
            ? 'No messages remaining - Session complete' 
            : `${remaining} message${remaining !== 1 ? 's' : ''} remaining`;
        document.getElementById('remainingMessages').textContent = remainingText;
    }

    function disableChat() {
        userInput.disabled = true;
        sendMessageBtn.disabled = true;
        userInput.placeholder = 'Maximum messages reached for this session';
        addMessageToChat('You have reached the maximum number of messages for this session. Please try again in 24 hours.', 'ai');
    }

    function showMaxMessagesAlert() {
        const alertMessage = document.createElement('div');
        alertMessage.classList.add('message', 'ai-message', 'error-message');
        alertMessage.textContent = 'You have reached the maximum number of messages for this session. Please try again in 24 hours.';
        document.getElementById('chatMessages').appendChild(alertMessage);
    }

    // Avatar handling
    let currentAvatarIndex = 1;
    const avatarImg = document.getElementById('aiAvatar');
    if (avatarImg) {
        avatarImg.src = '/images/ai-avatar-2.png';
        avatarImg.onerror = function() {
            console.error('Failed to load avatar:', avatarImg.src);
            // Fallback to avatar 2
            avatarImg.src = '/images/ai-avatar-2.png';
        };
    }
}); 