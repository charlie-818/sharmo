require('dotenv').config();  // Add this at the top of your server file
const express = require('express');
const path = require('path');
const propertyLookup = require('./api/property-lookup');

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

// API Routes
app.post('/api/property-lookup', async (req, res) => {
    try {
        await propertyLookup(req, res);
    } catch (error) {
        console.error('Error handling property lookup:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to process property lookup request'
        });
    }
});

// Update your route that serves index.html to use template engine
app.get('/', (req, res) => {
    res.render('index', { env: res.locals.env });
});

// Serve static files
app.get('*', (req, res) => {
    // Check if the requested file exists
    const filePath = path.join(__dirname, req.path);
    res.sendFile(filePath, (err) => {
        if (err) {
            // If file not found and not an API route, serve index.html
            if (!req.path.startsWith('/api/')) {
                res.sendFile(path.join(__dirname, 'index.html'));
            }
        }
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Visit http://localhost:${port} to view the application`);
    console.log(`Property lookup API available at http://localhost:${port}/api/property-lookup`);
}); 