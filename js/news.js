/**
 * News Page Functionality
 * Handles news filtering and animations
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeNewsPage();
});

/**
 * Initialize the news page functionality
 */
function initializeNewsPage() {
    setupFilterTabs();
    setupNewsletterForm();
    addScrollEffects();
    addCardHoverEffects();
}

/**
 * Set up the category filter tabs
 */
function setupFilterTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const newsCards = document.querySelectorAll('.news-card');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            const category = this.textContent.trim().toLowerCase();
            
            // If "All News" is selected, show all cards
            if (category === 'all news') {
                newsCards.forEach(card => {
                    card.style.display = '';
                });
                return;
            }
            
            // Otherwise, filter by category
            newsCards.forEach(card => {
                const cardCategory = card.querySelector('.news-tag').textContent.trim().toLowerCase();
                
                if (cardCategory.includes(category) || 
                    category.includes('market') && cardCategory.includes('market') ||
                    category.includes('regulation') && cardCategory.includes('regulation') ||
                    category.includes('analysis') && cardCategory.includes('analysis') ||
                    category.includes('technology') && cardCategory.includes('technology')) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Check if URL has hash and trigger appropriate filter
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const matchingTab = Array.from(filterTabs).find(tab => 
            tab.textContent.trim().toLowerCase().includes(hash.toLowerCase())
        );
        
        if (matchingTab) {
            matchingTab.click();
        }
    }
}

/**
 * Set up the newsletter form functionality
 */
function setupNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const submitBtn = this.querySelector('button[type="submit"]');
            
            // Disable form and show loading state
            emailInput.disabled = true;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Subscribing...';
            
            // Simulate form submission
            setTimeout(() => {
                // Show success message
                const formContainer = document.querySelector('.newsletter-form');
                formContainer.innerHTML = `
                    <div class="subscription-success">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <h3>Thank you for subscribing!</h3>
                        <p>You'll receive our next newsletter in your inbox.</p>
                    </div>
                `;
                
                // Add styles for the success message
                const style = document.createElement('style');
                style.textContent = `
                    .subscription-success {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                        padding: 20px;
                    }
                    
                    .subscription-success svg {
                        margin-bottom: 20px;
                    }
                    
                    .subscription-success h3 {
                        font-size: 1.5rem;
                        font-weight: 700;
                        margin-bottom: 10px;
                        color: var(--text);
                    }
                    
                    .subscription-success p {
                        color: var(--text-secondary);
                        font-size: 1rem;
                    }
                `;
                document.head.appendChild(style);
            }, 1500);
        });
    }
}

/**
 * Add scroll effects to the news cards
 */
function addScrollEffects() {
    const newsCards = document.querySelectorAll('.news-card');
    
    // Initial check for visible cards
    checkVisibility(newsCards);
    
    // Check on scroll
    window.addEventListener('scroll', function() {
        checkVisibility(newsCards);
    });
}

/**
 * Add enhanced hover effects to cards
 */
function addCardHoverEffects() {
    const newsCards = document.querySelectorAll('.news-card');
    
    newsCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const readMoreBtn = this.querySelector('.read-more');
            if (readMoreBtn) {
                readMoreBtn.style.gap = '8px';
                const arrow = readMoreBtn.querySelector('i');
                if (arrow) {
                    arrow.style.transform = 'translateX(3px)';
                }
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const readMoreBtn = this.querySelector('.read-more');
            if (readMoreBtn) {
                readMoreBtn.style.gap = '5px';
                const arrow = readMoreBtn.querySelector('i');
                if (arrow) {
                    arrow.style.transform = 'translateX(0)';
                }
            }
        });
    });
}

/**
 * Check if elements are visible in the viewport and add animation
 */
function checkVisibility(elements) {
    elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const isVisible = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
        
        if (isVisible && !element.classList.contains('animated')) {
            element.classList.add('animated');
            element.style.animation = 'fadeInUp 0.5s ease forwards';
        }
    });
}

// Add keyframes for animations
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .news-card {
            opacity: 0;
        }
        
        .news-card.animated {
            opacity: 1;
        }
        
        .news-card .read-more i {
            transition: transform 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

// Add animation styles when page loads
addAnimationStyles(); 