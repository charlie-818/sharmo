document.addEventListener('DOMContentLoaded', function() {
    // Table of Contents highlighting based on scroll position
    const headings = document.querySelectorAll('.article-content h2');
    const tocLinks = document.querySelectorAll('.toc a');
    
    if (headings.length > 0 && tocLinks.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const headingObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    tocLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);
        
        headings.forEach(heading => {
            headingObserver.observe(heading);
        });
    }
    
    // Smooth scrolling for ToC links
    document.querySelectorAll('.toc a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Estimated reading time calculation
    function calculateReadingTime() {
        const articleContent = document.querySelector('.article-content');
        if (articleContent) {
            const text = articleContent.textContent;
            const wordCount = text.split(/\s+/).length;
            const readingTime = Math.ceil(wordCount / 200); // Assume 200 words per minute
            
            const readingTimeElement = document.querySelector('.article-meta span:last-child');
            if (readingTimeElement) {
                readingTimeElement.textContent = `${readingTime} min read`;
            }
        }
    }
    
    // Call reading time calculation
    calculateReadingTime();
}); 