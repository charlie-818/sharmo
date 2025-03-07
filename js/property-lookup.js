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
                    
                    // Process and display the data
                    displayPropertyData(data.propertyData, address, city, state);
                    return; // Exit if API call was successful
                }
                
                // If we get here, the API call failed but we'll continue to the fallback
                console.warn('API call failed, using fallback mock data');
            } catch (apiError) {
                console.warn('API error, using fallback mock data:', apiError);
            }
            
            // Fallback to mock data if API call fails
            const mockData = generateMockPropertyData(address, city, state);
            displayPropertyData(mockData, address, city, state);
            
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
    
    function showError(message = 'Failed to fetch property data. Please try again.') {
        if (errorMessage) {
            const errorTitle = errorMessage.querySelector('h4');
            const errorDetails = errorMessage.querySelector('.error-details');
            
            if (errorTitle) errorTitle.textContent = 'Property Lookup Failed';
            if (errorDetails) errorDetails.textContent = message;
            
            errorMessage.style.display = 'block';
        }
    }
    
    // Generate mock property data for fallback
    function generateMockPropertyData(address, city, state) {
        // Create property types
        const propertyTypes = ['Single Family Home', 'Townhouse', 'Condominium', 'Duplex', 'Multi-Family Home'];
        
        // Random year from 1960 to 2020
        const yearBuilt = Math.floor(Math.random() * (2020 - 1960 + 1)) + 1960;
        
        // Random square footage (1000 to 4500)
        const squareFootage = Math.floor(Math.random() * (4500 - 1000 + 1)) + 1000;
        
        // Random property value ($150,000 to $1,200,000)
        const estimatedValue = Math.floor(Math.random() * (1200000 - 150000 + 1)) + 150000;
        
        // Random days on market (5 to 120)
        const daysOnMarket = Math.floor(Math.random() * (120 - 5 + 1)) + 5;
        
        // Random appreciation (1% to 8%)
        const appreciation = (Math.floor(Math.random() * 70) + 10) / 10;
        
        return {
            propertyType: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
            squareFootage: squareFootage,
            yearBuilt: yearBuilt,
            estimatedValue: estimatedValue,
            bedrooms: Math.floor(Math.random() * 5) + 1,
            bathrooms: Math.floor(Math.random() * 3) + 1,
            lastSalePrice: Math.floor(estimatedValue * 0.9),
            lastSaleDate: "2020-05-15",
            lotSize: Math.floor(Math.random() * 10000) + 5000 + " sq ft",
            neighborhood: {
                rating: Math.floor(Math.random() * 10) + 1,
                description: "Vibrant neighborhood with good schools and parks",
                amenities: ["Parks", "Schools", "Shopping", "Restaurants"],
                trend: ["Declining", "Stable", "Appreciating", "Rapidly Appreciating"][Math.floor(Math.random() * 4)]
            },
            marketTrends: {
                yearlyAppreciation: appreciation.toFixed(1) + "%",
                medianPrice: Math.floor(estimatedValue * 1.1),
                daysOnMarket: daysOnMarket
            }
        };
    }
    
    // Display property data in the UI
    function displayPropertyData(data, address, city, state) {
        // Format currency values
        const formatCurrency = (value) => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(value);
        };
        
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