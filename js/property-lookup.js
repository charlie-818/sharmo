// Property Lookup JS with Direct Perplexity API Integration
document.addEventListener('DOMContentLoaded', function() {
    console.log('Property lookup script loaded');
    
    // Grab form elements
    const propertyForm = document.getElementById('propertyForm');
    const addressInput = document.getElementById('address');
    const cityInput = document.getElementById('city');
    const stateSelect = document.getElementById('state');
    const lookupBtn = document.getElementById('lookupBtn');
    const propertyResults = document.getElementById('propertyResults');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    
    // Check if all required elements exist
    const requiredElements = {
        propertyForm,
        addressInput,
        cityInput,
        stateSelect,
        lookupBtn,
        propertyResults,
        loadingIndicator,
        errorMessage
    };
    
    const missingElements = Object.entries(requiredElements)
        .filter(([_, element]) => !element)
        .map(([name]) => name);
    
    if (missingElements.length > 0) {
        console.error('❌ Missing required elements:', missingElements);
        return; // Exit if any required elements are missing
    }
    
    console.log('✅ All required elements found');
    
    // Results elements
    const resultElements = {
        address: document.getElementById('resultAddress'),
        city: document.getElementById('resultCity'),
        state: document.getElementById('resultState'),
        propertyType: document.getElementById('propertyType'),
        squareFootage: document.getElementById('squareFootage'),
        yearBuilt: document.getElementById('yearBuilt'),
        propertyValue: document.getElementById('propertyValue'),
        tokenPotential: document.getElementById('tokenPotential'),
        liquidityScore: document.getElementById('liquidityScore'),
        returnRate: document.getElementById('returnRate'),
        marketDemand: document.getElementById('marketDemand'),
        blockchainFee: document.getElementById('blockchainFee'),
        neighborhoodTrend: document.getElementById('neighborhoodTrend'),
        rentalIncome: document.getElementById('rentalIncome'),
        appreciationRate: document.getElementById('appreciationRate')
    };
    
    // Check server connectivity first
    checkServerConnectivity().then(isConnected => {
        if (!isConnected) {
            console.error('❌ Server is not running or not reachable');
            showServerNotRunningError();
            return;
        }
        
        // Test API connectivity only if server is running
        testApiConnectivity();
    });
    
    // Function to check if the server is running
    async function checkServerConnectivity() {
        try {
            const endpoints = [
                '/api/property-lookup',
                '/.netlify/functions/property-lookup',
                '/netlify/functions/property-lookup'
            ];
            
            // Try each endpoint with a very short timeout
            for (const endpoint of endpoints) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
                    
                    const response = await fetch(endpoint, {
                        method: 'OPTIONS',
                        signal: controller.signal
                    });
                    
                    clearTimeout(timeoutId);
                    
                    if (response.ok || response.status === 204) {
                        console.log(`✅ Server is running at endpoint: ${endpoint}`);
                        return true;
                    }
                } catch (err) {
                    // Continue to next endpoint if this one failed
                    console.log(`Endpoint ${endpoint} not available:`, err.message);
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error checking server connectivity:', error);
            return false;
        }
    }
    
    // Function to show server not running error
    function showServerNotRunningError() {
        if (errorMessage) {
            errorMessage.innerHTML = `
                <h4>Server Not Running</h4>
                <p>The property lookup feature requires the server to be running.</p>
                <div>
                    Please try the following:
                    <ul style="margin-top: 0.5rem; margin-left: 1.5rem; color: var(--text-secondary);">
                        <li>Start the server using <code>node server.js</code></li>
                        <li>Ensure you're accessing the site through the server URL (e.g., http://localhost:3000)</li>
                        <li>Check the console for any error messages</li>
                    </ul>
                </div>
            `;
            errorMessage.style.display = 'block';
        }
        
        // Disable the form
        if (lookupBtn) lookupBtn.disabled = true;
        if (addressInput) addressInput.disabled = true;
        if (cityInput) cityInput.disabled = true;
        if (stateSelect) stateSelect.disabled = true;
    }
    
    // Remove duplicate API connectivity check (we'll call it from server connectivity check)
    // testApiConnectivity();
    
    // Add event listener for form submission
    if (propertyForm) {
        propertyForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent form submission
            console.log('Form submitted');
            
            // Add visual feedback for button click
            lookupBtn.classList.add('btn-clicked');
            setTimeout(() => {
                lookupBtn.classList.remove('btn-clicked');
            }, 200);
            
            lookupProperty();
        });
    } else {
        console.error('Property form not found!');
    }
    
    // Enable form submission with Enter key
    [addressInput, cityInput, stateSelect].forEach(input => {
        if (!input) {
            console.error(`Input element not found: ${input}`);
            return;
        }
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                lookupProperty();
            }
        });
    });
    
    // Format currency values
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };
    
    // Format number with commas
    const formatNumber = (value) => {
        return new Intl.NumberFormat('en-US').format(value);
    };
    
    // Helper function to extract JSON from Perplexity response
    const extractJSONFromResponse = (content) => {
        try {
            // Clean up the content string first
            const cleanContent = content.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width spaces
            const jsonMatch = cleanContent.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
            
            if (jsonMatch && jsonMatch[1]) {
                try {
                    // Remove comments and clean up the JSON
                    const cleanJson = jsonMatch[1]
                        .replace(/\/\/.*$/gm, '') // Remove single-line comments
                        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
                        .replace(/[\n\r\t]/g, ' ') // Replace newlines and tabs with spaces
                        .replace(/\s+/g, ' ') // Normalize whitespace
                        .replace(/,\s*}/g, '}') // Remove trailing commas
                        .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // Quote property names
                        .replace(/:\s*'([^']*?)'/g, ':"$1"') // Replace single quotes with double quotes
                        .replace(/,\s*,/g, ',') // Remove duplicate commas
                        .trim();

                    // Parse the cleaned JSON
                    return JSON.parse(cleanJson);
                } catch (e) {
                    console.error('JSON parsing error:', e);
                    
                    // Fallback: Try parsing after more aggressive cleaning
                    try {
                        const fallbackJson = jsonMatch[1]
                            .replace(/\/\/.*/g, '') // Remove all comments
                            .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
                            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":') // Ensure quoted property names
                            .replace(/\s+/g, ' ')
                            .trim();
                        return JSON.parse(fallbackJson);
                    } catch (fallbackError) {
                        throw new Error('Failed to parse JSON after cleaning');
                    }
                }
            }
            throw new Error('No JSON object found in response');
        } catch (e) {
            console.error('Content parsing error:', e);
            throw new Error(`Failed to extract valid JSON: ${e.message}`);
        }
    };
    
    // Main lookup function
    async function lookupProperty() {
        console.log('🔍 Property lookup initiated...');
        
        // Log form values
        console.log('Form values:', {
            address: addressInput?.value,
            city: cityInput?.value,
            state: stateSelect?.value
        });
        
        if (!validateForm()) {
            console.log('❌ Form validation failed');
            return;
        }
        
        // Check API configuration first
        console.log('Checking API configuration...');
        const apiStatus = await checkApiConfiguration();
        if (!apiStatus.ok) {
            console.error('❌ API configuration check failed:', apiStatus.message);
            showError(apiStatus.message);
            return;
        }
        console.log('✅ API configuration check passed');
        
        // Show loading state
        propertyResults.style.display = 'none';
        if (errorMessage) errorMessage.style.display = 'none';
        loadingIndicator.style.display = 'block';
        
        // Update button state
        lookupBtn.disabled = true;
        lookupBtn.innerHTML = '<div class="spinner-small"></div><span>Searching...</span>';
        
        // Set a timeout for the entire operation
        const timeoutDuration = 30000; // 30 seconds
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timed out. Please try again.')), timeoutDuration);
        });
        
        try {
            const address = addressInput.value.trim();
            const city = cityInput.value.trim();
            const state = stateSelect.value;
            
            console.log(`📍 Looking up property: ${address}, ${city}, ${state}`);
            
            // Determine which API endpoint to use based on the environment
            const endpoints = [
                '/api/property-lookup',          // Vercel API route
                '/.netlify/functions/property-lookup', // Netlify function
                '/netlify/functions/property-lookup'   // Alternative Netlify path
            ];
            
            // Check if we've previously found a working endpoint
            const cachedEndpoint = localStorage.getItem('propertyLookupEndpoint');
            if (cachedEndpoint) {
                // Move the cached endpoint to the front of the array
                const index = endpoints.indexOf(cachedEndpoint);
                if (index > -1) {
                    endpoints.splice(index, 1);
                }
                endpoints.unshift(cachedEndpoint);
                console.log(`🔄 Using cached endpoint first: ${cachedEndpoint}`);
            }
            
            let response = null;
            let endpointUsed = null;
            
            // Try each endpoint until one works, with timeout
            for (const endpoint of endpoints) {
                try {
                    console.log(`🌐 Trying endpoint: ${endpoint}`);
                    
                    // Debug: Show the POST request data being sent
                    console.log('📦 Sending request data:', {
                        address, city, state,
                        endpoint,
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'}
                    });
                    
                    const fetchPromise = fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                            address, 
                            city, 
                            state 
                        })
                    });
                    
                    // Race between fetch and timeout
                    const tempResponse = await Promise.race([fetchPromise, timeoutPromise]);
                    
                    // If we get any response (even an error), consider the endpoint valid
                    response = tempResponse;
                    endpointUsed = endpoint;
                    console.log(`✅ Successful connection to endpoint: ${endpoint}`);
                    console.log(`📊 Response status: ${response.status}`);
                    break;
                } catch (endpointError) {
                    console.error(`❌ Error with endpoint ${endpoint}:`, endpointError);
                    if (endpointError.message.includes('timed out')) {
                        console.error(`⏰ Endpoint ${endpoint} timed out:`, endpointError);
                    } else {
                        console.warn(`⚠️ Endpoint ${endpoint} failed:`, endpointError);
                    }
                    // Continue to the next endpoint
                }
            }
            
            if (!response) {
                throw new Error("Could not connect to property lookup service. Please try again later.");
            }
            
            console.log(`🎯 Using endpoint: ${endpointUsed}`);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.error) {
                    console.error('❌ API returned error:', data.error);
                    throw new Error(data.error);
                }
                
                // Check if the API returned valid property data
                if (!data.propertyData || !data.propertyData.estimatedValue) {
                    console.error('❌ Invalid property data received:', data);
                    throw new Error("No valid property data found");
                }
                
                console.log("✨ Property data received:", data);
                
                // Process and display the data
                displayPropertyData(data.propertyData, address, city, state);
                // Store the successful endpoint in localStorage for future use
                localStorage.setItem('propertyLookupEndpoint', endpointUsed);
                console.log('✅ Property lookup completed successfully');
            } else {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || errorData.error || `Request failed with status: ${response.status}`;
                console.error('❌ API request failed:', errorMessage);
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('❌ Error in property lookup:', error);
            showError(error.message || "We couldn't find property information for the address you provided. Please check the address and try again.");
        } finally {
            // Reset UI state
            loadingIndicator.style.display = 'none';
            lookupBtn.disabled = false;
            lookupBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>Search Property';
            console.log('🔄 Reset UI state');
        }
    }
    
    // Form validation
    function validateForm() {
        let isValid = true;
        
        [addressInput, cityInput, stateSelect].forEach(element => {
            removeHighlight(element);
        });
        
        if (!addressInput.value.trim()) {
            highlightError(addressInput);
            isValid = false;
        }
        
        if (!cityInput.value.trim()) {
            highlightError(cityInput);
            isValid = false;
        }
        
        if (!stateSelect.value) {
            highlightError(stateSelect);
            isValid = false;
        }
        
        return isValid;
    }
    
    // Error handling
    function highlightError(element) {
        element.classList.add('form-error');
        element.classList.add('shake');
        
        const removeErrorStyle = () => {
            removeHighlight(element);
            element.removeEventListener('input', removeErrorStyle);
            element.removeEventListener('focus', removeErrorStyle);
        };
        
        element.addEventListener('input', removeErrorStyle);
        element.addEventListener('focus', removeErrorStyle);
    }
    
    function removeHighlight(element) {
        element.classList.remove('form-error');
        element.classList.remove('shake');
    }
    
    // Show error message
    function showError(message = 'Failed to fetch property data. Please try again.') {
        if (errorMessage) {
            const errorTitle = errorMessage.querySelector('h4');
            const errorText = errorMessage.querySelector('p');
            
            // Determine appropriate error title based on the message
            let title = 'Property Not Found';
            if (message.includes("connect") || message.includes("service")) {
                title = 'Service Unavailable';
            } else if (message.includes("API")) {
                title = 'Technical Error';
            }
            
            if (errorTitle) errorTitle.textContent = title;
            if (errorText) errorText.textContent = message;
            
            // Hide results and ensure error is visible
            propertyResults.style.display = 'none';
            errorMessage.style.display = 'block';
            
            // Ensure error message is visible by scrolling to it
            setTimeout(() => {
                errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }
    
    // Display property data in the UI
    function displayPropertyData(data, address, city, state) {
        // Update basic property information
        if (resultElements.address) resultElements.address.textContent = address;
        if (resultElements.city) resultElements.city.textContent = city;
        if (resultElements.state) resultElements.state.textContent = state;
        if (resultElements.propertyType) resultElements.propertyType.textContent = data.propertyType || 'N/A';
        if (resultElements.squareFootage) resultElements.squareFootage.textContent = data.squareFootage ? `${formatNumber(data.squareFootage)} sq ft` : 'N/A';
        if (resultElements.yearBuilt) resultElements.yearBuilt.textContent = data.yearBuilt || 'N/A';
        
        // Update financial information
        if (resultElements.propertyValue) resultElements.propertyValue.textContent = data.estimatedValue ? formatCurrency(data.estimatedValue) : 'N/A';
        
        // Calculate and set token potential - pass the entire data object instead of just estimatedValue
        const potentialValue = calculateTokenPotential(data.estimatedValue, data);
        if (resultElements.tokenPotential) resultElements.tokenPotential.textContent = potentialValue;
        setTokenPotentialStyle(resultElements.tokenPotential, potentialValue);
        
        // Update market analysis
        if (resultElements.liquidityScore) resultElements.liquidityScore.textContent = calculateLiquidityScore(data);
        if (resultElements.returnRate) resultElements.returnRate.textContent = data.marketTrends?.yearlyAppreciation || 'N/A';
        if (resultElements.marketDemand) resultElements.marketDemand.textContent = calculateMarketDemand(data);
        if (resultElements.blockchainFee) resultElements.blockchainFee.textContent = '0.05 ETH'; // Fixed fee for now
        if (resultElements.neighborhoodTrend) resultElements.neighborhoodTrend.textContent = data.neighborhood?.trend || 'Stable';
        if (resultElements.rentalIncome) resultElements.rentalIncome.textContent = calculateRentalIncome(data);
        if (resultElements.appreciationRate) resultElements.appreciationRate.textContent = data.marketTrends?.yearlyAppreciation || 'N/A';
        
        // Show results with animation
        propertyResults.style.display = 'block';
        propertyResults.style.opacity = '0';
        propertyResults.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            propertyResults.style.opacity = '1';
            propertyResults.style.transform = 'translateY(0)';
            
            // Scroll to results
            propertyResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
        
        // Set up tokenization button
        const startTokenizationBtn = document.getElementById('startTokenizationBtn');
        if (startTokenizationBtn) {
            startTokenizationBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Prepare property data for the smart contract generator
                const propertyParams = new URLSearchParams({
                    address: address,
                    city: city,
                    state: state,
                    value: data.estimatedValue || 0,
                    potential: resultElements.tokenPotential.textContent
                });
                
                // Navigate to the smart contract generator page with property data
                window.location.href = `/smart-contract.html?${propertyParams.toString()}`;
            });
        }
    }
    
    // Helper functions for calculations
    function calculateTokenPotential(propertyValue, propertyData) {
        if (!propertyValue) return 'Low';
        
        // Use propertyData if available, otherwise use default values
        let score = (propertyValue > 500000 ? 2 : 1);
        
        // Add market trend factors if available
        if (propertyData && propertyData.marketTrends) {
            const yearlyAppreciation = parseFloat(propertyData.marketTrends.yearlyAppreciation) || 0;
            const daysOnMarket = propertyData.marketTrends.daysOnMarket || 60;
            
            score += (yearlyAppreciation > 5 ? 2 : 1);
            score += (daysOnMarket < 30 ? 2 : 1);
        } else {
            // Default values if no market trends data
            score += 2;
        }
        
        return score >= 5 ? 'High' : score >= 3 ? 'Medium' : 'Low';
    }
    
    function calculateLiquidityScore(data) {
        if (!data.marketTrends) return 'N/A';
        
        const score = Math.min(10, Math.max(1, Math.round(
            (100 - data.marketTrends.daysOnMarket) / 10
        )));
        
        return `${score}/10`;
    }
    
    function calculateMarketDemand(data) {
        if (!data.marketTrends) return 'Moderate';
        
        const daysOnMarket = data.marketTrends.daysOnMarket;
        if (daysOnMarket < 15) return 'Very High';
        if (daysOnMarket < 30) return 'High';
        if (daysOnMarket < 60) return 'Moderate';
        return 'Low';
    }
    
    function calculateRentalIncome(data) {
        if (!data.estimatedValue) return 'N/A';
        
        // Estimate monthly rental as 0.8% of property value
        const monthlyRental = data.estimatedValue * 0.008;
        return formatCurrency(monthlyRental) + '/mo';
    }
    
    function setTokenPotentialStyle(element, value) {
        const colors = {
            'High': '#10b981',
            'Medium': '#f59e0b',
            'Low': '#ef4444'
        };
        
        element.style.color = colors[value] || colors['Low'];
    }
    
    // Helper function to get full state name
    function getStateName(stateCode) {
        const states = {
            'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
            'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
            'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
            'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
            'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
            'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire',
            'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina',
            'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania',
            'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee',
            'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington',
            'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
        };
        
        return states[stateCode] || stateCode;
    }
    
    // Test API connectivity to determine the correct endpoint
    async function testApiConnectivity() {
        console.log("Testing API connectivity...");
        const endpoints = [
            '/api/property-lookup',
            '/.netlify/functions/property-lookup',
            '/netlify/functions/property-lookup'
        ];
        
        // Check if we've previously found a working endpoint
        const cachedEndpoint = localStorage.getItem('propertyLookupEndpoint');
        if (cachedEndpoint) {
            // Move the cached endpoint to the front of the array
            const index = endpoints.indexOf(cachedEndpoint);
            if (index > -1) {
                endpoints.splice(index, 1);
            }
            endpoints.unshift(cachedEndpoint);
        }
        
        for (const endpoint of endpoints) {
            try {
                console.log(`Testing endpoint: ${endpoint}`);
                const response = await fetch(endpoint, {
                    method: 'OPTIONS',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.status === 204 || response.ok) {
                    console.log(`Found working endpoint: ${endpoint}`);
                    localStorage.setItem('propertyLookupEndpoint', endpoint);
                    return true;
                }
            } catch (error) {
                console.warn(`Endpoint ${endpoint} not available:`, error);
            }
        }
        
        console.warn("No working property lookup endpoints found.");
        return false;
    }
    
    // Add API configuration check
    async function checkApiConfiguration() {
        console.log('🔑 Checking API configuration...');
        
        // Try the cached endpoint first
        const cachedEndpoint = localStorage.getItem('propertyLookupEndpoint');
        const endpoints = cachedEndpoint ? [cachedEndpoint] : ['/api/property-lookup'];
        
        let apiKeyMissing = false;
        
        for (const endpoint of endpoints) {
            try {
                console.log(`Testing endpoint: ${endpoint}`);
                const response = await fetch(endpoint, {
                    method: 'OPTIONS',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.status === 204 || response.ok) {
                    console.log('✅ API configuration check passed');
                    return { ok: true };
                }
                
                const errorData = await response.json().catch(() => ({}));
                if (errorData.error?.toLowerCase().includes('api key')) {
                    apiKeyMissing = true;
                }
            } catch (error) {
                console.warn('⚠️ API configuration check warning:', error);
                // Continue to next endpoint if available
            }
        }
        
        if (apiKeyMissing) {
            return {
                ok: false,
                message: 'The Perplexity API key is not configured. Please add your API key to the .env file.'
            };
        }
        
        // If we get here, we'll let the main function try all endpoints
        return { ok: true };
    }
    
    // Add this for the small spinner in the button
    const style = document.createElement('style');
    style.textContent = `
        .spinner-small {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s linear infinite;
            margin-right: 8px;
            display: inline-block;
        }
        
        #propertyResults {
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .btn-clicked {
            transform: scale(0.97);
            opacity: 0.9;
            transition: transform 0.1s ease, opacity 0.1s ease;
        }
    `;
    document.head.appendChild(style);
}); 