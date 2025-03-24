# Sharmo API Authentication

This guide explains how to authenticate with the Sharmo API to obtain and use access tokens for making secure API calls.

## Authentication Methods

The Sharmo API supports two primary authentication methods:

1. **OAuth 2.0 Password Flow** - For user-based access
2. **API Key Authentication** - For server-to-server integrations

Both methods require you to first register your application through the [Sharmo Developer Portal](https://sharmo.io/developers/register).

## OAuth 2.0 Authentication

OAuth 2.0 is recommended for applications that need to access user data or perform actions on behalf of a user. This method provides a secure way to obtain user authorization without exposing their credentials to your application.

### Obtaining Access Tokens

To authenticate a user and receive an access token:

```http
POST https://api.sharmo.io/v1/auth/token
Content-Type: application/json

{
  "grant_type": "password",
  "username": "user@example.com",
  "password": "securepassword"
}
```

A successful response will include:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "def5020061a9ee62553...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Token Refresh

Access tokens expire after a period of time (typically one hour). When an access token expires, you can use the refresh token to obtain a new access token without requiring the user to re-authenticate:

```http
POST https://api.sharmo.io/v1/auth/token
Content-Type: application/json

{
  "grant_type": "refresh_token",
  "refresh_token": "def5020061a9ee62553..."
}
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "ghi8030071b0ff73664...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Using Access Tokens

Include the access token in the `Authorization` header of your API requests:

```http
GET https://api.sharmo.io/v1/properties
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## API Key Authentication

For server-to-server integrations or applications that don't need user-specific access, API Key authentication is recommended.

### Obtaining an API Key

1. Log in to your [Sharmo Developer Dashboard](https://sharmo.io/developers/dashboard)
2. Navigate to "API Keys"
3. Click "Create New API Key"
4. Provide a description for the key
5. Set appropriate permissions based on your use case
6. Copy and securely store the generated API key

### Using API Keys

Include your API key in the `X-API-Key` header of your API requests:

```http
GET https://api.sharmo.io/v1/properties
X-API-Key: sk_live_abcdefghijklmnopqrstuvwxyz123456
```

## Security Best Practices

1. **Never expose access tokens, refresh tokens, or API keys** in client-side code or public repositories.
2. Store tokens securely and encrypt API keys when stored.
3. Implement token refresh logic to handle expired access tokens.
4. Set appropriate scopes and permissions for API keys.
5. Rotate API keys periodically, especially after staff changes.
6. Implement rate limiting on your authentication requests.
7. Use HTTPS for all API communications.

## Error Handling

Common authentication errors:

| HTTP Status | Error Code | Description | Resolution |
|-------------|------------|-------------|------------|
| 401 | `invalid_credentials` | Incorrect username/password | Verify credentials |
| 401 | `invalid_token` | Token is invalid or expired | Refresh the token |
| 401 | `invalid_api_key` | API key is invalid | Check API key format and validity |
| 403 | `insufficient_scope` | Token lacks required permissions | Request appropriate permissions |
| 429 | `too_many_requests` | Rate limit exceeded | Implement exponential backoff |

## Handling Token Expiration

To handle token expiration gracefully:

1. Check response status codes for 401 errors
2. If a 401 error occurs and you have a refresh token, attempt to refresh the access token
3. Retry the original request with the new access token
4. If the refresh fails, prompt the user to re-authenticate

Example pseudocode:

```javascript
async function makeAuthenticatedRequest(url, options) {
  // Add authentication header
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`
  };
  
  // Make the request
  let response = await fetch(url, options);
  
  // If unauthorized error and we have a refresh token
  if (response.status === 401 && refreshToken) {
    // Try to refresh the token
    const newTokens = await refreshAccessToken(refreshToken);
    if (newTokens) {
      // Update tokens
      accessToken = newTokens.access_token;
      refreshToken = newTokens.refresh_token;
      
      // Retry original request with new token
      options.headers['Authorization'] = `Bearer ${accessToken}`;
      response = await fetch(url, options);
    } else {
      // Handle failed refresh (e.g., redirect to login)
      handleAuthenticationFailure();
    }
  }
  
  return response;
}
```

## Need Help?

If you encounter any issues with authentication or have questions, please contact our developer support team at [api-support@sharmo.io](mailto:api-support@sharmo.io). 