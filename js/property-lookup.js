// Property Lookup JS
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
    
    // New UI elements
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
    function lookupProperty() {
        // Form validation
        if (!validateForm()) {
            return;
        }
        
        // Show loading indicator
        propertyResults.style.display = 'none';
        errorMessage.style.display = 'none';
        loadingIndicator.style.display = 'block';
        
        // Get values
        const address = addressInput.value.trim();
        const city = cityInput.value.trim();
        const state = stateSelect.value;
        
        // Add loading state to button
        lookupBtn.disabled = true;
        lookupBtn.innerHTML = '<div class="spinner-small"></div><span>Searching...</span>';
        
        // Mock API call with setTimeout to simulate network request
        setTimeout(function() {
            try {
                // Generate mock data for demonstration
                const propertyData = generateMockPropertyData(address, city, state);
                
                // Hide loading indicator
                loadingIndicator.style.display = 'none';
                
                // Display the property data
                displayPropertyData(propertyData, address, city, state);
                
                // Reset button state
                lookupBtn.disabled = false;
                lookupBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><span>Search</span>';
            } catch (error) {
                console.error('Error in property lookup:', error);
                
                // Hide loading indicator
                loadingIndicator.style.display = 'none';
                
                // Show error message
                showError();
                
                // Reset button state
                lookupBtn.disabled = false;
                lookupBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><span>Search</span>';
            }
        }, 1500); // 1.5 second delay to simulate network request
    }
    
    // Form validation
    function validateForm() {
        let isValid = true;
        
        // Clear previous error messages
        [addressInput, cityInput, stateSelect].forEach(element => {
            removeHighlight(element);
        });
        
        // Validate address
        if (!addressInput.value.trim()) {
            highlightError(addressInput);
            isValid = false;
        }
        
        // Validate city
        if (!cityInput.value.trim()) {
            highlightError(cityInput);
            isValid = false;
        }
        
        // Validate state
        if (!stateSelect.value) {
            highlightError(stateSelect);
            isValid = false;
        }
        
        return isValid;
    }
    
    // Highlight error fields
    function highlightError(element) {
        element.classList.add('form-error');
        element.classList.add('shake');
        
        element.addEventListener('input', function onInput() {
            removeHighlight(element);
            element.removeEventListener('input', onInput);
        });
        
        element.addEventListener('focus', function onFocus() {
            removeHighlight(element);
            element.removeEventListener('focus', onFocus);
        });
    }
    
    // Remove error highlighting
    function removeHighlight(element) {
        element.classList.remove('form-error');
        element.classList.remove('shake');
    }
    
    // Generate mock property data for demonstration
    function generateMockPropertyData(address, city, state) {
        // Create property types
        const propertyTypes = ['Single Family Home', 'Townhouse', 'Condominium', 'Duplex', 'Multi-Family Home'];
        
        // Random year from 1960 to 2020
        const yearBuilt = Math.floor(Math.random() * (2020 - 1960 + 1)) + 1960;
        
        // Random square footage (1000 to 4500)
        const squareFootage = (Math.floor(Math.random() * (4500 - 1000 + 1)) + 1000).toLocaleString();
        
        // Random property value ($150,000 to $1,200,000)
        const propertyValue = '$' + (Math.floor(Math.random() * (1200000 - 150000 + 1)) + 150000).toLocaleString();
        
        // Token potential values: High, Medium, Low
        const tokenPotentials = ['High', 'Medium', 'Low'];
        const tokenPotential = tokenPotentials[Math.floor(Math.random() * tokenPotentials.length)];
        
        // Liquidity score (1 to 10)
        const liquidityScore = (Math.floor(Math.random() * 10) + 1) + '/10';
        
        // Return rate (3% to 12%)
        const returnRate = (Math.floor(Math.random() * 90) + 30) / 10 + '%';
        
        // Market demand (Low, Moderate, High, Very High)
        const demands = ['Low', 'Moderate', 'High', 'Very High'];
        const marketDemand = demands[Math.floor(Math.random() * demands.length)];
        
        // Blockchain fee (0.01 to 0.1 ETH)
        const fee = (Math.floor(Math.random() * 10) + 1) / 100;
        const blockchainFee = fee.toFixed(2) + ' ETH';
        
        // Neighborhood trend (Declining, Stable, Appreciating, Rapidly Appreciating)
        const trends = ['Declining', 'Stable', 'Appreciating', 'Rapidly Appreciating'];
        const neighborhoodTrend = trends[Math.floor(Math.random() * trends.length)];
        
        // Rental income ($800 to $5000)
        const rental = Math.floor(Math.random() * (5000 - 800 + 1)) + 800;
        const rentalIncome = '$' + rental.toLocaleString() + '/mo';
        
        // Appreciation rate (1% to 8%)
        const appreciation = (Math.floor(Math.random() * 70) + 10) / 10;
        const appreciationRate = '+' + appreciation.toFixed(1) + '% annually';
        
        return {
            propertyType: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
            squareFootage,
            yearBuilt,
            propertyValue,
            tokenPotential,
            liquidityScore,
            returnRate,
            marketDemand,
            blockchainFee,
            neighborhoodTrend,
            rentalIncome,
            appreciationRate
        };
    }
    
    // Display property data in the UI
    function displayPropertyData(propertyData, address, city, state) {
        // Update the data in the UI
        document.getElementById('resultAddress').textContent = address;
        document.getElementById('resultCity').textContent = city;
        document.getElementById('resultState').textContent = getStateName(state);
        document.getElementById('propertyType').textContent = propertyData.propertyType;
        document.getElementById('squareFootage').textContent = propertyData.squareFootage + ' sq ft';
        document.getElementById('yearBuilt').textContent = propertyData.yearBuilt;
        document.getElementById('propertyValue').textContent = propertyData.propertyValue;
        
        // Set token potential with color coding
        const tokenPotentialElement = document.getElementById('tokenPotential');
        tokenPotentialElement.textContent = propertyData.tokenPotential;
        
        // Apply color based on token potential
        if (propertyData.tokenPotential === 'High') {
            tokenPotentialElement.style.color = '#10b981'; // Success green
        } else if (propertyData.tokenPotential === 'Medium') {
            tokenPotentialElement.style.color = '#f59e0b'; // Warning yellow
        } else {
            tokenPotentialElement.style.color = '#ef4444'; // Error red
        }
        
        // Set liquidity score
        document.getElementById('liquidityScore').textContent = propertyData.liquidityScore;
        
        // Set new fields
        document.getElementById('returnRate').textContent = propertyData.returnRate;
        document.getElementById('marketDemand').textContent = propertyData.marketDemand;
        document.getElementById('blockchainFee').textContent = propertyData.blockchainFee;
        document.getElementById('neighborhoodTrend').textContent = propertyData.neighborhoodTrend;
        document.getElementById('rentalIncome').textContent = propertyData.rentalIncome;
        document.getElementById('appreciationRate').textContent = propertyData.appreciationRate;
        
        // Show results container with animation
        propertyResults.style.opacity = '0';
        propertyResults.style.display = 'block';
        
        // Animate the appearance
        setTimeout(function() {
            propertyResults.style.opacity = '1';
            propertyResults.style.transform = 'translateY(0)';
            
            // Scroll to results
            const resultsOffset = propertyResults.offsetTop - 20;
            window.scrollTo({
                top: resultsOffset,
                behavior: 'smooth'
            });
        }, 100);
    }
    
    // Show error message
    function showError() {
        errorMessage.style.display = 'block';
    }
    
    // Helper function to get full state name from abbreviation
    function getStateName(abbr) {
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
        return states[abbr] || abbr;
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