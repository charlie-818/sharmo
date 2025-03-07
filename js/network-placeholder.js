// Network logo placeholder generator
document.addEventListener('DOMContentLoaded', function() {
    const networkIcons = document.querySelectorAll('.network-icon');
    
    networkIcons.forEach(icon => {
        // Check if image failed to load
        icon.onerror = function() {
            // Get the alt text to determine which network
            const network = icon.alt.toLowerCase();
            
            // Create a canvas element
            const canvas = document.createElement('canvas');
            canvas.width = 40;
            canvas.height = 40;
            
            const ctx = canvas.getContext('2d');
            
            // Define colors for different networks
            const colors = {
                'ethereum': '#627EEA',
                'polygon': '#8247E5',
                'bsc': '#F3BA2F',
                'testnet': '#6E7191'
            };
            
            // Choose color based on network name
            let color = '#627EEA'; // Default to Ethereum blue
            for (const [key, value] of Object.entries(colors)) {
                if (network.includes(key)) {
                    color = value;
                    break;
                }
            }
            
            // Draw a circle with the network color
            ctx.beginPath();
            ctx.arc(20, 20, 18, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            
            // Add text (first letter of the network name)
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(network.charAt(0).toUpperCase(), 20, 20);
            
            // Replace the image source with the canvas data URL
            icon.src = canvas.toDataURL('image/png');
        };
    });
}); 