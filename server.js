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
app.post('/api/property-lookup', propertyLookup);

// Update your route that serves index.html to use template engine
app.get('/', (req, res) => {
    res.render('index', { env: res.locals.env });
});

// Serve static files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, req.path));
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 