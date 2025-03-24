# Sharmo API Integration Guide

This guide walks you through the process of integrating your application with the Sharmo API to access real estate tokenization features.

## Overview

The Sharmo API provides a comprehensive set of endpoints that allow developers to:

- Access property data and analytics
- Retrieve token information and market data
- View and execute transactions
- Manage user profiles and KYC information
- Access market analytics and trends

## Integration Checklist

Follow these steps to successfully integrate with the Sharmo API:

1. [Register your application](#register-your-application)
2. [Authenticate with the API](#authenticate-with-the-api)
3. [Understand rate limits](#rate-limits)
4. [Handle errors properly](#error-handling)
5. [Implement webhooks (optional)](#webhooks)
6. [Test in sandbox environment](#testing-in-sandbox)
7. [Go live](#going-live)

## Register Your Application

Before you can use the Sharmo API, you need to register your application:

1. Create a developer account at [sharmo.io/developers](https://sharmo.io/developers)
2. Log in to the Developer Dashboard
3. Click "Register New Application"
4. Provide application details:
   - Name: A descriptive name for your application
   - Description: What your application does
   - Redirect URIs: Where users will be redirected after authorization (for OAuth)
   - Application type: Web, Mobile, or Server
5. Submit the form to receive your client credentials

## Authenticate with the API

The Sharmo API supports two authentication methods:

- **OAuth 2.0** - For applications acting on behalf of users
- **API Keys** - For server-to-server integrations

For detailed instructions, see our [Authentication Guide](./api-authentication.md).

## Rate Limits

The Sharmo API implements rate limiting to ensure service stability. Limits vary by endpoint and authentication method:

| API Endpoint Category | Rate Limit (OAuth) | Rate Limit (API Key) |
|-----------------------|--------------------|-----------------------|
| Authentication        | 10 requests/minute | 20 requests/minute    |
| Properties            | 60 requests/minute | 120 requests/minute   |
| Tokens                | 60 requests/minute | 120 requests/minute   |
| Transactions          | 30 requests/minute | 60 requests/minute    |
| Analytics             | 30 requests/minute | 60 requests/minute    |
| Users                 | 30 requests/minute | N/A                   |

Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1628701983
```

To handle rate limits:

1. Monitor the rate limit headers in responses
2. Implement exponential backoff when limits are reached
3. Cache responses when appropriate
4. Batch operations when possible

## Error Handling

The Sharmo API uses standard HTTP status codes and returns detailed error information in the response body:

```json
{
  "code": "validation_error",
  "message": "The property ID format is invalid",
  "details": {
    "field": "property_id",
    "error": "must be a valid UUID"
  }
}
```

Common error codes include:

| HTTP Status | Error Code              | Description                                  |
|-------------|-------------------------|----------------------------------------------|
| 400         | `validation_error`      | Invalid input parameters                     |
| 401         | `unauthenticated`       | Missing or invalid authentication            |
| 403         | `unauthorized`          | Insufficient permissions                     |
| 404         | `not_found`             | Resource not found                           |
| 409         | `conflict`              | Request conflicts with current state         |
| 422         | `unprocessable_entity`  | Request cannot be processed                  |
| 429         | `rate_limit_exceeded`   | Too many requests                            |
| 500         | `server_error`          | Internal server error                        |

Best practices for error handling:

1. Check HTTP status codes first
2. Parse error codes for programmatic handling
3. Display user-friendly messages based on error details
4. Log detailed error information for debugging
5. Implement appropriate retry logic for server errors and rate limits

## Webhooks

Webhooks allow you to receive real-time notifications about events in the Sharmo ecosystem without polling the API.

### Setting Up Webhooks

1. Navigate to the Developer Dashboard
2. Select your application
3. Go to "Webhooks" tab
4. Click "Add Webhook"
5. Configure:
   - URL: Your endpoint that will receive the webhook
   - Events: Select events you want to subscribe to
   - Secret: Generate a secret for signature verification

### Event Types

Sharmo supports webhooks for the following events:

- `property.created` - New property listed
- `property.updated` - Property details updated
- `property.sold` - Property sold
- `token.issued` - New tokens issued
- `token.transferred` - Tokens transferred between wallets
- `transaction.created` - New transaction initiated
- `transaction.completed` - Transaction completed
- `transaction.failed` - Transaction failed
- `user.kyc_verified` - User KYC verification completed

### Handling Webhooks

1. Verify the webhook signature using your secret
2. Process the event data
3. Return a 200 OK response promptly (within 5 seconds)
4. Process any complex operations asynchronously

Example webhook payload:

```json
{
  "id": "evt_123456789",
  "type": "token.transferred",
  "created_at": "2023-08-01T15:30:45Z",
  "data": {
    "token_id": "tok_abcdefghijklmnop",
    "from_address": "0x1234567890abcdef1234567890abcdef12345678",
    "to_address": "0xabcdef1234567890abcdef1234567890abcdef12",
    "amount": 10.5,
    "transaction_id": "txn_qrstuvwxyz"
  }
}
```

## Testing in Sandbox

Before deploying to production, thoroughly test your integration in our sandbox environment:

- Sandbox URL: `https://sandbox-api.sharmo.io/v1`
- Use test credentials from the Developer Dashboard
- Test all API endpoints you plan to use
- Verify error handling and edge cases
- Test webhook processing
- Simulate rate limit scenarios

Test data is available in the sandbox environment to simulate various scenarios. The test data documentation is available in the Developer Dashboard.

## Going Live

Once you've tested your integration in the sandbox environment, follow these steps to go live:

1. Review our [Production Checklist](https://sharmo.io/developers/go-live-checklist)
2. Generate production API credentials in the Developer Dashboard
3. Update your application to use the production API URL
4. Monitor your application logs and dashboard for errors
5. Set up alerts for API errors and rate limit issues
6. Consider implementing a status page to communicate API status to your users

## Best Practices

1. **Caching**: Cache API responses when appropriate to reduce API calls
2. **Pagination**: Use pagination parameters for resource listing endpoints
3. **Filtering**: Use filtering parameters to minimize data transfer
4. **Concurrency**: Implement appropriate concurrency controls
5. **Error Logging**: Log API errors and warnings for monitoring
6. **Security**: Securely store and handle API credentials
7. **Versioning**: Include version in your API requests and watch for deprecation notices
8. **User Experience**: Implement clear error messages and loading states

## Resources

- [API Reference](https://api.sharmo.io/docs)
- [SDK Documentation](./sdks/README.md)
- [Authentication Guide](./api-authentication.md)
- [Sample Applications](https://github.com/sharmo-io/examples)
- [Developer Forum](https://forum.sharmo.io/developers)

## Getting Help

If you encounter any issues or have questions about integrating with the Sharmo API:

- Check our [Developer Documentation](https://sharmo.io/developers/docs)
- Join our [Developer Forum](https://forum.sharmo.io/developers)
- Email our API support team at [api-support@sharmo.io](mailto:api-support@sharmo.io)
- Chat with our team on [Slack](https://sharmo-io.slack.com) (request an invite from the Developer Dashboard) 