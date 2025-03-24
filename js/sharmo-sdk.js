/**
 * Sharmo SDK - JavaScript Client
 * A lightweight SDK for interacting with the Sharmo real estate tokenization platform API
 * Version 1.0.0
 */

(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.SharmoSDK = factory());
}(this, (function() {
    'use strict';

    // Constants
    const API_BASE_URL = 'https://api.sharmo.io';
    const API_VERSION = 'v1';
    const TOKEN_ENDPOINT = '/auth/token';

    /**
     * SharmoError - Custom error class for SDK related errors
     */
    class SharmoError extends Error {
        constructor(message, code, response) {
            super(message);
            this.name = 'SharmoError';
            this.code = code || 'UNKNOWN_ERROR';
            this.response = response;
            
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, SharmoError);
            }
        }
    }

    /**
     * Resource - Base class for all API resources
     */
    class Resource {
        constructor(client, path) {
            this.client = client;
            this.path = path;
        }

        /**
         * Make a request to the API
         * @param {string} method - HTTP method
         * @param {string} endpoint - API endpoint
         * @param {Object} data - Request payload
         * @param {Object} query - Query parameters
         * @returns {Promise<any>} - API response
         */
        request(method, endpoint, data, query) {
            return this.client.request(method, `${this.path}${endpoint}`, data, query);
        }
    }

    /**
     * Properties - API resource for property operations
     */
    class Properties extends Resource {
        constructor(client) {
            super(client, '/properties');
        }

        /**
         * Get a list of properties
         * @param {Object} options - Query parameters for filtering, pagination, etc.
         * @returns {Promise<Array>} - List of properties
         */
        list(options = {}) {
            return this.request('GET', '', null, options);
        }

        /**
         * Get a single property by ID
         * @param {string} id - Property ID
         * @returns {Promise<Object>} - Property details
         */
        get(id) {
            return this.request('GET', `/${id}`);
        }

        /**
         * Search properties based on criteria
         * @param {Object} criteria - Search criteria
         * @returns {Promise<Array>} - Matching properties
         */
        search(criteria) {
            return this.request('POST', '/search', criteria);
        }

        /**
         * Get property analytics
         * @param {string} id - Property ID
         * @returns {Promise<Object>} - Property analytics
         */
        getAnalytics(id) {
            return this.request('GET', `/${id}/analytics`);
        }

        /**
         * Get documents related to a property
         * @param {string} id - Property ID
         * @returns {Promise<Array>} - Property documents
         */
        getDocuments(id) {
            return this.request('GET', `/${id}/documents`);
        }

        /**
         * Get a property valuation history
         * @param {string} id - Property ID
         * @returns {Promise<Array>} - Valuation history
         */
        getValuationHistory(id) {
            return this.request('GET', `/${id}/valuation-history`);
        }
    }

    /**
     * Tokens - API resource for token operations
     */
    class Tokens extends Resource {
        constructor(client) {
            super(client, '/tokens');
        }

        /**
         * Get a list of tokens
         * @param {Object} options - Query parameters for filtering, pagination, etc.
         * @returns {Promise<Array>} - List of tokens
         */
        list(options = {}) {
            return this.request('GET', '', null, options);
        }

        /**
         * Get a single token by ID
         * @param {string} id - Token ID
         * @returns {Promise<Object>} - Token details
         */
        get(id) {
            return this.request('GET', `/${id}`);
        }

        /**
         * Get token price history
         * @param {string} id - Token ID
         * @param {Object} options - Query parameters for time range, etc.
         * @returns {Promise<Array>} - Price history
         */
        getPriceHistory(id, options = {}) {
            return this.request('GET', `/${id}/price-history`, null, options);
        }

        /**
         * Get token holders
         * @param {string} id - Token ID
         * @returns {Promise<Array>} - List of token holders
         */
        getHolders(id) {
            return this.request('GET', `/${id}/holders`);
        }

        /**
         * Get tokens owned by an address
         * @param {string} address - Wallet address
         * @returns {Promise<Array>} - List of owned tokens
         */
        getByOwner(address) {
            return this.request('GET', '/by-owner', null, { address });
        }

        /**
         * Get token dividend history
         * @param {string} id - Token ID
         * @returns {Promise<Array>} - Dividend history
         */
        getDividendHistory(id) {
            return this.request('GET', `/${id}/dividends`);
        }
    }

    /**
     * Transactions - API resource for transaction operations
     */
    class Transactions extends Resource {
        constructor(client) {
            super(client, '/transactions');
        }

        /**
         * Get a list of transactions
         * @param {Object} options - Query parameters for filtering, pagination, etc.
         * @returns {Promise<Array>} - List of transactions
         */
        list(options = {}) {
            return this.request('GET', '', null, options);
        }

        /**
         * Get a single transaction by ID
         * @param {string} id - Transaction ID
         * @returns {Promise<Object>} - Transaction details
         */
        get(id) {
            return this.request('GET', `/${id}`);
        }

        /**
         * Get transactions for a specific property
         * @param {string} propertyId - Property ID
         * @returns {Promise<Array>} - List of transactions
         */
        getByProperty(propertyId) {
            return this.request('GET', '/by-property', null, { propertyId });
        }

        /**
         * Get transactions for a specific token
         * @param {string} tokenId - Token ID
         * @returns {Promise<Array>} - List of transactions
         */
        getByToken(tokenId) {
            return this.request('GET', '/by-token', null, { tokenId });
        }

        /**
         * Get transactions for a specific user address
         * @param {string} address - Wallet address
         * @returns {Promise<Array>} - List of transactions
         */
        getByAddress(address) {
            return this.request('GET', '/by-address', null, { address });
        }
    }

    /**
     * Analytics - API resource for analytics operations
     */
    class Analytics extends Resource {
        constructor(client) {
            super(client, '/analytics');
        }

        /**
         * Get platform statistics
         * @returns {Promise<Object>} - Platform statistics
         */
        getPlatformStats() {
            return this.request('GET', '/platform-stats');
        }

        /**
         * Get market overview
         * @returns {Promise<Object>} - Market overview
         */
        getMarketOverview() {
            return this.request('GET', '/market-overview');
        }

        /**
         * Get trending properties
         * @param {number} limit - Number of properties to return
         * @returns {Promise<Array>} - Trending properties
         */
        getTrendingProperties(limit = 10) {
            return this.request('GET', '/trending-properties', null, { limit });
        }

        /**
         * Get analytics for a specific region
         * @param {string} regionCode - Region code
         * @returns {Promise<Object>} - Region analytics
         */
        getRegionAnalytics(regionCode) {
            return this.request('GET', '/region', null, { regionCode });
        }

        /**
         * Get historical yield data
         * @param {Object} options - Query parameters for time range, etc.
         * @returns {Promise<Array>} - Yield data
         */
        getYieldData(options = {}) {
            return this.request('GET', '/yield-data', null, options);
        }
    }

    /**
     * Users - API resource for user operations
     */
    class Users extends Resource {
        constructor(client) {
            super(client, '/users');
        }

        /**
         * Get current user profile
         * @returns {Promise<Object>} - User profile
         */
        getProfile() {
            return this.request('GET', '/profile');
        }

        /**
         * Update user profile
         * @param {Object} data - Profile data to update
         * @returns {Promise<Object>} - Updated profile
         */
        updateProfile(data) {
            return this.request('PUT', '/profile', data);
        }

        /**
         * Get user KYC status
         * @returns {Promise<Object>} - KYC status
         */
        getKycStatus() {
            return this.request('GET', '/kyc-status');
        }

        /**
         * Submit KYC information
         * @param {Object} data - KYC data
         * @returns {Promise<Object>} - Submission result
         */
        submitKyc(data) {
            return this.request('POST', '/kyc', data);
        }

        /**
         * Get user portfolio
         * @returns {Promise<Object>} - Portfolio data
         */
        getPortfolio() {
            return this.request('GET', '/portfolio');
        }

        /**
         * Get user notification settings
         * @returns {Promise<Object>} - Notification settings
         */
        getNotificationSettings() {
            return this.request('GET', '/notification-settings');
        }

        /**
         * Update notification settings
         * @param {Object} settings - New notification settings
         * @returns {Promise<Object>} - Updated settings
         */
        updateNotificationSettings(settings) {
            return this.request('PUT', '/notification-settings', settings);
        }
    }

    /**
     * SharmoClient - Main SDK client
     */
    class SharmoClient {
        /**
         * Create a new SharmoClient instance
         * @param {Object} options - Client configuration options
         */
        constructor(options = {}) {
            this.apiKey = options.apiKey;
            this.apiSecret = options.apiSecret;
            this.accessToken = options.accessToken;
            this.refreshToken = options.refreshToken;
            this.baseUrl = options.baseUrl || API_BASE_URL;
            this.version = options.version || API_VERSION;
            this.timeout = options.timeout || 30000;
            this.onTokenRefresh = options.onTokenRefresh;
            
            // Initialize resources
            this.properties = new Properties(this);
            this.tokens = new Tokens(this);
            this.transactions = new Transactions(this);
            this.analytics = new Analytics(this);
            this.users = new Users(this);
        }

        /**
         * Get the full API URL
         * @param {string} endpoint - API endpoint
         * @returns {string} - Full API URL
         */
        getApiUrl(endpoint) {
            return `${this.baseUrl}/${this.version}${endpoint}`;
        }

        /**
         * Get headers for a request
         * @returns {Object} - Request headers
         */
        getHeaders() {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-API-Version': this.version
            };

            if (this.apiKey) {
                headers['X-API-Key'] = this.apiKey;
            }

            if (this.accessToken) {
                headers['Authorization'] = `Bearer ${this.accessToken}`;
            }

            return headers;
        }

        /**
         * Refresh the access token
         * @returns {Promise<Object>} - New token data
         */
        async refreshAccessToken() {
            if (!this.refreshToken) {
                throw new SharmoError('No refresh token available', 'AUTH_ERROR');
            }

            try {
                const response = await fetch(this.getApiUrl(TOKEN_ENDPOINT), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        grant_type: 'refresh_token',
                        refresh_token: this.refreshToken
                    })
                });

                if (!response.ok) {
                    throw new SharmoError('Failed to refresh token', 'AUTH_ERROR', response);
                }

                const data = await response.json();
                this.accessToken = data.access_token;
                
                // Update refresh token if a new one is provided
                if (data.refresh_token) {
                    this.refreshToken = data.refresh_token;
                }

                // Call token refresh callback if provided
                if (typeof this.onTokenRefresh === 'function') {
                    this.onTokenRefresh(data);
                }

                return data;
            } catch (error) {
                if (error instanceof SharmoError) {
                    throw error;
                }
                throw new SharmoError('Failed to refresh token', 'NETWORK_ERROR', error);
            }
        }

        /**
         * Authenticate with API credentials
         * @param {string} username - Username or email
         * @param {string} password - Password
         * @returns {Promise<Object>} - Authentication result
         */
        async authenticate(username, password) {
            try {
                const response = await fetch(this.getApiUrl(TOKEN_ENDPOINT), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        grant_type: 'password',
                        username,
                        password
                    })
                });

                if (!response.ok) {
                    throw new SharmoError('Authentication failed', 'AUTH_ERROR', response);
                }

                const data = await response.json();
                this.accessToken = data.access_token;
                this.refreshToken = data.refresh_token;

                // Call token refresh callback if provided
                if (typeof this.onTokenRefresh === 'function') {
                    this.onTokenRefresh(data);
                }

                return data;
            } catch (error) {
                if (error instanceof SharmoError) {
                    throw error;
                }
                throw new SharmoError('Authentication failed', 'NETWORK_ERROR', error);
            }
        }

        /**
         * Send a request to the API
         * @param {string} method - HTTP method
         * @param {string} endpoint - API endpoint
         * @param {Object} data - Request payload
         * @param {Object} query - Query parameters
         * @returns {Promise<any>} - API response
         */
        async request(method, endpoint, data, query) {
            // Add query parameters to URL if present
            let url = this.getApiUrl(endpoint);
            if (query && Object.keys(query).length > 0) {
                const queryString = Object.keys(query)
                    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
                    .join('&');
                url += `?${queryString}`;
            }

            const options = {
                method,
                headers: this.getHeaders(),
                timeout: this.timeout
            };

            // Add request body for methods that support it
            if (['POST', 'PUT', 'PATCH'].includes(method) && data !== null) {
                options.body = JSON.stringify(data);
            }

            try {
                const response = await fetch(url, options);

                // Handle authentication errors
                if (response.status === 401 && this.refreshToken) {
                    // Try to refresh the token and retry the request
                    await this.refreshAccessToken();
                    
                    // Update headers with new token
                    options.headers = this.getHeaders();
                    
                    // Retry the request
                    const retryResponse = await fetch(url, options);
                    return this.handleResponse(retryResponse);
                }

                return this.handleResponse(response);
            } catch (error) {
                if (error instanceof SharmoError) {
                    throw error;
                }
                throw new SharmoError('API request failed', 'NETWORK_ERROR', error);
            }
        }

        /**
         * Handle API response
         * @param {Response} response - Fetch API Response object
         * @returns {Promise<any>} - Parsed response data
         */
        async handleResponse(response) {
            const contentType = response.headers.get('Content-Type') || '';
            
            // Parse response based on content type
            let data;
            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            // Handle error responses
            if (!response.ok) {
                throw new SharmoError(
                    data.message || 'API request failed',
                    data.code || `HTTP_${response.status}`,
                    { status: response.status, data }
                );
            }

            return data;
        }
    }

    // Export the SDK
    return {
        SharmoClient,
        SharmoError,
        version: '1.0.0'
    };
}))); 