/**
 * Configuration for Sharmo application
 * Handles environment variables and app-wide settings
 */

// The ENV object stores environment variables
// In a browser context, we need a fallback for process.env
const ENV = {
    // DO NOT expose API keys in client-side code - this should be handled server-side
    PERPLEXITY_API_KEY: '', // This should be handled server-side, not in client code
};

// The CONFIG object stores application-wide configuration
const CONFIG = {
    // Perplexity API configuration
    perplexity: {
        apiUrl: 'https://api.perplexity.ai/chat/completions',
        model: 'sonar', // Perplexity's default model
        apiKey: ENV.PERPLEXITY_API_KEY, // API key from environment variables
        systemPrompt: `You are an AI assistant for Sharmo, a platform specializing in real estate tokenization.
Your goal is to help users understand how tokenization makes real estate investing more accessible and liquid.

Focus on explaining these key concepts:
- How real estate tokenization works (converting property to blockchain tokens)
- Benefits of fractional ownership (start with $50)
- Liquidity advantages compared to traditional real estate
- Security features of Sharmo tokens
- How to get started as an investor

Keep responses concise (3-5 sentences) and non-technical.
Emphasize that tokenization opens real estate to everyone, not just wealthy investors.
Direct users to 'Learn More' sections on the website for deeper information.`,
    },
    
    // App-wide settings
    app: {
        name: 'Sharmo',
        version: '1.0.0',
        debug: false,
    }
};

// Log configuration loaded (except sensitive data)
console.log('Configuration loaded successfully');

// Export the CONFIG object for use in other files
export { CONFIG }; 