require('dotenv').config();  // Add this at the top of your server file
const express = require('express');
const app = express();

// Add this middleware to expose environment variables to your frontend
app.use((req, res, next) => {
    res.locals.env = {
        PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY
    };
    next();
});

// Update your route that serves index.html to use template engine
app.get('/', (req, res) => {
    res.render('index', { env: res.locals.env });
}); 