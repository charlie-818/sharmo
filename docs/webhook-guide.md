# Sharmo Webhooks Implementation Guide

This guide provides detailed instructions for implementing webhooks to receive real-time notifications from the Sharmo platform.

## Table of Contents

- [Introduction](#introduction)
- [Setting Up Webhooks](#setting-up-webhooks)
- [Security and Verification](#security-and-verification)
- [Webhook Events](#webhook-events)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Sample Implementations](#sample-implementations)

## Introduction

Sharmo webhooks allow your application to receive real-time notifications about events that occur on the platform. Instead of continuously polling the API for updates, webhooks push data to your server as events happen, enabling you to build responsive, event-driven applications.

### Key Benefits

- **Real-time Updates**: Receive notifications immediately when events occur
- **Reduced API Load**: Minimize API requests by eliminating the need for polling
- **Event-driven Architecture**: Build responsive applications that react to platform events

## Setting Up Webhooks

### 1. Create a Webhook Endpoint

First, create an endpoint on your server to receive webhook notifications. This should be a publicly accessible URL that can receive HTTP POST requests.

Example URL: `https://your-domain.com/api/sharmo-webhooks`

### 2. Register Your Webhook in the Developer Dashboard

1. Log in to the [Sharmo Developer Dashboard](https://sharmo.io/developers/dashboard)
2. Navigate to the "Webhooks" section
3. Click "Add Webhook"
4. Enter your endpoint URL
5. Select the events you want to subscribe to
6. Save your webhook configuration

### 3. Receive a Verification Request

After registering your webhook, Sharmo will send a verification request to your endpoint with the following payload:

```json
{
  "type": "webhook.verification",
  "data": {
    "challenge": "abc123xyz456"
  }
}
```

Your endpoint should respond with a 200 status code and the challenge value in the following format:

```json
{
  "challenge": "abc123xyz456"
}
```

### 4. Store Your Webhook Secret

Upon successful verification, you'll receive a webhook secret. **Keep this secret secure** as you'll need it to verify incoming webhooks.

## Security and Verification

### Verifying Webhook Signatures

All webhook requests from Sharmo include a signature in the `X-Sharmo-Signature` header. You should verify this signature to ensure the webhook is legitimate.

#### JavaScript Example

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

// Usage in an Express.js handler
app.post('/api/sharmo-webhooks', (req, res) => {
  const signature = req.headers['x-sharmo-signature'];
  
  if (!signature || !verifyWebhookSignature(req.body, signature, webhookSecret)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook...
  res.status(200).send('Webhook received');
});
```

#### Python Example

```python
import hmac
import hashlib
import json

def verify_webhook_signature(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        json.dumps(payload).encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_signature, signature)

# Usage in a Flask handler
@app.route('/api/sharmo-webhooks', methods=['POST'])
def webhook_handler():
    signature = request.headers.get('X-Sharmo-Signature')
    
    if not signature or not verify_webhook_signature(request.json, signature, webhook_secret):
        return jsonify(error='Invalid signature'), 401
    
    # Process webhook...
    return jsonify(success=True), 200
```

### Additional Security Considerations

1. **Use HTTPS**: Always use HTTPS for your webhook endpoint to ensure encrypted communication
2. **IP Whitelisting**: Optionally, whitelist Sharmo IP addresses (available in the Developer Dashboard)
3. **Timeout Handling**: Set appropriate timeouts for webhook processing
4. **Request Validation**: Validate the structure and content of webhook payloads

## Webhook Events

Sharmo webhooks follow a consistent event structure:

```json
{
  "id": "evt_123456789",
  "type": "event.type",
  "created_at": "2023-08-15T14:23:45Z",
  "data": {
    // Event-specific data
  }
}
```

### Available Event Types

#### Property Events

| Event Type | Description |
|------------|-------------|
| `property.created` | A new property has been added to the platform |
| `property.updated` | A property's details have been updated |
| `property.status_changed` | A property's status has changed (e.g., from "pending" to "active") |
| `property.deleted` | A property has been removed from the platform |

#### Token Events

| Event Type | Description |
|------------|-------------|
| `token.created` | A new token has been created |
| `token.transferred` | Tokens have been transferred from one owner to another |
| `token.price_changed` | A token's price has changed |
| `token.offering_started` | A new token offering has started |
| `token.offering_ended` | A token offering has ended |

#### Transaction Events

| Event Type | Description |
|------------|-------------|
| `transaction.created` | A new transaction has been initiated |
| `transaction.completed` | A transaction has been completed |
| `transaction.failed` | A transaction has failed |
| `transaction.refunded` | A transaction has been refunded |

#### User Events

| Event Type | Description |
|------------|-------------|
| `user.registered` | A new user has registered |
| `user.kyc_submitted` | A user has submitted KYC documents |
| `user.kyc_approved` | A user's KYC has been approved |
| `user.kyc_rejected` | A user's KYC has been rejected |

#### Platform Events

| Event Type | Description |
|------------|-------------|
| `platform.maintenance_scheduled` | Platform maintenance has been scheduled |
| `platform.feature_launched` | A new platform feature has been launched |

### Event Payload Examples

#### `property.created` Event

```json
{
  "id": "evt_123456789",
  "type": "property.created",
  "created_at": "2023-08-15T14:23:45Z",
  "data": {
    "property_id": "prop_abc123",
    "name": "Skyline Tower - Commercial Office",
    "address": "123 Main Street, New York, NY 10001",
    "property_type": "commercial",
    "total_value": 5000000,
    "total_tokens": 5000,
    "status": "pending"
  }
}
```

#### `token.transferred` Event

```json
{
  "id": "evt_987654321",
  "type": "token.transferred",
  "created_at": "2023-08-15T16:45:22Z",
  "data": {
    "token_id": "tok_xyz789",
    "from_address": "0x1234567890abcdef1234567890abcdef12345678",
    "to_address": "0xabcdef1234567890abcdef1234567890abcdef12",
    "amount": 10,
    "transaction_id": "txn_456def",
    "timestamp": "2023-08-15T16:45:20Z"
  }
}
```

#### `transaction.completed` Event

```json
{
  "id": "evt_456789123",
  "type": "transaction.completed",
  "created_at": "2023-08-15T17:30:15Z",
  "data": {
    "transaction_id": "txn_456def",
    "transaction_type": "purchase",
    "token_id": "tok_xyz789",
    "amount": 10,
    "price_per_token": 1000,
    "total_amount": 10000,
    "buyer_address": "0xabcdef1234567890abcdef1234567890abcdef12",
    "seller_address": "0x1234567890abcdef1234567890abcdef12345678",
    "timestamp": "2023-08-15T17:30:10Z",
    "status": "completed"
  }
}
```

## Best Practices

### Implementation Recommendations

1. **Respond Quickly**: Return a 2xx response as soon as possible, ideally within 3 seconds
2. **Process Asynchronously**: Move time-consuming operations to background jobs
3. **Store Events**: Store the raw webhook data for debugging and reprocessing if needed
4. **Implement Idempotency**: Handle duplicate events gracefully by checking the event ID
5. **Handle Retries**: Be prepared to receive the same event multiple times
6. **Monitor Failures**: Set up monitoring for webhook failures
7. **Log Payloads**: Log webhook payloads for debugging, but be mindful of sensitive data

### Handling Webhook Delivery Issues

Sharmo automatically retries failed webhook deliveries with an exponential backoff:

- First retry: 5 minutes after the initial attempt
- Second retry: 15 minutes after the first retry
- Third retry: 30 minutes after the second retry
- Fourth retry: 1 hour after the third retry
- Fifth retry: 2 hours after the fourth retry

After 5 failed attempts, the webhook will be marked as failed and will not be retried automatically.

### Viewing Webhook Logs

You can view the delivery status and logs for your webhooks in the Developer Dashboard under the "Webhooks" section. This includes:

- Delivery timestamp
- Status code returned by your endpoint
- Response body (truncated)
- Retry attempts
- Failure reasons

## Troubleshooting

### Common Issues

1. **Invalid Signature Errors**
   - Verify you're using the correct webhook secret
   - Ensure you're using the raw request body for signature verification
   - Check that your signature verification uses the correct algorithm (SHA-256)

2. **Timeout Errors**
   - Ensure your endpoint responds within 10 seconds
   - Move processing to a background job
   - Return a 200 response immediately and process the webhook asynchronously

3. **Duplicate Events**
   - Implement idempotency by storing processed event IDs
   - Deduplicate events based on the event ID

4. **Missing Events**
   - Check your webhook logs in the Developer Dashboard
   - Verify your endpoint is publicly accessible
   - Ensure your server isn't blocking requests from Sharmo IP addresses

### Testing Webhooks

You can test your webhook integration using the Developer Dashboard:

1. Navigate to the "Webhooks" section
2. Select the webhook you want to test
3. Click "Send Test Event"
4. Select an event type and customize the data if needed
5. Click "Send"

## Sample Implementations

### Express.js (Node.js)

```javascript
const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();

// Raw body for signature verification
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Your webhook secret from the Sharmo Developer Dashboard
const webhookSecret = 'whsec_abcdef123456789';

// Store processed event IDs to prevent duplicate processing
const processedEvents = new Set();

// Verify webhook signature
function verifySignature(payload, signature) {
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

// Webhook endpoint
app.post('/api/sharmo-webhooks', (req, res) => {
  const signature = req.headers['x-sharmo-signature'];
  const payload = req.body;
  
  // Verify the signature
  if (!signature || !verifySignature(payload, signature)) {
    console.error('Invalid webhook signature');
    return res.status(401).send('Invalid signature');
  }
  
  // Handle the verification challenge
  if (payload.type === 'webhook.verification') {
    return res.status(200).json({ challenge: payload.data.challenge });
  }
  
  // Check for duplicate events
  if (processedEvents.has(payload.id)) {
    console.log(`Duplicate event: ${payload.id}`);
    return res.status(200).send('Event already processed');
  }
  
  // Store the event ID
  processedEvents.add(payload.id);
  
  // Respond immediately
  res.status(200).send('Webhook received');
  
  // Process the webhook event asynchronously
  processWebhookAsync(payload).catch(error => {
    console.error('Error processing webhook:', error);
  });
});

// Asynchronous webhook processing
async function processWebhookAsync(payload) {
  console.log(`Processing webhook: ${payload.type}`);
  
  switch (payload.type) {
    case 'property.created':
      await handlePropertyCreated(payload.data);
      break;
    case 'token.transferred':
      await handleTokenTransferred(payload.data);
      break;
    case 'transaction.completed':
      await handleTransactionCompleted(payload.data);
      break;
    // Handle other event types
    default:
      console.log(`Unhandled event type: ${payload.type}`);
  }
}

// Event handlers
async function handlePropertyCreated(data) {
  console.log(`New property created: ${data.property_id} - ${data.name}`);
  // Implement your business logic here
}

async function handleTokenTransferred(data) {
  console.log(`Token transfer: ${data.amount} of ${data.token_id} from ${data.from_address} to ${data.to_address}`);
  // Implement your business logic here
}

async function handleTransactionCompleted(data) {
  console.log(`Transaction completed: ${data.transaction_id}`);
  // Implement your business logic here
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});
```

### Flask (Python)

```python
from flask import Flask, request, jsonify
import hmac
import hashlib
import json
import threading

app = Flask(__name__)

# Your webhook secret from the Sharmo Developer Dashboard
WEBHOOK_SECRET = 'whsec_abcdef123456789'

# Store processed event IDs to prevent duplicate processing
processed_events = set()

# Verify webhook signature
def verify_signature(payload, signature):
    expected_signature = hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        json.dumps(payload).encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_signature, signature)

# Asynchronous webhook processing
def process_webhook_async(payload):
    app.logger.info(f"Processing webhook: {payload['type']}")
    
    if payload['type'] == 'property.created':
        handle_property_created(payload['data'])
    elif payload['type'] == 'token.transferred':
        handle_token_transferred(payload['data'])
    elif payload['type'] == 'transaction.completed':
        handle_transaction_completed(payload['data'])
    else:
        app.logger.info(f"Unhandled event type: {payload['type']}")

# Event handlers
def handle_property_created(data):
    app.logger.info(f"New property created: {data['property_id']} - {data['name']}")
    # Implement your business logic here

def handle_token_transferred(data):
    app.logger.info(f"Token transfer: {data['amount']} of {data['token_id']} from {data['from_address']} to {data['to_address']}")
    # Implement your business logic here

def handle_transaction_completed(data):
    app.logger.info(f"Transaction completed: {data['transaction_id']}")
    # Implement your business logic here

# Webhook endpoint
@app.route('/api/sharmo-webhooks', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Sharmo-Signature')
    payload = request.json
    
    # Verify the signature
    if not signature or not verify_signature(payload, signature):
        app.logger.error('Invalid webhook signature')
        return jsonify(error='Invalid signature'), 401
    
    # Handle the verification challenge
    if payload['type'] == 'webhook.verification':
        return jsonify(challenge=payload['data']['challenge']), 200
    
    # Check for duplicate events
    if payload['id'] in processed_events:
        app.logger.info(f"Duplicate event: {payload['id']}")
        return jsonify(message='Event already processed'), 200
    
    # Store the event ID
    processed_events.add(payload['id'])
    
    # Respond immediately
    response = jsonify(message='Webhook received')
    
    # Process the webhook event asynchronously
    threading.Thread(target=process_webhook_async, args=(payload,)).start()
    
    return response, 200

if __name__ == '__main__':
    app.run(port=3000, debug=True)
```

### .NET (C#)

```csharp
using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace SharmoWebhooks
{
    public class Startup
    {
        // Your webhook secret from the Sharmo Developer Dashboard
        private const string WebhookSecret = "whsec_abcdef123456789";
        
        // Store processed event IDs to prevent duplicate processing
        private static readonly HashSet<string> ProcessedEvents = new HashSet<string>();

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapPost("/api/sharmo-webhooks", HandleWebhook);
            });
        }

        private async Task HandleWebhook(HttpContext context)
        {
            // Get the signature from the header
            if (!context.Request.Headers.TryGetValue("X-Sharmo-Signature", out var signatureValues))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Missing signature");
                return;
            }

            string signature = signatureValues[0];

            // Read and parse the request body
            string requestBody;
            using (var reader = new StreamReader(context.Request.Body))
            {
                requestBody = await reader.ReadToEndAsync();
            }

            var payload = JsonConvert.DeserializeObject<JObject>(requestBody);

            // Verify the signature
            if (!VerifySignature(requestBody, signature))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Invalid signature");
                return;
            }

            // Handle the verification challenge
            if (payload["type"].ToString() == "webhook.verification")
            {
                var challenge = payload["data"]["challenge"].ToString();
                context.Response.StatusCode = 200;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync($"{{\"challenge\":\"{challenge}\"}}");
                return;
            }

            // Check for duplicate events
            string eventId = payload["id"].ToString();
            if (ProcessedEvents.Contains(eventId))
            {
                context.Response.StatusCode = 200;
                await context.Response.WriteAsync("Event already processed");
                return;
            }

            // Store the event ID
            ProcessedEvents.Add(eventId);

            // Respond immediately
            context.Response.StatusCode = 200;
            await context.Response.WriteAsync("Webhook received");

            // Process the webhook event asynchronously
            _ = Task.Run(() => ProcessWebhookAsync(payload));
        }

        private bool VerifySignature(string payload, string signature)
        {
            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(WebhookSecret)))
            {
                var payloadBytes = Encoding.UTF8.GetBytes(payload);
                var hash = hmac.ComputeHash(payloadBytes);
                var computedSignature = BitConverter.ToString(hash).Replace("-", "").ToLower();
                
                return computedSignature == signature;
            }
        }

        private async Task ProcessWebhookAsync(JObject payload)
        {
            string eventType = payload["type"].ToString();
            Console.WriteLine($"Processing webhook: {eventType}");

            switch (eventType)
            {
                case "property.created":
                    await HandlePropertyCreated(payload["data"] as JObject);
                    break;
                case "token.transferred":
                    await HandleTokenTransferred(payload["data"] as JObject);
                    break;
                case "transaction.completed":
                    await HandleTransactionCompleted(payload["data"] as JObject);
                    break;
                default:
                    Console.WriteLine($"Unhandled event type: {eventType}");
                    break;
            }
        }

        private Task HandlePropertyCreated(JObject data)
        {
            string propertyId = data["property_id"].ToString();
            string name = data["name"].ToString();
            Console.WriteLine($"New property created: {propertyId} - {name}");
            
            // Implement your business logic here
            
            return Task.CompletedTask;
        }

        private Task HandleTokenTransferred(JObject data)
        {
            string tokenId = data["token_id"].ToString();
            string fromAddress = data["from_address"].ToString();
            string toAddress = data["to_address"].ToString();
            int amount = data["amount"].Value<int>();
            
            Console.WriteLine($"Token transfer: {amount} of {tokenId} from {fromAddress} to {toAddress}");
            
            // Implement your business logic here
            
            return Task.CompletedTask;
        }

        private Task HandleTransactionCompleted(JObject data)
        {
            string transactionId = data["transaction_id"].ToString();
            Console.WriteLine($"Transaction completed: {transactionId}");
            
            // Implement your business logic here
            
            return Task.CompletedTask;
        }
    }

    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
```

## Additional Resources

- [API Reference Documentation](https://sharmo.io/developers/api-reference)
- [Developer Dashboard](https://sharmo.io/developers/dashboard)
- [API Integration Guide](https://sharmo.io/developers/integration-guide)
- [Community Forum](https://community.sharmo.io)
- [Support Contact](mailto:api-support@sharmo.io) 