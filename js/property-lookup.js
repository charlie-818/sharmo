// Property Lookup JS with API Integration and Fallback
document.addEventListener('DOMContentLoaded', function() {
    // Grab form elements
    const addressInput = document.getElementById('address');
    const cityInput = document.getElementById('city');
    const stateSelect = document.getElementById('state');
    const lookupBtn = document.getElementById('lookupBtn');
    const propertyResults = document.getElementById('propertyResults');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    
    // Results elements
    const resultAddress = document.getElementById('resultAddress');
    const resultCity = document.getElementById('resultCity');
    const resultState = document.getElementById('resultState');
    const propertyType = document.getElementById('propertyType');
    const squareFootage = document.getElementById('squareFootage');
    const yearBuilt = document.getElementById('yearBuilt');
    const propertyValue = document.getElementById('propertyValue');
    const tokenPotential = document.getElementById('tokenPotential');
    const liquidityScore = document.getElementById('liquidityScore');
    const returnRate = document.getElementById('returnRate');
    const marketDemand = document.getElementById('marketDemand');
    const blockchainFee = document.getElementById('blockchainFee');
    const neighborhoodTrend = document.getElementById('neighborhoodTrend');
    const rentalIncome = document.getElementById('rentalIncome');
    const appreciationRate = document.getElementById('appreciationRate');
    
    // Property types
    const propertyTypes = ['Single Family', 'Multi-Family', 'Condominium', 'Townhouse', 'Commercial'];
    
    // Add event listener for form submission
    lookupBtn.addEventListener('click', function(e) {
        e.preventDefault();
        lookupProperty();
    });
    
    // Enable form submission with Enter key
    [addressInput, cityInput, stateSelect].forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                lookupProperty();
            }
        });
    });
    
    // Format currency values - moved to global scope
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };
    
    // Main lookup function
    async function lookupProperty() {
        if (!validateForm()) {
            return;
        }
        
        // Show loading state
        propertyResults.style.display = 'none';
        if (errorMessage) errorMessage.style.display = 'none';
        loadingIndicator.style.display = 'block';
        
        // Update button state
        lookupBtn.disabled = true;
        lookupBtn.innerHTML = '<div class="spinner-small"></div><span>Searching...</span>';
        
        try {
            const address = addressInput.value.trim();
            const city = cityInput.value.trim();
            const state = stateSelect.value;
            
            // Try to call the API first
            try {
                const response = await fetch('/api/property-lookup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ address, city, state })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.error) {
                        throw new Error(data.error);
                    }
                    
                    // Check if the API returned valid property data
                    if (!data.propertyData || !data.propertyData.estimatedValue) {
                        throw new Error("No valid property data found");
                    }
                    
                    // Process and display the data
                    displayPropertyData(data.propertyData, address, city, state);
                    return; // Exit if API call was successful
                }
                
                // If we get here, the API call failed
                throw new Error(`Property lookup failed with status: ${response.status}`);
            } catch (apiError) {
                console.warn('API error:', apiError);
                showError("We couldn't find property information for the address you provided. Please check the address and try again.");
            }
        } catch (error) {
            console.error('Error in property lookup:', error);
            showError(error.message);
        } finally {
            // Reset UI state
            loadingIndicator.style.display = 'none';
            lookupBtn.disabled = false;
            lookupBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><span>Search</span>';
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
            const errorDetails = errorMessage.querySelector('.error-details');
            
            if (errorTitle) errorTitle.textContent = 'Property Not Found';
            
            // Don't update the error details if we want to keep the formatted HTML with bullet points
            // Only update it for custom error messages
            if (errorDetails && message !== "We couldn't find property information for the address you provided. Please check the address and try again.") {
                errorDetails.innerHTML = message;
            }
            
            // Hide results and ensure error is visible
            propertyResults.style.display = 'none';
            errorMessage.style.display = 'block';
            
            // Ensure error message is visible by scrolling to it
            setTimeout(() => {
                const lookupForm = document.querySelector('.lookup-form');
                if (lookupForm) {
                    const formBottom = lookupForm.offsetTop + lookupForm.offsetHeight;
                    window.scrollTo({
                        top: formBottom - 30, // Position the window just below the form
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    }
    
    // Generate mock property data for fallback - No longer used directly
    function generateMockPropertyData(address, city, state) {
        // This function is kept for reference but will not be used as fallback
        // ... existing code ...
    }
    
    // Display property data in the UI
    function displayPropertyData(data, address, city, state) {
        // Update basic property information
        resultAddress.textContent = address;
        resultCity.textContent = city;
        resultState.textContent = getStateName(state);
        propertyType.textContent = data.propertyType || 'N/A';
        squareFootage.textContent = data.squareFootage ? `${data.squareFootage.toLocaleString()} sq ft` : 'N/A';
        yearBuilt.textContent = data.yearBuilt || 'N/A';
        
        // Update financial information
        propertyValue.textContent = data.estimatedValue ? formatCurrency(data.estimatedValue) : 'N/A';
        
        // Calculate and set token potential
        const potentialValue = calculateTokenPotential(data);
        tokenPotential.textContent = potentialValue;
        setTokenPotentialStyle(tokenPotential, potentialValue);
        
        // Update market analysis
        liquidityScore.textContent = calculateLiquidityScore(data);
        returnRate.textContent = data.marketTrends?.yearlyAppreciation || 'N/A';
        marketDemand.textContent = calculateMarketDemand(data);
        blockchainFee.textContent = '0.05 ETH'; // Fixed fee for now
        neighborhoodTrend.textContent = data.neighborhood?.trend || 'Stable';
        rentalIncome.textContent = calculateRentalIncome(data);
        appreciationRate.textContent = data.marketTrends?.yearlyAppreciation || 'N/A';
        
        // Show results with animation
        propertyResults.style.display = 'block';
        propertyResults.style.opacity = '0';
        setTimeout(() => {
            propertyResults.style.opacity = '1';
            propertyResults.style.transform = 'translateY(0)';
            
            // Scroll to results
            const resultsOffset = propertyResults.offsetTop - 20;
            window.scrollTo({
                top: resultsOffset,
                behavior: 'smooth'
            });
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
                    potential: tokenPotential.textContent
                });
                
                // Navigate to the smart contract generator page with property data
                window.location.href = `/smart-contract.html?${propertyParams.toString()}`;
            });
        }
    }
    
    // Helper functions for calculations
    function calculateTokenPotential(data) {
        if (!data.estimatedValue || !data.marketTrends) return 'Low';
        
        const score = (
            (data.estimatedValue > 500000 ? 2 : 1) +
            (parseFloat(data.marketTrends.yearlyAppreciation) > 5 ? 2 : 1) +
            (data.marketTrends.daysOnMarket < 30 ? 2 : 1)
        );
        
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
        }
    `;
    document.head.appendChild(style);
}); 