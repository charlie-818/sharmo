document.addEventListener('DOMContentLoaded', function() {
    // Update active states based on current page
    const currentPage = window.location.pathname;
    document.querySelectorAll('.nav-page').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Initialize scroll behavior
    initializeNavigation();
});

function initializeNavigation() {
    // Smooth scrolling for dropdown links
    document.querySelectorAll('.scroll-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('/#')) {
                // If we're not on the homepage, navigate there first
                if (window.location.pathname !== '/') {
                    window.location.href = href;
                    return;
                }
                
                e.preventDefault();
                const targetId = href.substring(2);
                const targetSection = document.querySelector('#' + targetId);
                
                if (targetSection) {
                    const navHeight = document.querySelector('.nav').offsetHeight;
                    const targetPosition = targetSection.offsetTop - navHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
} 