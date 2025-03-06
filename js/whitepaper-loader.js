/**
 * Whitepaper Link Validator
 * This script checks all whitepaper links and ensures they point to the correct location.
 * It also provides feedback if the PDF fails to load.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Fix all whitepaper links to ensure correct path
    const whitepaperLinks = document.querySelectorAll('a[href*="sharmo-whitepaper.pdf"]');
    
    whitepaperLinks.forEach(link => {
        // Normalize all links to use relative path without leading slash
        const href = link.getAttribute('href');
        if (href.startsWith('/docs/')) {
            link.setAttribute('href', href.substring(1));
        }
        
        // Add click event to validate PDF exists
        link.addEventListener('click', function(e) {
            // We'll fetch the PDF first to check if it exists
            fetch(link.getAttribute('href'))
                .then(response => {
                    if (!response.ok) {
                        e.preventDefault();
                        alert('The whitepaper PDF could not be loaded. Please ensure the file exists and try again.');
                        console.error('Failed to load whitepaper PDF:', response.status, response.statusText);
                    }
                    // If no error, let the default link behavior continue
                })
                .catch(error => {
                    e.preventDefault();
                    alert('The whitepaper PDF could not be loaded. Please ensure the file exists and try again.');
                    console.error('Error checking whitepaper PDF:', error);
                });
        });
    });
    
    // Log whitepaper PDF status for debugging
    fetch('docs/sharmo-whitepaper.pdf')
        .then(response => {
            if (response.ok) {
                console.log('Whitepaper PDF is available.');
            } else {
                console.error('Whitepaper PDF is not available:', response.status, response.statusText);
            }
        })
        .catch(error => {
            console.error('Error checking whitepaper PDF:', error);
        });
}); 