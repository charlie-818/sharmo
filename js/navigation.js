/**
 * sharmo Navigation & Header Enhancements
 * Adds advanced interactive elements to create a professional crypto experience
 */

document.addEventListener('DOMContentLoaded', function() {
    loadHeader();
    initializeNavigation();
    enhanceBlockchainEffects();
    handleScrollEffects();
});

/**
 * Loads the header component and ensures consistent positioning
 */
function loadHeader() {
    const headerContainer = document.getElementById('header-container');
    
    if (headerContainer) {
        fetch('components/header.html')
            .then(response => response.text())
            .then(html => {
                headerContainer.innerHTML = html;
                // Ensure header is properly positioned after loading
                headerContainer.style.display = 'block';
                document.body.style.paddingTop = window.innerWidth <= 768 ? '60px' : '70px';
                
                // Initialize navigation after header is loaded
                initializeNavigation();
            })
            .catch(error => {
                console.error('Error loading header:', error);
            });
    }
}

/**
 * Sets up basic navigation functionality
 */
function initializeNavigation() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (navLinks && navLinks.classList.contains('active') && 
            !event.target.closest('.nav-links') && 
            !event.target.closest('.mobile-menu-toggle')) {
            navLinks.classList.remove('active');
            if (mobileMenuToggle) {
                mobileMenuToggle.classList.remove('active');
            }
        }
    });
    
    // Add active class to current page link
    highlightCurrentPageLink();
    
    // Add subtle hover effects to navigation items
    addNavigationHoverEffects();
}

/**
 * Highlights the current page link in the navigation
 */
function highlightCurrentPageLink() {
    const currentLocation = window.location.href;
    const navItems = document.querySelectorAll('.nav-link, .nav-page');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && (
            currentLocation.endsWith(href) || 
            (href !== '/' && currentLocation.includes(href))
        )) {
            item.classList.add('active');
            
            // If it's in a dropdown, also highlight parent
            const parentItem = item.closest('.nav-item');
            if (parentItem) {
                const parentLink = parentItem.querySelector('.nav-link');
                if (parentLink) {
                    parentLink.classList.add('active');
                }
            }
        }
    });
}

/**
 * Add subtle hover effects to navigation items
 */
function addNavigationHoverEffects() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const link = this.querySelector('.nav-link');
            if (link) {
                link.style.transition = 'all 0.3s ease';
                link.style.transform = 'translateY(-2px)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const link = this.querySelector('.nav-link');
            if (link) {
                link.style.transform = 'translateY(0)';
            }
        });
    });
}

/**
 * Enhances the blockchain visual effects
 */
function enhanceBlockchainEffects() {
    // Don't run blockchain effects on mobile
    if (window.innerWidth < 992) return;
    
    const connection = document.querySelector('.connection');
    if (!connection) return;
    
    // Create and add data particles animation
    setInterval(createDataParticle, 800);
    
    // Add keyframes for data particle animation if not already added
    if (!document.querySelector('#data-particle-keyframes')) {
        const style = document.createElement('style');
        style.id = 'data-particle-keyframes';
        style.innerHTML = `
            @keyframes moveDataParticle {
                0% { transform: translateY(-50%) translateX(0); opacity: 0; }
                20% { opacity: 0.8; }
                100% { transform: translateY(-50%) translateX(100px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Creates a single data particle for the blockchain animation
 */
function createDataParticle() {
    const connection = document.querySelector('.connection');
    if (!connection) return;
    
    const particle = document.createElement('div');
    particle.classList.add('data-particle');
    particle.style.position = 'absolute';
    particle.style.top = '0';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.width = '3px';
    particle.style.height = '3px';
    particle.style.background = '#1DB954';
    particle.style.borderRadius = '50%';
    particle.style.opacity = '0.8';
    particle.style.transform = 'translateY(-50%)';
    particle.style.animation = `moveDataParticle ${2 + Math.random() * 2}s linear forwards`;
    
    connection.appendChild(particle);
    
    // Remove particle after animation completes
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 4000);
}

/**
 * Adds scroll-based effects to the navigation
 */
function handleScrollEffects() {
    let lastScrollTop = 0;
    const nav = document.querySelector('.nav');
    
    if (!nav) return;
    
    window.addEventListener('scroll', function() {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add shadow based on scroll position
        if (currentScroll > 50) {
            nav.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
        } else {
            nav.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
        }
        
        // Subtle hide/show based on scroll direction
        if (currentScroll > lastScrollTop && currentScroll > 200) {
            // Scrolling down
            nav.style.transform = 'translateX(-50%) translateY(-20px)';
            nav.style.opacity = '0.95';
        } else {
            // Scrolling up
            nav.style.transform = 'translateX(-50%) translateY(0)';
            nav.style.opacity = '1';
        }
        
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }, { passive: true });
    
    // Reset nav bar on page load
    nav.style.transform = 'translateX(-50%) translateY(0)';
    nav.style.opacity = '1';
}

/**
 * Adds crypto-themed effects to highlight the tech-forward nature
 * of the platform when using the wallet features
 */
function initializeCryptoEffects() {
    // Check if we're on a wallet-related page
    if (window.location.href.includes('wallet')) {
        // Add subtle data visualization elements
        const navBrand = document.querySelector('.nav-brand');
        if (navBrand) {
            navBrand.classList.add('wallet-active');
            
            // Create a subtle pulse effect when wallet is connected
            const walletStatus = document.getElementById('walletStatus');
            if (walletStatus) {
                const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.target.classList.contains('connected')) {
                            navBrand.classList.add('connection-active');
                        } else {
                            navBrand.classList.remove('connection-active');
                        }
                    });
                });
                
                observer.observe(walletStatus, { attributes: true, attributeFilter: ['class'] });
            }
        }
    }
}

// Initialize crypto effects if on wallet page
initializeCryptoEffects(); 