require('dotenv').config();  // Add this at the top of your server file
const express = require('express');
const path = require('path');
const propertyLookup = require('./api/property-lookup');

// Log environment variables status
console.log('\n🌐 Starting server');
console.log('🔑 Environment variables loaded:');
console.log(`  • NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`  • PORT: ${process.env.PORT || '3000 (default)'}`);
console.log(`  • PERPLEXITY_API_KEY: ${process.env.PERPLEXITY_API_KEY ? 'SET ✓' : 'MISSING ✗'}`);

if (!process.env.PERPLEXITY_API_KEY) {
    console.warn('\n⚠️ WARNING: PERPLEXITY_API_KEY is not set in .env file!');
    console.warn('⚠️ The property lookup will use mock data instead of real API data.');
    console.warn('⚠️ To fix this, ensure your .env file contains a valid API key.');
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Add this middleware to expose environment variables to your frontend
app.use((req, res, next) => {
    res.locals.env = {
        PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY
    };
    next();
});

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();
    console.log(`\n🔄 ${timestamp} | ${req.method} ${req.url}`);
    
    // Add response finished event handler
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`✅ Response sent: ${res.statusCode} (${duration}ms)`);
    });
    
    next();
});

// API Routes
app.post('/api/property-lookup', async (req, res) => {
    console.log('\n📝 Processing property lookup request');
    
    try {
        await propertyLookup(req, res);
    } catch (error) {
        console.error('❌ Unhandled error in property lookup API:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to process property lookup request',
            details: error.message
        });
    }
});

// Update your route that serves index.html to use template engine
app.get('/', (req, res) => {
    res.render('index', { env: res.locals.env });
});

// Serve static files
app.get('*', (req, res, next) => {
    // Skip logging for asset requests
    if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
        return next();
    }
    
    console.log(`🌐 Serving: ${req.path}`);
    
    // Check if the requested file exists
    const filePath = path.join(__dirname, req.path);
    res.sendFile(filePath, (err) => {
        if (err) {
            // If file not found and not an API route, serve index.html
            if (!req.path.startsWith('/api/')) {
                console.log(`📄 File not found, serving index.html instead: ${req.path}`);
                res.sendFile(path.join(__dirname, 'index.html'));
            }
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Unhandled server error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message 
    });
});

// Start server
app.listen(port, () => {
    console.log(`\n🚀 Server running on port ${port}`);
    console.log(`📡 Visit http://localhost:${port} to view the application`);
    console.log(`🔍 Property lookup API available at http://localhost:${port}/api/property-lookup`);
    console.log(`\n💻 Ready to process requests`);
}); 