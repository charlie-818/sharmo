require('dotenv').config();
const fetch = require('node-fetch');

const handler = async (event) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Get API key from Netlify environment variables
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey || !apiKey.startsWith('pplx-')) {
    console.error('API key not properly configured');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Configuration error',
        details: 'API key not properly configured'
      })
    };
  }

  try {
    // Parse the request body
    let messageBody;
    try {
      messageBody = JSON.parse(event.body);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request body - could not parse JSON' })
      };
    }

    const { message } = messageBody;

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No message provided' })
      };
    }

    console.log('Processing chat request with message length:', message.length);

    // Set up API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            {
              role: "system",
              content: "You are TokenAI, an expert in blockchain-based real estate tokenization for sharmo platform. Keep answers concise but informative (2-3 sentences when possible). Always advocate for the benefits of real estate tokenization, emphasizing fractional ownership, liquidity, transparency, and accessibility. Focus on how tokenization solves traditional real estate investment barriers like high entry costs and illiquidity. Provide specific examples of how sharmo's platform democratizes real estate investing through blockchain technology. If asked about unrelated topics, briefly explain that you specialize in real estate tokenization and redirect to that topic."
            },
            {
              role: "user",
              content: message
            }
          ]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Perplexity API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        return {
          statusCode: 502, // Bad Gateway
          headers,
          body: JSON.stringify({ 
            error: `Perplexity API request failed: ${response.status}`,
            details: errorText.slice(0, 200) // Limit error text length
          })
        };
      }

      const data = await response.json();
      const messageContent = data.choices?.[0]?.message?.content;

      if (!messageContent) {
        return {
          statusCode: 502,
          headers,
          body: JSON.stringify({ error: 'No message content in API response' })
        };
      }

      console.log('Successful response with message length:', messageContent.length);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: messageContent,
          citations: []
        })
      };

    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        return {
          statusCode: 504, // Gateway Timeout
          headers,
          body: JSON.stringify({ error: 'Request to Perplexity API timed out after 30 seconds' })
        };
      }
      throw fetchError; // Re-throw for general error handling
    }

  } catch (error) {
    console.error('Error details:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to process request',
        details: error.message || 'Unknown error'
      })
    };
  }
};

// Export the handler function for Netlify Functions
module.exports.handler = handler; 