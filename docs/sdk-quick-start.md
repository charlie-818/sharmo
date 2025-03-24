# Sharmo SDK Quick Start Guide

This guide helps you get started quickly with the Sharmo SDKs for JavaScript and Python.

## Table of Contents

- [Installation](#installation)
- [Authentication](#authentication)
- [Making Your First API Call](#making-your-first-api-call)
- [Basic Operations](#basic-operations)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)

## Installation

### JavaScript SDK

The JavaScript SDK can be installed via npm or included directly in your HTML.

**NPM Installation:**

```bash
npm install sharmo-sdk --save
```

**CDN Installation:**

```html
<script src="https://cdn.sharmo.io/sdk/latest/sharmo-sdk.min.js"></script>
```

### Python SDK

The Python SDK can be installed via pip:

```bash
pip install sharmo-sdk
```

## Authentication

Before making API calls, you need to authenticate with the Sharmo API. There are two main authentication methods:

1. **OAuth 2.0 (User Authentication)**: For applications acting on behalf of users
2. **API Key (Server Authentication)**: For server-to-server integrations

### JavaScript SDK

```javascript
// Import the SDK (when using npm)
import { SharmoClient } from 'sharmo-sdk';

// OAuth 2.0 Authentication
const client = new SharmoClient({
  baseUrl: 'https://api.sharmo.io',
  version: 'v1'
});

async function authenticateUser() {
  try {
    const authResult = await client.authenticate('user@example.com', 'password123');
    console.log('Authentication successful');
    return authResult;
  } catch (error) {
    console.error('Authentication failed:', error);
    return null;
  }
}

// API Key Authentication
const apiClient = new SharmoClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.sharmo.io',
  version: 'v1'
});
```

### Python SDK

```python
import sharmo_sdk

# OAuth 2.0 Authentication
client = sharmo_sdk.create_client()

def authenticate_user():
    try:
        auth_result = client.authenticate('user@example.com', 'password123')
        print("Authentication successful")
        return auth_result
    except sharmo_sdk.SharmoError as e:
        print(f"Authentication failed: {e}")
        return None

# API Key Authentication
api_client = sharmo_sdk.create_client(
    api_key='your-api-key'
)
```

## Making Your First API Call

After authenticating, you can make API calls to interact with the Sharmo platform.

### JavaScript SDK

```javascript
// Get a list of properties
async function getProperties() {
  try {
    const properties = await client.properties.list();
    console.log(`Found ${properties.data.length} properties`);
    
    // Display the first property
    if (properties.data.length > 0) {
      const firstProperty = properties.data[0];
      console.log(`First property: ${firstProperty.name} - $${firstProperty.price}`);
    }
    
    return properties;
  } catch (error) {
    console.error('Error fetching properties:', error);
    return null;
  }
}

// Call the function
getProperties();
```

### Python SDK

```python
# Get a list of properties
def get_properties():
    try:
        properties = client.properties.list()
        print(f"Found {len(properties['data'])} properties")
        
        # Display the first property
        if properties['data']:
            first_property = properties['data'][0]
            print(f"First property: {first_property['name']} - ${first_property['price']}")
        
        return properties
    except sharmo_sdk.SharmoError as e:
        print(f"Error fetching properties: {e}")
        return None

# Call the function
get_properties()
```

## Basic Operations

### Working with Properties

#### JavaScript SDK

```javascript
// Get a specific property
async function getProperty(propertyId) {
  try {
    const property = await client.properties.get(propertyId);
    console.log(`Property details: ${property.name}`);
    return property;
  } catch (error) {
    console.error(`Error fetching property ${propertyId}:`, error);
    return null;
  }
}

// Search for properties
async function searchProperties(criteria) {
  try {
    const results = await client.properties.search(criteria);
    console.log(`Found ${results.data.length} matching properties`);
    return results;
  } catch (error) {
    console.error('Error searching properties:', error);
    return null;
  }
}
```

#### Python SDK

```python
# Get a specific property
def get_property(property_id):
    try:
        property_data = client.properties.get(property_id)
        print(f"Property details: {property_data['name']}")
        return property_data
    except sharmo_sdk.SharmoError as e:
        print(f"Error fetching property {property_id}: {e}")
        return None

# Search for properties
def search_properties(criteria):
    try:
        results = client.properties.search(criteria)
        print(f"Found {len(results['data'])} matching properties")
        return results
    except sharmo_sdk.SharmoError as e:
        print(f"Error searching properties: {e}")
        return None
```

### Working with Tokens

#### JavaScript SDK

```javascript
// Get a list of tokens
async function getTokens() {
  try {
    const tokens = await client.tokens.list();
    console.log(`Found ${tokens.data.length} tokens`);
    return tokens;
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return null;
  }
}

// Get a specific token
async function getToken(tokenId) {
  try {
    const token = await client.tokens.get(tokenId);
    console.log(`Token details: ${token.symbol}`);
    return token;
  } catch (error) {
    console.error(`Error fetching token ${tokenId}:`, error);
    return null;
  }
}
```

#### Python SDK

```python
# Get a list of tokens
def get_tokens():
    try:
        tokens = client.tokens.list()
        print(f"Found {len(tokens['data'])} tokens")
        return tokens
    except sharmo_sdk.SharmoError as e:
        print(f"Error fetching tokens: {e}")
        return None

# Get a specific token
def get_token(token_id):
    try:
        token = client.tokens.get(token_id)
        print(f"Token details: {token['symbol']}")
        return token
    except sharmo_sdk.SharmoError as e:
        print(f"Error fetching token {token_id}: {e}")
        return None
```

## Advanced Usage

### Pagination

Both SDKs support pagination for list endpoints.

#### JavaScript SDK

```javascript
async function getAllProperties() {
  let allProperties = [];
  let page = 1;
  let hasMorePages = true;
  
  while (hasMorePages) {
    try {
      const response = await client.properties.list({
        page: page,
        per_page: 20
      });
      
      allProperties = allProperties.concat(response.data);
      
      // Check if there are more pages
      hasMorePages = response.meta.current_page < response.meta.total_pages;
      page++;
      
      console.log(`Retrieved page ${response.meta.current_page} of ${response.meta.total_pages}`);
    } catch (error) {
      console.error(`Error retrieving page ${page}:`, error);
      hasMorePages = false;
    }
  }
  
  console.log(`Retrieved a total of ${allProperties.length} properties`);
  return allProperties;
}
```

#### Python SDK

```python
def get_all_properties():
    all_properties = []
    page = 1
    has_more_pages = True
    
    while has_more_pages:
        try:
            response = client.properties.list(
                page=page,
                per_page=20
            )
            
            all_properties.extend(response['data'])
            
            # Check if there are more pages
            has_more_pages = response['meta']['current_page'] < response['meta']['total_pages']
            page += 1
            
            print(f"Retrieved page {response['meta']['current_page']} of {response['meta']['total_pages']}")
        except sharmo_sdk.SharmoError as e:
            print(f"Error retrieving page {page}: {e}")
            has_more_pages = False
    
    print(f"Retrieved a total of {len(all_properties)} properties")
    return all_properties
```

### Error Handling

#### JavaScript SDK

```javascript
async function robustApiCall() {
  // Number of retry attempts
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const result = await client.properties.list();
      return result;
    } catch (error) {
      if (error.code === 'RATE_LIMIT_EXCEEDED' && retries < maxRetries - 1) {
        // Calculate exponential backoff time (in milliseconds)
        const backoffTime = Math.pow(2, retries) * 1000;
        console.log(`Rate limit exceeded. Retrying in ${backoffTime/1000} seconds...`);
        
        // Wait for the backoff time
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        
        retries++;
      } else if (error.code === 'AUTH_ERROR') {
        console.error('Authentication failed. Please log in again.');
        
        // Attempt to refresh the token
        try {
          await client.refreshToken();
          console.log('Token refreshed successfully');
          
          // Retry the request
          retries++;
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          throw error;
        }
      } else {
        // For other errors, don't retry
        console.error('API call failed:', error);
        throw error;
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} retry attempts`);
}
```

#### Python SDK

```python
import time

def robust_api_call():
    # Number of retry attempts
    max_retries = 3
    retries = 0
    
    while retries < max_retries:
        try:
            result = client.properties.list()
            return result
        except sharmo_sdk.SharmoError as e:
            if e.code == 'RATE_LIMIT_EXCEEDED' and retries < max_retries - 1:
                # Calculate exponential backoff time (in seconds)
                backoff_time = 2 ** retries
                print(f"Rate limit exceeded. Retrying in {backoff_time} seconds...")
                
                # Wait for the backoff time
                time.sleep(backoff_time)
                
                retries += 1
            elif e.code == 'AUTH_ERROR':
                print('Authentication failed. Please log in again.')
                
                # Attempt to refresh the token
                try:
                    client.refresh_token()
                    print('Token refreshed successfully')
                    
                    # Retry the request
                    retries += 1
                except sharmo_sdk.SharmoError as refresh_error:
                    print(f'Failed to refresh token: {refresh_error}')
                    raise e
            else:
                # For other errors, don't retry
                print(f'API call failed: {e}')
                raise e
    
    raise Exception(f"Failed after {max_retries} retry attempts")
```

### Webhook Handling

#### JavaScript SDK (with Express)

```javascript
const express = require('express');
const { SharmoSDK } = require('sharmo-sdk');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Your webhook secret from the Sharmo Developer Dashboard
const webhookSecret = 'your-webhook-secret';

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-sharmo-signature'];
  const payload = req.body;
  
  // Verify the webhook signature
  const isValid = SharmoSDK.verifyWebhookSignature(payload, signature, webhookSecret);
  
  if (!isValid) {
    console.error('Invalid webhook signature');
    return res.status(401).send('Invalid signature');
  }
  
  // Process the webhook event based on its type
  console.log(`Received webhook event: ${payload.type}`);
  
  switch (payload.type) {
    case 'property.created':
      console.log('New property created:', payload.data.id);
      // Process the new property
      break;
    case 'token.transferred':
      console.log('Token transferred:', payload.data.token_id);
      // Process the token transfer
      break;
    // Handle other event types
    default:
      console.log('Unhandled event type');
  }
  
  // Acknowledge receipt of the webhook
  res.status(200).send('Webhook received');
});

