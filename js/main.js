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

    // Setup form submission
    const setupFormSubmission = () => {
        const lookupForm = document.querySelector('.lookup-form');
        if (lookupForm) {
            lookupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const results = document.querySelector('.property-results');
                if (!results) return;

                // Show loading spinner
                results.style.display = 'block';
                results.innerHTML = `
                    <div class="loading-indicator">
                        <div class="spinner"></div>
                    </div>
                `;

                try {
                    const response = await fetch('/.netlify/functions/property-lookup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            address: document.getElementById('address')?.value || '',
                            city: document.getElementById('city')?.value || '',
                            state: document.getElementById('state')?.value || ''
                        })
                    });

                    if (!response.ok) throw new Error('API request failed: ' + response.status);
                    const data = await response.json();
                    
                    // Update results with property data
                    updatePropertyResults(results, data);
                } catch (error) {
                    results.innerHTML = `
                        <div class="error-message">
                            <h3>Error</h3>
                            <p>Sorry, we couldn't find the property details.</p>
                            <p class="error-details">${error.message}</p>
                        </div>
                    `;
                }
            });
        }
    };

    /**
     * Updates the property results with data from the API
     * @param {Element} resultsElement - The container to update
     * @param {Object} data - The property data
     */
    function updatePropertyResults(resultsElement, data) {
        if (!data.propertyData) {
            resultsElement.innerHTML = `
                <div class="error-message">
                    <p>Sorry, we couldn't find the property details.</p>
                </div>
            `;
            return;
        }

        // Create dashboard HTML
        const html = `
            <div class="dashboard-grid">
                <!-- Key Metrics Card -->
                <div class="dashboard-card metrics-card">
                    <div class="metric-group">
                        <div class="metric primary">
                            <span class="metric-value">$${data.propertyData.estimatedValue.toLocaleString()}</span>
                            <span class="metric-label">Property Value</span>
                            <div class="metric-trend">+12% vs Market Avg</div>
                        </div>
                        <div class="stats-row">
                            <div class="stat">
                                <span class="stat-label">Annual Rental Income</span>
                                <span class="stat-value">$${Math.round(data.propertyData.estimatedValue * 0.08).toLocaleString()}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Cap Rate</span>
                                <span class="stat-value">8%</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">5-Year ROI</span>
                                <span class="stat-value">47%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Property Details -->
                <div class="dashboard-card details-card">
                    <div class="property-header">
                        <div class="property-type">
                            <i class="fas fa-home"></i>
                            <span>${data.propertyData.propertyType}</span>
                        </div>
                        <div class="property-specs">
                            <span><i class="fas fa-bed"></i> ${data.propertyData.bedrooms}</span>
                            <span><i class="fas fa-bath"></i> ${data.propertyData.bathrooms}</span>
                            <span><i class="fas fa-ruler-combined"></i> ${data.propertyData.squareFootage.toLocaleString()} sqft</span>
                        </div>
                    </div>
                    <div class="property-features">
                        <div class="feature">
                            <span class="feature-label">Year Built</span>
                            <span class="feature-value">${data.propertyData.yearBuilt}</span>
                        </div>
                        <div class="feature">
                            <span class="feature-label">Lot Size</span>
                            <span class="feature-value">${data.propertyData.lotSize}</span>
                        </div>
                        <div class="feature">
                            <span class="feature-label">Price per Sqft</span>
                            <span class="feature-value">$${Math.round(data.propertyData.estimatedValue / data.propertyData.squareFootage).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <!-- Action Button -->
                <a href="/wallet.html" class="tokenize-btn" onclick="localStorage.setItem('propertyValue', '${data.propertyData.estimatedValue}')">
                    Start Tokenization Process
                </a>
            </div>
        `;
        
        resultsElement.innerHTML = html;
    }

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
    setupFormSubmission();
    setupChat();
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
