# Sharmo API Code Examples

This document provides practical code examples for common operations with the Sharmo API using our official SDKs and direct API calls.

## Table of Contents

- [Authentication](#authentication)
- [Properties](#properties)
- [Tokens](#tokens)
- [Transactions](#transactions)
- [Analytics](#analytics)
- [Users](#users)
- [Error Handling](#error-handling)
- [Webhooks](#webhooks)

## Authentication

### JavaScript SDK

```javascript
// Initialize the client
const { SharmoClient } = SharmoSDK;

// Using username/password
const client = new SharmoClient({
  apiKey: 'your-api-key',  // Optional when using username/password
  baseUrl: 'https://api.sharmo.io',
  version: 'v1'
});

// Authenticate with username and password
async function authenticateUser() {
  try {
    const authResult = await client.authenticate('user@example.com', 'password123');
    console.log('Authentication successful:', authResult);
    // Store tokens securely
    localStorage.setItem('accessToken', authResult.access_token);
    localStorage.setItem('refreshToken', authResult.refresh_token);
    return authResult;
  } catch (error) {
    console.error('Authentication failed:', error);
    return null;
  }
}

// Initialize with existing tokens
const clientWithTokens = new SharmoClient({
  accessToken: 'existing-access-token',
  refreshToken: 'existing-refresh-token',
  onTokenRefresh: (tokens) => {
    // Store new tokens when they're refreshed
    localStorage.setItem('accessToken', tokens.access_token);
    localStorage.setItem('refreshToken', tokens.refresh_token);
  }
});
```

### Python SDK

```python
import sharmo_sdk

# Using API key
client = sharmo_sdk.create_client(
    api_key='your-api-key',
    api_secret='your-api-secret'
)

# Using username/password
def authenticate_user():
    try:
        client = sharmo_sdk.create_client()
        auth_result = client.authenticate('user@example.com', 'password123')
        print(f"Authentication successful: {auth_result}")
        # Store tokens securely
        return auth_result
    except sharmo_sdk.SharmoError as e:
        print(f"Authentication failed: {e}")
        return None

# Using existing tokens
def create_client_with_tokens(access_token, refresh_token):
    def token_refresh_callback(tokens):
        # Store new tokens when they're refreshed
        print(f"Tokens refreshed: {tokens}")
        # Update your token storage here
        
    return sharmo_sdk.create_client(
        access_token=access_token,
        refresh_token=refresh_token,
        on_token_refresh=token_refresh_callback
    )
```

### Direct API Calls

```bash
# Using curl to authenticate
curl -X POST https://api.sharmo.io/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "password",
    "username": "user@example.com",
    "password": "password123"
  }'

# Response:
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "refresh_token": "def5020061a9ee62553...",
#   "token_type": "bearer",
#   "expires_in": 3600
# }
```

## Properties

### JavaScript SDK

```javascript
// List properties
async function listProperties() {
  try {
    const properties = await client.properties.list({
      page: 1,
      per_page: 20,
      sort_by: 'price',
      sort_order: 'desc'
    });
    console.log(`Found ${properties.data.length} properties`);
    return properties;
  } catch (error) {
    console.error('Error listing properties:', error);
    return null;
  }
}

// Get property details
async function getPropertyDetails(propertyId) {
  try {
    const property = await client.properties.get(propertyId);
    console.log(`Property details for ${property.name}:`, property);
    return property;
  } catch (error) {
    console.error(`Error getting property ${propertyId}:`, error);
    return null;
  }
}

// Search properties
async function searchProperties() {
  try {
    const searchResults = await client.properties.search({
      location: 'New York',
      min_price: 100000,
      max_price: 500000,
      property_type: 'residential'
    });
    console.log(`Found ${searchResults.data.length} matching properties`);
    return searchResults;
  } catch (error) {
    console.error('Error searching properties:', error);
    return null;
  }
}

// Get property analytics
async function getPropertyAnalytics(propertyId) {
  try {
    const analytics = await client.properties.getAnalytics(propertyId);
    console.log('Property analytics:', analytics);
    return analytics;
  } catch (error) {
    console.error(`Error getting analytics for property ${propertyId}:`, error);
    return null;
  }
}
```

### Python SDK

```python
# List properties
def list_properties():
    try:
        properties = client.properties.list(
            page=1,
            per_page=20,
            sort_by='price',
            sort_order='desc'
        )
        print(f"Found {len(properties['data'])} properties")
        return properties
    except sharmo_sdk.SharmoError as e:
        print(f"Error listing properties: {e}")
        return None

# Get property details
def get_property_details(property_id):
    try:
        property_data = client.properties.get(property_id)
        print(f"Property details for {property_data['name']}:", property_data)
        return property_data
    except sharmo_sdk.SharmoError as e:
        print(f"Error getting property {property_id}: {e}")
        return None

# Search properties
def search_properties():
    try:
        search_results = client.properties.search({
            "location": "New York",
            "min_price": 100000,
            "max_price": 500000,
            "property_type": "residential"
        })
        print(f"Found {len(search_results['data'])} matching properties")
        return search_results
    except sharmo_sdk.SharmoError as e:
        print(f"Error searching properties: {e}")
        return None

# Get property analytics
def get_property_analytics(property_id):
    try:
        analytics = client.properties.get_analytics(property_id)
        print("Property analytics:", analytics)
        return analytics
    except sharmo_sdk.SharmoError as e:
        print(f"Error getting analytics for property {property_id}: {e}")
        return None
```

### Direct API Calls

```bash
# List properties
curl -X GET https://api.sharmo.io/v1/properties?page=1&per_page=20&sort_by=price&sort_order=desc \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
  
# Get property details
curl -X GET https://api.sharmo.io/v1/properties/PROPERTY_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
  
# Search properties
curl -X POST https://api.sharmo.io/v1/properties/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "location": "New York",
    "min_price": 100000,
    "max_price": 500000,
    "property_type": "residential"
  }'
```

## Tokens

### JavaScript SDK

```javascript
// List tokens
async function listTokens() {
  try {
    const tokens = await client.tokens.list({
      page: 1,
      per_page: 20,
      sort_by: 'price',
      sort_order: 'desc'
    });
    console.log(`Found ${tokens.data.length} tokens`);
    return tokens;
  } catch (error) {
    console.error('Error listing tokens:', error);
    return null;
  }
}

// Get token details
async function getTokenDetails(tokenId) {
  try {
    const token = await client.tokens.get(tokenId);
    console.log(`Token details for ${token.symbol}:`, token);
    return token;
  } catch (error) {
    console.error(`Error getting token ${tokenId}:`, error);
    return null;
  }
}

// Get token price history
async function getTokenPriceHistory(tokenId) {
  try {
    const priceHistory = await client.tokens.getPriceHistory(tokenId, {
      start_date: '2023-01-01',
      end_date: '2023-08-01',
      interval: 'day'
    });
    console.log(`Fetched ${priceHistory.length} price points for token ${tokenId}`);
    return priceHistory;
  } catch (error) {
    console.error(`Error getting price history for token ${tokenId}:`, error);
    return null;
  }
}

// Get tokens by owner
async function getTokensByOwner(address) {
  try {
    const tokens = await client.tokens.getByOwner(address);
    console.log(`Found ${tokens.length} tokens owned by ${address}`);
    return tokens;
  } catch (error) {
    console.error(`Error getting tokens for address ${address}:`, error);
    return null;
  }
}
```

### Python SDK

```python
# List tokens
def list_tokens():
    try:
        tokens = client.tokens.list(
            page=1,
            per_page=20,
            sort_by='price',
            sort_order='desc'
        )
        print(f"Found {len(tokens['data'])} tokens")
        return tokens
    except sharmo_sdk.SharmoError as e:
        print(f"Error listing tokens: {e}")
        return None

# Get token details
def get_token_details(token_id):
    try:
        token = client.tokens.get(token_id)
        print(f"Token details for {token['symbol']}:", token)
        return token
    except sharmo_sdk.SharmoError as e:
        print(f"Error getting token {token_id}: {e}")
        return None

# Get token price history
def get_token_price_history(token_id):
    try:
        price_history = client.tokens.get_price_history(
            token_id,
            start_date='2023-01-01',
            end_date='2023-08-01',
            interval='day'
        )
        print(f"Fetched {len(price_history)} price points for token {token_id}")
        return price_history
    except sharmo_sdk.SharmoError as e:
        print(f"Error getting price history for token {token_id}: {e}")
        return None

# Get tokens by owner
def get_tokens_by_owner(address):
    try:
        tokens = client.tokens.get_by_owner(address)
        print(f"Found {len(tokens)} tokens owned by {address}")
        return tokens
    except sharmo_sdk.SharmoError as e:
        print(f"Error getting tokens for address {address}: {e}")
        return None
```

## Transactions

### JavaScript SDK

```javascript
// List transactions
async function listTransactions() {
  try {
    const transactions = await client.transactions.list({
      page: 1,
      per_page: 20,
      sort_by: 'created_at',
      sort_order: 'desc'
    });
    console.log(`Found ${transactions.data.length} transactions`);
    return transactions;
  } catch (error) {
    console.error('Error listing transactions:', error);
    return null;
  }
}

// Get transaction details
async function getTransactionDetails(transactionId) {
  try {
    const transaction = await client.transactions.get(transactionId);
    console.log(`Transaction details for ${transactionId}:`, transaction);
    return transaction;
  } catch (error) {
    console.error(`Error getting transaction ${transactionId}:`, error);
    return null;
  }
}

// Get transactions by property
async function getTransactionsByProperty(propertyId) {
  try {
    const transactions = await client.transactions.getByProperty(propertyId);
    console.log(`Found ${transactions.length} transactions for property ${propertyId}`);
    return transactions;
  } catch (error) {
    console.error(`Error getting transactions for property ${propertyId}:`, error);
    return null;
  }
}
```

### Python SDK

```python
# List transactions
def list_transactions():
    try:
        transactions = client.transactions.list(
            page=1,
            per_page=20,
            sort_by='created_at',
            sort_order='desc'
        )
        print(f"Found {len(transactions['data'])} transactions")
        return transactions
    except sharmo_sdk.SharmoError as e:
        print(f"Error listing transactions: {e}")
        return None

# Get transaction details
def get_transaction_details(transaction_id):
    try:
        transaction = client.transactions.get(transaction_id)
        print(f"Transaction details for {transaction_id}:", transaction)
        return transaction
    except sharmo_sdk.SharmoError as e:
        print(f"Error getting transaction {transaction_id}: {e}")
        return None

# Get transactions by property
def get_transactions_by_property(property_id):
    try:
        transactions = client.transactions.get_by_property(property_id)
        print(f"Found {len(transactions)} transactions for property {property_id}")
        return transactions
    except sharmo_sdk.SharmoError as e:
        print(f"Error getting transactions for property {property_id}: {e}")
        return None
```

## Analytics

### JavaScript SDK

```javascript
// Get platform statistics
async function getPlatformStats() {
  try {
    const stats = await client.analytics.getPlatformStats();
    console.log('Platform statistics:', stats);
    return stats;
  } catch (error) {
    console.error('Error getting platform stats:', error);
    return null;
  }
}

// Get market overview
async function getMarketOverview() {
  try {
    const market = await client.analytics.getMarketOverview();
    console.log('Market overview:', market);
    return market;
  } catch (error) {
    console.error('Error getting market overview:', error);
    return null;
  }
}

// Get trending properties
async function getTrendingProperties(limit = 10) {
  try {
    const properties = await client.analytics.getTrendingProperties(limit);
    console.log(`Top ${properties.length} trending properties:`, properties);
    return properties;
  } catch (error) {
    console.error('Error getting trending properties:', error);
    return null;
  }
}

// Get region analytics
async function getRegionAnalytics(regionCode) {
  try {
    const analytics = await client.analytics.getRegionAnalytics(regionCode);
    console.log(`Analytics for region ${regionCode}:`, analytics);
    return analytics;
  } catch (error) {
    console.error(`Error getting analytics for region ${regionCode}:`, error);
    return null;
  }
}
```

### Python SDK

```python
# Get platform statistics
def get_platform_stats():
    try:
        stats = client.analytics.get_platform_stats()
        print("Platform statistics:", stats)
        return stats
    except sharmo_sdk.SharmoError as e:
        print(f"Error getting platform stats: {e}")
        return None

# Get market overview
def get_market_overview():
    try:
        market = client.analytics.get_market_overview()
        print("Market overview:", market)
        return market
    except sharmo_sdk.SharmoError as e:
        print(f"Error getting market overview: {e}")
        return None

# Get trending properties
def get_trending_properties(limit=10):
    try:
        properties = client.analytics.get_trending_properties(limit)
        print(f"Top {len(properties)} trending properties:", properties)
        return properties
    except sharmo_sdk.SharmoError as e:
        print(f"Error getting trending properties: {e}")
        return None

# Get region analytics
def get_region_analytics(region_code):
    try:
        analytics = client.analytics.get_region_analytics(region_code)
        print(f"Analytics for region {region_code}:", analytics)
        return analytics
    except sharmo_sdk.SharmoError as e:
        print(f"Error getting analytics for region {region_code}: {e}")
        return None
```

## Users

### JavaScript SDK

```javascript
// Get user profile
async function getUserProfile() {
  try {
    const profile = await client.users.getProfile();
    console.log('User profile:', profile);
    return profile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// Update user profile
async function updateUserProfile(data) {
  try {
    const updatedProfile = await client.users.updateProfile(data);
    console.log('Updated profile:', updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}

// Get KYC status
async function getKycStatus() {
  try {
    const kycStatus = await client.users.getKycStatus();
    console.log('KYC status:', kycStatus);
    return kycStatus;
  } catch (error) {
    console.error('Error getting KYC status:', error);
    return null;
  }
}

// Submit KYC information
async function submitKyc(kycData) {
  try {
    const result = await client.users.submitKyc(kycData);
    console.log('KYC submission result:', result);
    return result;
  } catch (error) {
    console.error('Error submitting KYC information:', error);
    return null;
  }
}
```

### Python SDK

```python
# Get user profile
def get_user_profile():
    try:
        profile = client.users.get_profile()
        print("User profile:", profile)
        return profile
    except sharmo_sdk.SharmoError as e:
        print(f"Error getting user profile: {e}")
        return None

# Update user profile
def update_user_profile(data):
    try:
        updated_profile = client.users.update_profile(data)
        print("Updated profile:", updated_profile)
        return updated_profile
    except sharmo_sdk.SharmoError as e:
        print(f"Error updating user profile: {e}")
        return None

# Get KYC status
def get_kyc_status():
    try:
        kyc_status = client.users.get_kyc_status()
        print("KYC status:", kyc_status)
        return kyc_status
    except sharmo_sdk.SharmoError as e:
        print(f"Error getting KYC status: {e}")
        return None

# Submit KYC information
def submit_kyc(kyc_data):
    try:
        result = client.users.submit_kyc(kyc_data)
        print("KYC submission result:", result)
        return result
    except sharmo_sdk.SharmoError as e:
        print(f"Error submitting KYC information: {e}")
        return None
```

## Error Handling

### JavaScript SDK

```javascript
async function robustApiCall() {
  try {
    // Make API call
    const result = await client.properties.list();
    return result;
  } catch (error) {
    if (error.code === 'NETWORK_ERROR') {
      console.error('Network error, please check your connection');
    } else if (error.code === 'AUTH_ERROR') {
      console.error('Authentication error, please log in again');
      // Redirect to login page or refresh token
    } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
      console.error('Rate limit exceeded, please try again later');
      // Implement exponential backoff
    } else {
      console.error('Unexpected error:', error.message);
    }
    
    // You can access more details if available
    if (error.response) {
      console.error('Error details:', error.response.data);
      console.error('HTTP status:', error.response.status);
    }
    
    return null;
  }
}
```

### Python SDK

```python
def robust_api_call():
    try:
        # Make API call
        result = client.properties.list()
        return result
    except sharmo_sdk.SharmoError as e:
        if e.code == 'NETWORK_ERROR':
            print('Network error, please check your connection')
        elif e.code == 'AUTH_ERROR':
            print('Authentication error, please log in again')
            # Redirect to login page or refresh token
        elif e.code == 'RATE_LIMIT_EXCEEDED':
            print('Rate limit exceeded, please try again later')
            # Implement exponential backoff
        else:
            print(f'Unexpected error: {e.message}')
        
        # You can access more details if available
        if e.response_data:
            print(f'Error details: {e.response_data}')
            print(f'HTTP status: {e.http_status}')
        
        return None
```

## Webhooks

### JavaScript (Express.js) Example

```javascript
const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();

// Parse JSON bodies
app.use(bodyParser.json());

// Your webhook secret from Sharmo Developer Dashboard
const webhookSecret = 'your_webhook_secret';

// Verify webhook signature
function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', webhookSecret);
  const digest = hmac.update(JSON.stringify(payload)).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  );
}

// Webhook endpoint
app.post('/sharmo-webhook', (req, res) => {
  const signature = req.headers['x-sharmo-signature'];
  
  // Verify the signature
  if (!signature || !verifySignature(req.body, signature)) {
    console.error('Invalid webhook signature');
    return res.status(401).send('Invalid signature');
  }
  
  // Process the webhook event
  const event = req.body;
  console.log(`Received webhook event: ${event.type}`);
  
  // Handle different event types
  switch (event.type) {
    case 'property.created':
      handlePropertyCreated(event.data);
      break;
    case 'token.transferred':
      handleTokenTransferred(event.data);
      break;
    case 'transaction.completed':
      handleTransactionCompleted(event.data);
      break;
    // Add more event types as needed
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  // Acknowledge receipt of the webhook
  res.status(200).send('Webhook received');
});

// Event handlers
function handlePropertyCreated(data) {
  console.log(`New property created: ${data.id} - ${data.name}`);
  // Add your business logic here
}

function handleTokenTransferred(data) {
  console.log(`Token transfer: ${data.amount} of ${data.token_id} from ${data.from_address} to ${data.to_address}`);
  // Add your business logic here
}

function handleTransactionCompleted(data) {
  console.log(`Transaction completed: ${data.transaction_id}`);
  // Add your business logic here
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});
```

### Python (Flask) Example

```python
from flask import Flask, request, jsonify
import hmac
import hashlib
import json

app = Flask(__name__)

# Your webhook secret from Sharmo Developer Dashboard
WEBHOOK_SECRET = 'your_webhook_secret'

# Verify webhook signature
def verify_signature(payload, signature):
    expected_signature = hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        json.dumps(payload).encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected_signature, signature)

# Webhook endpoint
@app.route('/sharmo-webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Sharmo-Signature')
    
    # Verify the signature
    if not signature or not verify_signature(request.json, signature):
        app.logger.error('Invalid webhook signature')
        return jsonify(error='Invalid signature'), 401
    
    # Process the webhook event
    event = request.json
    app.logger.info(f"Received webhook event: {event['type']}")
    
    # Handle different event types
    if event['type'] == 'property.created':
        handle_property_created(event['data'])
    elif event['type'] == 'token.transferred':
        handle_token_transferred(event['data'])
    elif event['type'] == 'transaction.completed':
        handle_transaction_completed(event['data'])
    else:
        app.logger.info(f"Unhandled event type: {event['type']}")
    
    # Acknowledge receipt of the webhook
    return jsonify(success=True), 200

# Event handlers
def handle_property_created(data):
    app.logger.info(f"New property created: {data['id']} - {data['name']}")
    # Add your business logic here

def handle_token_transferred(data):
    app.logger.info(f"Token transfer: {data['amount']} of {data['token_id']} from {data['from_address']} to {data['to_address']}")
    # Add your business logic here

def handle_transaction_completed(data):
    app.logger.info(f"Transaction completed: {data['transaction_id']}")
    # Add your business logic here

if __name__ == '__main__':
    app.run(port=3000, debug=True)
```

## Additional Resources

For more code examples and sample applications, visit:

- [GitHub Examples Repository](https://github.com/sharmo-io/examples)
- [Interactive API Explorer](https://api.sharmo.io/explorer)
- [SDK Documentation](https://sharmo.io/developers/sdks)

If you have questions or need help, reach out to our developer support team at [api-support@sharmo.io](mailto:api-support@sharmo.io). 