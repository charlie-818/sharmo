#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Sharmo Python SDK
A client library for interacting with the Sharmo real estate tokenization platform API
"""

import json
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Union, Any
import requests
from requests.exceptions import RequestException, Timeout, HTTPError

__version__ = "1.0.0"

# Configure logging
logger = logging.getLogger("sharmo_sdk")


class SharmoError(Exception):
    """Custom exception for Sharmo API errors"""

    def __init__(
        self, 
        message: str, 
        code: str = "UNKNOWN_ERROR", 
        response: Optional[requests.Response] = None,
        http_status: Optional[int] = None
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.response = response
        self.http_status = http_status
        
        # Try to parse response data if available
        self.response_data = None
        if response:
            self.http_status = response.status_code
            try:
                self.response_data = response.json()
            except ValueError:
                self.response_data = response.text

    def __str__(self) -> str:
        if self.http_status:
            return f"{self.message} (HTTP {self.http_status}, Code: {self.code})"
        return f"{self.message} (Code: {self.code})"


class Resource:
    """Base class for API resources"""

    def __init__(self, client: "SharmoClient", path: str):
        self.client = client
        self.path = path

    def request(
        self, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict] = None, 
        params: Optional[Dict] = None
    ) -> Any:
        """Make a request to the API resource"""
        return self.client.request(method, f"{self.path}{endpoint}", data, params)


class Properties(Resource):
    """API resource for property operations"""

    def __init__(self, client: "SharmoClient"):
        super().__init__(client, "/properties")

    def list(self, **params) -> List[Dict]:
        """
        Get a list of properties
        
        Args:
            **params: Optional query parameters for filtering, pagination, etc.
                     Commonly used: page, per_page, sort_by, sort_order, location, status
                     
        Returns:
            List of property objects
        """
        return self.request("GET", "", params=params)

    def get(self, property_id: str) -> Dict:
        """
        Get a single property by ID
        
        Args:
            property_id: Unique property identifier
            
        Returns:
            Property details object
        """
        return self.request("GET", f"/{property_id}")

    def search(self, criteria: Dict) -> List[Dict]:
        """
        Search properties based on criteria
        
        Args:
            criteria: Search criteria object, which may include:
                     - location: str
                     - min_price: float
                     - max_price: float
                     - yield_range: tuple
                     - property_type: str
                     - min_size: float
                     - max_size: float
                     
        Returns:
            List of matching properties
        """
        return self.request("POST", "/search", data=criteria)

    def get_analytics(self, property_id: str) -> Dict:
        """
        Get property analytics
        
        Args:
            property_id: Unique property identifier
            
        Returns:
            Property analytics object
        """
        return self.request("GET", f"/{property_id}/analytics")

    def get_documents(self, property_id: str) -> List[Dict]:
        """
        Get documents related to a property
        
        Args:
            property_id: Unique property identifier
            
        Returns:
            List of property documents
        """
        return self.request("GET", f"/{property_id}/documents")

    def get_valuation_history(self, property_id: str) -> List[Dict]:
        """
        Get a property's valuation history
        
        Args:
            property_id: Unique property identifier
            
        Returns:
            List of valuation events
        """
        return self.request("GET", f"/{property_id}/valuation-history")


class Tokens(Resource):
    """API resource for token operations"""

    def __init__(self, client: "SharmoClient"):
        super().__init__(client, "/tokens")

    def list(self, **params) -> List[Dict]:
        """
        Get a list of tokens
        
        Args:
            **params: Optional query parameters for filtering, pagination, etc.
                     Commonly used: page, per_page, sort_by, sort_order, status
                     
        Returns:
            List of token objects
        """
        return self.request("GET", "", params=params)

    def get(self, token_id: str) -> Dict:
        """
        Get a single token by ID
        
        Args:
            token_id: Unique token identifier
            
        Returns:
            Token details object
        """
        return self.request("GET", f"/{token_id}")

    def get_price_history(self, token_id: str, **params) -> List[Dict]:
        """
        Get token price history
        
        Args:
            token_id: Unique token identifier
            **params: Optional query parameters for time range, etc.
                     Commonly used: start_date, end_date, interval
                     
        Returns:
            List of price points
        """
        return self.request("GET", f"/{token_id}/price-history", params=params)

    def get_holders(self, token_id: str) -> List[Dict]:
        """
        Get token holders
        
        Args:
            token_id: Unique token identifier
            
        Returns:
            List of token holders
        """
        return self.request("GET", f"/{token_id}/holders")

    def get_by_owner(self, address: str) -> List[Dict]:
        """
        Get tokens owned by an address
        
        Args:
            address: Wallet address
            
        Returns:
            List of owned tokens
        """
        return self.request("GET", "/by-owner", params={"address": address})

    def get_dividend_history(self, token_id: str) -> List[Dict]:
        """
        Get token dividend history
        
        Args:
            token_id: Unique token identifier
            
        Returns:
            List of dividend events
        """
        return self.request("GET", f"/{token_id}/dividends")


class Transactions(Resource):
    """API resource for transaction operations"""

    def __init__(self, client: "SharmoClient"):
        super().__init__(client, "/transactions")

    def list(self, **params) -> List[Dict]:
        """
        Get a list of transactions
        
        Args:
            **params: Optional query parameters for filtering, pagination, etc.
                     Commonly used: page, per_page, sort_by, sort_order, status, type
                     
        Returns:
            List of transaction objects
        """
        return self.request("GET", "", params=params)

    def get(self, transaction_id: str) -> Dict:
        """
        Get a single transaction by ID
        
        Args:
            transaction_id: Unique transaction identifier
            
        Returns:
            Transaction details object
        """
        return self.request("GET", f"/{transaction_id}")

    def get_by_property(self, property_id: str) -> List[Dict]:
        """
        Get transactions for a specific property
        
        Args:
            property_id: Property ID
            
        Returns:
            List of transactions
        """
        return self.request("GET", "/by-property", params={"propertyId": property_id})

    def get_by_token(self, token_id: str) -> List[Dict]:
        """
        Get transactions for a specific token
        
        Args:
            token_id: Token ID
            
        Returns:
            List of transactions
        """
        return self.request("GET", "/by-token", params={"tokenId": token_id})

    def get_by_address(self, address: str) -> List[Dict]:
        """
        Get transactions for a specific user address
        
        Args:
            address: Wallet address
            
        Returns:
            List of transactions
        """
        return self.request("GET", "/by-address", params={"address": address})


class Analytics(Resource):
    """API resource for analytics operations"""

    def __init__(self, client: "SharmoClient"):
        super().__init__(client, "/analytics")

    def get_platform_stats(self) -> Dict:
        """
        Get platform statistics
        
        Returns:
            Platform statistics object
        """
        return self.request("GET", "/platform-stats")

    def get_market_overview(self) -> Dict:
        """
        Get market overview
        
        Returns:
            Market overview object
        """
        return self.request("GET", "/market-overview")

    def get_trending_properties(self, limit: int = 10) -> List[Dict]:
        """
        Get trending properties
        
        Args:
            limit: Number of properties to return
            
        Returns:
            List of trending properties
        """
        return self.request("GET", "/trending-properties", params={"limit": limit})

    def get_region_analytics(self, region_code: str) -> Dict:
        """
        Get analytics for a specific region
        
        Args:
            region_code: Region code
            
        Returns:
            Region analytics object
        """
        return self.request("GET", "/region", params={"regionCode": region_code})

    def get_yield_data(self, **params) -> List[Dict]:
        """
        Get historical yield data
        
        Args:
            **params: Optional query parameters for time range, etc.
                     Commonly used: start_date, end_date, interval
                     
        Returns:
            Yield data points
        """
        return self.request("GET", "/yield-data", params=params)


class Users(Resource):
    """API resource for user operations"""

    def __init__(self, client: "SharmoClient"):
        super().__init__(client, "/users")

    def get_profile(self) -> Dict:
        """
        Get current user profile
        
        Returns:
            User profile object
        """
        return self.request("GET", "/profile")

    def update_profile(self, data: Dict) -> Dict:
        """
        Update user profile
        
        Args:
            data: Profile data to update
            
        Returns:
            Updated profile object
        """
        return self.request("PUT", "/profile", data=data)

    def get_kyc_status(self) -> Dict:
        """
        Get user KYC status
        
        Returns:
            KYC status object
        """
        return self.request("GET", "/kyc-status")

    def submit_kyc(self, data: Dict) -> Dict:
        """
        Submit KYC information
        
        Args:
            data: KYC data
            
        Returns:
            Submission result object
        """
        return self.request("POST", "/kyc", data=data)

    def get_portfolio(self) -> Dict:
        """
        Get user portfolio
        
        Returns:
            Portfolio data object
        """
        return self.request("GET", "/portfolio")

    def get_notification_settings(self) -> Dict:
        """
        Get user notification settings
        
        Returns:
            Notification settings object
        """
        return self.request("GET", "/notification-settings")

    def update_notification_settings(self, settings: Dict) -> Dict:
        """
        Update notification settings
        
        Args:
            settings: New notification settings
            
        Returns:
            Updated settings object
        """
        return self.request("PUT", "/notification-settings", data=settings)


class SharmoClient:
    """Main client for interacting with the Sharmo API"""

    def __init__(
        self,
        api_key: Optional[str] = None,
        api_secret: Optional[str] = None,
        access_token: Optional[str] = None,
        refresh_token: Optional[str] = None,
        base_url: str = "https://api.sharmo.io",
        version: str = "v1",
        timeout: int = 30,
        proxies: Optional[Dict] = None,
        verify: bool = True,
        on_token_refresh: Optional[callable] = None,
    ):
        """
        Initialize a new Sharmo API client
        
        Args:
            api_key: API key for authentication
            api_secret: API secret for authentication
            access_token: Existing access token
            refresh_token: Existing refresh token
            base_url: Base URL for the API
            version: API version
            timeout: Request timeout in seconds
            proxies: Proxy configuration for requests
            verify: Whether to verify SSL certificates
            on_token_refresh: Callback function that will be called when tokens are refreshed
        """
        self.api_key = api_key
        self.api_secret = api_secret
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.base_url = base_url
        self.version = version
        self.timeout = timeout
        self.proxies = proxies
        self.verify = verify
        self.on_token_refresh = on_token_refresh
        self.token_expiry = None

        # Initialize resources
        self.properties = Properties(self)
        self.tokens = Tokens(self)
        self.transactions = Transactions(self)
        self.analytics = Analytics(self)
        self.users = Users(self)

        self.session = requests.Session()

    def get_api_url(self, endpoint: str) -> str:
        """
        Get the full API URL
        
        Args:
            endpoint: API endpoint
            
        Returns:
            Full API URL
        """
        return f"{self.base_url}/{self.version}{endpoint}"

    def get_headers(self) -> Dict[str, str]:
        """
        Get headers for a request
        
        Returns:
            Request headers dictionary
        """
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-API-Version": self.version,
            "User-Agent": f"sharmo-python-sdk/{__version__}",
        }

        if self.api_key:
            headers["X-API-Key"] = self.api_key

        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"

        return headers

    async def refresh_access_token(self) -> Dict:
        """
        Refresh the access token
        
        Returns:
            New token data
            
        Raises:
            SharmoError: If token refresh fails
        """
        if not self.refresh_token:
            raise SharmoError("No refresh token available", code="AUTH_ERROR")

        try:
            response = self.session.post(
                self.get_api_url("/auth/token"),
                json={
                    "grant_type": "refresh_token",
                    "refresh_token": self.refresh_token,
                },
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "User-Agent": f"sharmo-python-sdk/{__version__}",
                },
                timeout=self.timeout,
                proxies=self.proxies,
                verify=self.verify,
            )

            if not response.ok:
                raise SharmoError(
                    "Failed to refresh token",
                    code="AUTH_ERROR",
                    response=response,
                )

            data = response.json()
            self.access_token = data["access_token"]

            # Update refresh token if a new one is provided
            if "refresh_token" in data:
                self.refresh_token = data["refresh_token"]

            # Set token expiry time
            if "expires_in" in data:
                self.token_expiry = datetime.now() + timedelta(seconds=data["expires_in"])

            # Call token refresh callback if provided
            if callable(self.on_token_refresh):
                self.on_token_refresh(data)

            return data
        except RequestException as e:
            raise SharmoError(
                f"Failed to refresh token: {str(e)}",
                code="NETWORK_ERROR",
            ) from e

    def authenticate(self, username: str, password: str) -> Dict:
        """
        Authenticate with API credentials
        
        Args:
            username: Username or email
            password: Password
            
        Returns:
            Authentication result
            
        Raises:
            SharmoError: If authentication fails
        """
        try:
            response = self.session.post(
                self.get_api_url("/auth/token"),
                json={
                    "grant_type": "password",
                    "username": username,
                    "password": password,
                },
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "User-Agent": f"sharmo-python-sdk/{__version__}",
                },
                timeout=self.timeout,
                proxies=self.proxies,
                verify=self.verify,
            )

            if not response.ok:
                raise SharmoError(
                    "Authentication failed",
                    code="AUTH_ERROR",
                    response=response,
                )

            data = response.json()
            self.access_token = data["access_token"]
            self.refresh_token = data["refresh_token"]

            # Set token expiry time
            if "expires_in" in data:
                self.token_expiry = datetime.now() + timedelta(seconds=data["expires_in"])

            # Call token refresh callback if provided
            if callable(self.on_token_refresh):
                self.on_token_refresh(data)

            return data
        except RequestException as e:
            raise SharmoError(
                f"Authentication failed: {str(e)}",
                code="NETWORK_ERROR",
            ) from e

    def request(
        self, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict] = None, 
        params: Optional[Dict] = None
    ) -> Any:
        """
        Send a request to the API
        
        Args:
            method: HTTP method
            endpoint: API endpoint
            data: Request payload
            params: Query parameters
            
        Returns:
            API response data
            
        Raises:
            SharmoError: If the request fails
        """
        url = self.get_api_url(endpoint)

        try:
            # Prepare the request
            headers = self.get_headers()
            req_kwargs = {
                "headers": headers,
                "timeout": self.timeout,
                "proxies": self.proxies,
                "verify": self.verify,
            }

            if params:
                req_kwargs["params"] = params

            if data is not None and method.upper() in ["POST", "PUT", "PATCH"]:
                req_kwargs["json"] = data

            # Make the request
            response = self.session.request(method, url, **req_kwargs)

            # Handle authentication errors
            if response.status_code == 401 and self.refresh_token:
                logger.debug("Received 401, attempting to refresh token")
                self.refresh_access_token()
                
                # Update headers with new token
                req_kwargs["headers"] = self.get_headers()
                
                # Retry the request
                response = self.session.request(method, url, **req_kwargs)

            return self._handle_response(response)

        except Timeout:
            logger.error(f"Request to {url} timed out after {self.timeout}s")
            raise SharmoError(
                f"Request timed out after {self.timeout}s",
                code="TIMEOUT_ERROR"
            )
        except RequestException as e:
            logger.error(f"Request to {url} failed: {str(e)}")
            raise SharmoError(
                f"Request failed: {str(e)}",
                code="NETWORK_ERROR"
            ) from e

    def _handle_response(self, response: requests.Response) -> Any:
        """
        Handle API response
        
        Args:
            response: Requests Response object
            
        Returns:
            Parsed response data
            
        Raises:
            SharmoError: If the response indicates an error
        """
        content_type = response.headers.get("Content-Type", "")

        # Parse response based on content type
        try:
            if "application/json" in content_type:
                data = response.json()
            else:
                data = response.text
        except ValueError:
            data = response.text

        # Handle error responses
        if not response.ok:
            error_message = data.get("message", "API request failed") if isinstance(data, dict) else "API request failed"
            error_code = data.get("code", f"HTTP_{response.status_code}") if isinstance(data, dict) else f"HTTP_{response.status_code}"
            
            raise SharmoError(
                error_message,
                code=error_code,
                response=response,
            )

        return data


def create_client(**kwargs) -> SharmoClient:
    """
    Create a new Sharmo client instance with the provided configuration.
    
    This is a convenience function for creating a client.
    
    Args:
        **kwargs: Configuration options to pass to SharmoClient
        
    Returns:
        A configured SharmoClient instance
    """
    return SharmoClient(**kwargs) 