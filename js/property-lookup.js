// Property Lookup JS
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const lookupForm = document.querySelector('.lookup-form');
    const lookupBtn = document.getElementById('lookupBtn');
    const addressInput = document.getElementById('address');
    const cityInput = document.getElementById('city');
    const stateSelect = document.getElementById('state');
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
    
    // Property types
    const propertyTypes = ['Single Family', 'Multi-Family', 'Condominium', 'Townhouse', 'Commercial'];
    
    // Add event listener to the lookup button
    lookupBtn.addEventListener('click', lookupProperty);
    
    // Also trigger lookup on form submission
    lookupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        lookupProperty();
    });
    
    // Function to handle property lookup
    function lookupProperty() {
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Show loading indicator
        propertyResults.style.display = 'none';
        errorMessage.style.display = 'none';
        loadingIndicator.style.display = 'block';
        
        // Get form data
        const address = addressInput.value.trim();
        const city = cityInput.value.trim();
        const state = stateSelect.value;
        
        // Make API call to the Netlify function
        fetch('/.netlify/functions/property-lookup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: address,
                city: city,
                state: state
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Process the data from the API
            if (data && data.propertyData) {
                // Display the retrieved property data
                displayPropertyData(data.propertyData, address, city, state);
            } else {
                throw new Error('Invalid response data');
            }
        })
        .catch(error => {
            console.error('Error fetching property data:', error);
            showError();
        })
        .finally(() => {
            // Hide loading indicator
            loadingIndicator.style.display = 'none';
        });
    }
    
    // Form validation
    function validateForm() {
        let isValid = true;
        
        if (!addressInput.value.trim()) {
            highlightError(addressInput);
            isValid = false;
        } else {
            removeHighlight(addressInput);
        }
        
        if (!cityInput.value.trim()) {
            highlightError(cityInput);
            isValid = false;
        } else {
            removeHighlight(cityInput);
        }
        
        if (!stateSelect.value) {
            highlightError(stateSelect);
            isValid = false;
        } else {
            removeHighlight(stateSelect);
        }
        
        return isValid;
    }
    
    // Highlight field with error
    function highlightError(element) {
        element.style.borderColor = '#ef4444';
        element.style.backgroundColor = 'rgba(254, 242, 242, 0.5)';
        
        // Add shake animation
        element.classList.remove('shake');
        void element.offsetWidth; // Trigger reflow
        element.classList.add('shake');
        
        element.addEventListener('focus', function onFocus() {
            removeHighlight(element);
            element.removeEventListener('focus', onFocus);
        });
    }
    
    // Remove error highlighting
    function removeHighlight(element) {
        element.style.borderColor = '';
        element.style.backgroundColor = '';
    }
    
    // Display property data from API response
    function displayPropertyData(propertyData, address, city, state) {
        // Update UI with property data
        resultAddress.textContent = address;
        resultCity.textContent = city;
        resultState.textContent = getStateName(state);
        
        // Display property information
        propertyType.textContent = propertyData.propertyType || 'Not available';
        squareFootage.textContent = propertyData.squareFootage 
            ? propertyData.squareFootage.toLocaleString() + ' sq ft'
            : 'Not available';
        yearBuilt.textContent = propertyData.yearBuilt || 'Not available';
        
        // Format the property value as currency
        propertyValue.textContent = propertyData.estimatedValue 
            ? '$' + propertyData.estimatedValue.toLocaleString()
            : 'Not available';
        
        // Calculate token potential based on property value
        // Higher value properties have better token potential
        const value = propertyData.estimatedValue || 0;
        const potentialScore = Math.min(95, Math.max(50, Math.floor((value / 1000000) * 100) + 60));
        tokenPotential.textContent = potentialScore + '%';
        
        // Calculate liquidity score based on market trends
        const marketData = propertyData.marketTrends || {};
        const daysOnMarket = marketData.daysOnMarket || 60;
        // Shorter days on market means better liquidity
        const liquidityValue = Math.min(10, Math.max(1, 11 - Math.floor(daysOnMarket / 10)));
        liquidityScore.textContent = liquidityValue + '/10';
        
        // Store property value for potential use in tokenization
        localStorage.setItem('propertyValue', propertyData.estimatedValue || 0);
        localStorage.setItem('propertyAddress', address);
        localStorage.setItem('propertyCity', city);
        localStorage.setItem('propertyState', state);
        
        // Show results with animation
        propertyResults.style.opacity = '0';
        propertyResults.style.transform = 'translateY(20px)';
        propertyResults.style.display = 'block';
        
        setTimeout(() => {
            propertyResults.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            propertyResults.style.opacity = '1';
            propertyResults.style.transform = 'translateY(0)';
        }, 10);
    }
    
    // Show error message
    function showError() {
        errorMessage.style.display = 'block';
        errorMessage.style.opacity = '0';
        errorMessage.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            errorMessage.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            errorMessage.style.opacity = '1';
            errorMessage.style.transform = 'translateY(0)';
        }, 10);
    }
    
    // Get full state name from abbreviation
    function getStateName(abbr) {
        const states = {
            'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
            'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'District Of Columbia',
            'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois',
            'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana',
            'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota',
            'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
            'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
            'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon',
            'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota',
            'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia',
            'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
        };
        return states[abbr] || abbr;
    }
    
    // Add CSS for shake animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .shake {
            animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }
    `;
    document.head.appendChild(style);
}); 