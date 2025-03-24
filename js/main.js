/**
 * Main JavaScript file for sharmo
 * Contains functionality for various site features
 */
document.addEventListener('DOMContentLoaded', () => {
    // Random stats display in hero section
    const displayRandomStats = () => {
        const allStats = Array.from(document.querySelectorAll('.hero-stat'));
        
        // First hide all stats
        allStats.forEach(stat => {
            stat.classList.remove('active');
            stat.style.display = 'none';
        });
        
        // Shuffle the stats array
        const shuffledStats = [...allStats].sort(() => Math.random() - 0.5);
        
        // Show first 4 random stats
        shuffledStats.slice(0, 4).forEach(stat => {
            stat.classList.add('active');
            stat.style.display = 'flex';
        });
    };

    // External page navigation handling
    const handleExternalLinks = () => {
        const externalLinks = document.querySelectorAll('.nav-links a[href*="marketplace"], .nav-links a[href*="wallet"]');
        externalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = link.getAttribute('href');
            });
        });
    };

    // Smooth scrolling for anchor links
    const setupSmoothScrolling = () => {
        document.querySelectorAll('.scroll-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const navHeight = document.querySelector('.nav').offsetHeight;
                    const targetPosition = targetSection.offsetTop - navHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    };

    // Property lookup shortcut key
    const setupPropertyLookupShortcut = () => {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                const propertyLookup = document.querySelector('.property-lookup');
                const mainContent = document.querySelectorAll('section:not(.property-lookup)');
                
                if (propertyLookup.style.display === 'none') {
                    mainContent.forEach(section => section.style.display = 'none');
                    propertyLookup.style.display = 'block';
                } else {
                    mainContent.forEach(section => section.style.display = 'block');
                    propertyLookup.style.display = 'none';
                }
            }
        });
    };

    // Chat functionality
    const setupChat = () => {
        // Initialize chat variables
        const chatContainer = document.querySelector('.chat-container');
        const openChatBtn = document.getElementById('openChat');
        const closeChatBtn = document.getElementById('closeChat');
        
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
                
                // Show welcome message
                await showWelcomeMessage();
                
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

        // Add scroll detection for automatic chat popup
        const hero = document.querySelector('.hero');
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

        function updateRemainingMessages() {
            const remaining = MAX_MESSAGES - messageCount;
            const remainingText = remaining === 0 
                ? 'No messages remaining - Session complete' 
                : `${remaining} message${remaining !== 1 ? 's' : ''} remaining`;
            document.getElementById('remainingMessages').textContent = remainingText;
        }

        function disableChat() {
            const userInput = document.getElementById('userInput');
            const sendMessageBtn = document.getElementById('sendMessage');
            
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
    };

    // Initialize all functionality
    displayRandomStats();
    handleExternalLinks();
    setupSmoothScrolling();
    setupPropertyLookupShortcut();
    setupChat();
    setupCodeCopyButtons();
});

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll functionality
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const navHeight = document.querySelector('.nav').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = targetPosition - navHeight - 40;  // Single consistent offset
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active section highlighting with Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '-10% 0px -80%',  // Consistent margins for all sections
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active class from all links
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                });
                
                // Add active class to current section's link
                const id = entry.target.getAttribute('id');
                const currentLink = document.querySelector(`.nav-links a[href="#${id}"]`);
                if (currentLink) {
                    currentLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach((section) => {
        observer.observe(section);
    });
});

// Increase typing speed for chat messages
async function streamMessage(message, element) {
    if (!message || !element) {
        console.error('Missing required parameters for streamMessage');
        return '';
    }
    
    const streamDelay = 10; // Reduced from default for faster typing
    let displayedText = '';
    
    try {
        for (const char of message) {
            await new Promise(resolve => setTimeout(resolve, streamDelay));
            displayedText += char;
            element.innerHTML = displayedText.replace(/\n/g, '<br>');
            
            // Auto-scroll as typing happens
            const chatMessages = element.closest('.chat-messages');
            if (chatMessages) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
    } catch (error) {
        console.error('Error streaming message:', error);
        // Fallback - display full message at once if streaming fails
        element.innerHTML = message.replace(/\n/g, '<br>');
    }
    
    return displayedText;
}

// Add code copy button functionality
function setupCodeCopyButtons() {
    // Check if we're on a documentation page with code blocks
    const codeBlocks = document.querySelectorAll('.code-block');
    if (codeBlocks.length === 0) return;
    
    // Add copy button to each code block
    codeBlocks.forEach(block => {
        // If block already has a copy button in the header, use that
        let copyBtn = block.querySelector('.copy-btn');
        
        // If no copy button exists, create one
        if (!copyBtn) {
            const codeHeader = document.createElement('div');
            codeHeader.classList.add('code-header');
            
            const codeTitle = document.createElement('span');
            codeTitle.classList.add('code-title');
            codeTitle.textContent = 'Code';
            
            copyBtn = document.createElement('button');
            copyBtn.classList.add('copy-btn');
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            
            codeHeader.appendChild(codeTitle);
            codeHeader.appendChild(copyBtn);
            
            // If there's a pre element as first child, insert before it
            const preElement = block.querySelector('pre');
            if (preElement) {
                block.insertBefore(codeHeader, preElement);
            } else {
                block.prepend(codeHeader);
            }
        }
        
        // Add click event to copy button
        copyBtn.addEventListener('click', function() {
            const codeBlock = this.closest('.code-block').querySelector('code');
            if (!codeBlock) return;
            
            const codeText = codeBlock.textContent;
            
            navigator.clipboard.writeText(codeText.trim())
                .then(() => {
                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    
                    setTimeout(() => {
                        this.innerHTML = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy code: ', err);
                    this.innerHTML = '<i class="fas fa-times"></i> Error!';
                    
                    setTimeout(() => {
                        this.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    }, 2000);
                });
        });
    });
}