app.listen(3000, () => {
  console.log('Webhook server listening on port 3000');
});
```

#### Python SDK (with Flask)

```python
from flask import Flask, request, jsonify
import sharmo_sdk

app = Flask(__name__)

# Your webhook secret from the Sharmo Developer Dashboard
webhook_secret = 'your-webhook-secret'

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Sharmo-Signature')
    payload = request.json
    
    # Verify the webhook signature
    is_valid = sharmo_sdk.verify_webhook_signature(payload, signature, webhook_secret)
    
    if not is_valid:
        app.logger.error('Invalid webhook signature')
        return jsonify(error='Invalid signature'), 401
    
    # Process the webhook event based on its type
    app.logger.info(f"Received webhook event: {payload['type']}")
    
    if payload['type'] == 'property.created':
        app.logger.info(f"New property created: {payload['data']['id']}")
        # Process the new property
    elif payload['type'] == 'token.transferred':
        app.logger.info(f"Token transferred: {payload['data']['token_id']}")
        # Process the token transfer
    # Handle other event types
    else:
        app.logger.info('Unhandled event type')
    
    # Acknowledge receipt of the webhook
    return jsonify(success=True), 200

if __name__ == '__main__':
    app.run(port=3000)
```

## Troubleshooting

### Common Issues and Solutions

1. **Authentication Errors**
   - Ensure your API key or credentials are correct
   - Check if your token has expired and needs refreshing
   - Verify you have the necessary permissions

2. **Rate Limiting**
   - Implement exponential backoff for retries
   - Consider caching responses for frequently accessed data
   - Optimize your code to make fewer API calls

3. **Network Issues**
   - Add proper error handling for network failures
   - Implement request timeouts
   - Consider using a library like axios for JavaScript or requests for Python

### Debugging

#### JavaScript SDK

```javascript
// Enable debug logging
const client = new SharmoClient({
  apiKey: 'your-api-key',
  debug: true
});

// Log request details
client.on('request', (request) => {
  console.log('API Request:', request.method, request.url);
  console.log('Request Headers:', request.headers);
});

// Log response details
client.on('response', (response) => {
  console.log('API Response:', response.status);
  console.log('Response Body:', response.data);
});
```

#### Python SDK

```python
import logging

# Enable debug logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('sharmo_sdk')

# Create client with verbose logging
client = sharmo_sdk.create_client(
    api_key='your-api-key',
    verbose=True
)
```

### Getting Help

If you encounter issues not covered in this guide:

1. Check the [API Reference Documentation](https://sharmo.io/developers/api-reference)
2. Browse the [SDK Documentation](https://sharmo.io/developers/sdks)
3. Visit the [Sharmo Developer Forum](https://community.sharmo.io)
4. Contact support at [api-support@sharmo.io](mailto:api-support@sharmo.io)

For bug reports and feature requests, please use our [GitHub Issues](https://github.com/sharmo-io/sharmo-sdk/issues). 