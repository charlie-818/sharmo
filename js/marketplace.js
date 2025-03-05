/**
 * Marketplace functionality for sharmo
 * Handles property display, filtering, and lookup
 */
document.addEventListener('DOMContentLoaded', () => {
    // Utility function to check if images exist
    function checkImageExists(url) {
        const img = new Image();
        img.src = url;
        img.onload = () => console.log('Image exists:', url);
        img.onerror = () => console.error('Image does not exist:', url);
    }

    // View toggle functionality
    const setupViewToggle = () => {
        const toggleBtns = document.querySelectorAll('.toggle-btn');
        const views = document.querySelectorAll('.view-content');
        
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update button states
                toggleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Show selected view
                const viewToShow = btn.dataset.view;
                views.forEach(view => {
                    view.style.display = view.id === `${viewToShow}-view` ? 'block' : 'none';
                });
            });
        });
    };

    // Property lookup functionality
    const setupPropertyLookup = () => {
        // Add event listener for lookup button
        const lookupBtn = document.getElementById('lookupBtn');
        if (lookupBtn) {
            lookupBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const results = document.getElementById('propertyResults');
                if (!results) return;

                results.style.display = 'block';
                results.innerHTML = `
                    <div class="loading-indicator">
                        <div class="spinner"></div>
                    </div>
                `;

                try {
                    const response = await fetch('/.netlify/functions/property-lookup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            address: document.getElementById('address')?.value || '',
                            city: document.getElementById('city')?.value || '',
                            state: document.getElementById('state')?.value || ''
                        })
                    });

                    if (!response.ok) throw new Error('Failed to fetch property data');
                    const data = await response.json();
                    
                    results.innerHTML = createDashboardHTML(data);
                } catch (error) {
                    results.innerHTML = `
                        <div class="error-message">
                            <p>Sorry, we couldn't find the property details.</p>
                            <p class="error-details">${error.message}</p>
                        </div>
                    `;
                }
            });
        }
    };

    // Show property lookup view
    window.showPropertyLookup = (event) => {
        if (event) event.preventDefault();
        const marketplaceView = document.querySelector('.marketplace-view');
        const lookupView = document.querySelector('.lookup-view');
        const pageTitle = document.querySelector('.marketplace-title');
        
        if (marketplaceView) marketplaceView.style.display = 'none';
        if (lookupView) lookupView.style.display = 'block';
        if (pageTitle) pageTitle.textContent = 'Property Lookup';
    };

    // Show marketplace view
    window.showMarketplace = () => {
        const marketplaceView = document.querySelector('.marketplace-view');
        const lookupView = document.querySelector('.lookup-view');
        const pageTitle = document.querySelector('.marketplace-title');
        
        if (marketplaceView) marketplaceView.style.display = 'block';
        if (lookupView) lookupView.style.display = 'none';
        if (pageTitle) pageTitle.textContent = 'Property Marketplace';
    };

    // Create dashboard HTML from property data
    function createDashboardHTML(data) {
        return `
            <div class="dashboard-grid">
                <!-- Key Metrics Card -->
                <div class="dashboard-card metrics-card">
                    <div class="metric-group">
                        <div class="metric primary">
                            <span class="metric-value">$${data.propertyData.estimatedValue.toLocaleString()}</span>
                            <span class="metric-label">Property Value</span>
                            <div class="metric-trend">+12% vs Market Avg</div>
                        </div>
                        <div class="stats-row">
                            <div class="stat">
                                <span class="stat-label">Annual Rental Income</span>
                                <span class="stat-value">$${Math.round(data.propertyData.estimatedValue * 0.08).toLocaleString()}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Cap Rate</span>
                                <span class="stat-value">8%</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">5-Year ROI</span>
                                <span class="stat-value">47%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Property Details -->
                <div class="dashboard-card details-card">
                    <div class="property-header">
                        <div class="property-type">
                            <i class="fas fa-home"></i>
                            <span>${data.propertyData.propertyType}</span>
                        </div>
                        <div class="property-specs">
                            <span><i class="fas fa-bed"></i> ${data.propertyData.bedrooms}</span>
                            <span><i class="fas fa-bath"></i> ${data.propertyData.bathrooms}</span>
                            <span><i class="fas fa-ruler-combined"></i> ${data.propertyData.squareFootage.toLocaleString()} sqft</span>
                        </div>
                    </div>
                    <div class="property-features">
                        <div class="feature">
                            <span class="feature-label">Year Built</span>
                            <span class="feature-value">${data.propertyData.yearBuilt}</span>
                        </div>
                        <div class="feature">
                            <span class="feature-label">Lot Size</span>
                            <span class="feature-value">${data.propertyData.lotSize}</span>
                        </div>
                        <div class="feature">
                            <span class="feature-label">Price per Sqft</span>
                            <span class="feature-value">$${Math.round(data.propertyData.estimatedValue / data.propertyData.squareFootage).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <!-- Action Button -->
                <a href="/wallet.html" class="tokenize-btn" onclick="localStorage.setItem('propertyValue', '${data.propertyData.estimatedValue}')">
                    Start Tokenization Process
                </a>
            </div>
        `;
    }

    // Property data generation 
    const generateProperties = () => {
        const propertyGrid = document.querySelector('.property-grid');
        if (!propertyGrid) return;
        
        let currentPage = 1;
        const propertiesPerPage = 8;
        let allProperties = [];
        let filteredProperties = [];
        let lastUsedImageIndex = -1;  // Track the last used image index
        
        // Sample data arrays for realistic property generation
        const locations = [
            { city: "Beverly Hills", state: "CA" },
            { city: "Manhattan", state: "NY" },
            { city: "Miami Beach", state: "FL" },
            { city: "Aspen", state: "CO" },
            { city: "San Francisco", state: "CA" },
            { city: "Seattle", state: "WA" },
            { city: "Austin", state: "TX" },
            { city: "Chicago", state: "IL" },
            { city: "Boston", state: "MA" },
            { city: "Las Vegas", state: "NV" }
        ];

        const houseImages = [
            'pexels-binyaminmellish-106399.jpg',
            'pexels-binyaminmellish-1396132.jpg',
            'pexels-expect-best-79873-323780.jpg',
            'pexels-luis-yanez-57302-206172.jpg',
            'pexels-pixabay-210617.jpg',
            'pexels-pixabay-259588.jpg',
            'pexels-pixabay-259593.jpg',
            'pexels-pixabay-277667.jpg',
            'pexels-pixasquare-1115804.jpg',
            'pexels-scottwebb-1029599.jpg',
            'pexels-fotios-photos-2816323.jpg',
            'pexels-tara-winstead-8407011.jpg',
            'pexels-perqued-13041118.jpg',
            'pexels-heyho-7598376.jpg',
            'pexels-b-s-gulesan-2144469394-30847025.jpg',
            'pexels-szafran-30866045.jpg',
            'pexels-lina-3639542.jpg',
            'pexels-julia-kuzenkov-442028-1974596.jpg'
        ];

        const propertyTypes = [
            "Luxury Villa",
            "Penthouse Suite",
            "Beachfront Property",
            "Mountain Resort",
            "Modern Loft",
            "Historic Mansion",
            "Urban Townhouse",
            "Waterfront Estate",
            "Sky Villa",
            "Desert Oasis"
        ];

        function generateRandomProperty() {
            const location = locations[Math.floor(Math.random() * locations.length)];
            const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
            const tokenizationProgress = Math.floor(Math.random() * 100);
            const propertyValue = (2 + Math.random() * 18).toFixed(1);
            const tokenPrice = Math.floor(propertyValue * 1000000 / 10000);
            const beds = Math.floor(3 + Math.random() * 7);
            const baths = Math.floor(beds * 0.7);
            const sqft = Math.floor(2000 + Math.random() * 8000);
            
            // Get a random image that's different from the last one
            let newImageIndex;
            do {
                newImageIndex = Math.floor(Math.random() * houseImages.length);
            } while (newImageIndex === lastUsedImageIndex);
            
            lastUsedImageIndex = newImageIndex;
            const image = houseImages[newImageIndex];

            return {
                type: propertyType,
                location: `${location.city}, ${location.state}`,
                beds,
                baths,
                sqft,
                tokenization: tokenizationProgress,
                tokenPrice,
                propertyValue,
                image: image,
                status: tokenizationProgress < 100 ? 'Available' : 'Fully Tokenized'
            };
        }

        // Generate all properties once
        for (let i = 0; i < 24; i++) {
            allProperties.push(generateRandomProperty());
        }
        filteredProperties = [...allProperties];

        // Setup search functionality
        const propertySearch = document.getElementById('propertySearch');
        const propertyType = document.getElementById('propertyType');
        const priceRange = document.getElementById('priceRange');
        const tokenization = document.getElementById('tokenization');

        if (propertySearch) {
            // Add debounce for search input
            let searchTimeout;
            propertySearch.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(filterProperties, 300);
            });
        }

        // Immediate filter for select inputs
        if (propertyType) propertyType.addEventListener('change', filterProperties);
        if (priceRange) priceRange.addEventListener('change', filterProperties);
        if (tokenization) tokenization.addEventListener('change', filterProperties);

        function displayProperties(page) {
            const startIndex = (page - 1) * propertiesPerPage;
            const endIndex = startIndex + propertiesPerPage;
            const propertiesToShow = filteredProperties.slice(startIndex, endIndex);
            
            propertyGrid.innerHTML = ''; // Clear existing properties

            propertiesToShow.forEach(property => {
                const propertyCard = `
                    <div class="property-card">
                        <div class="property-image">
                            <img src="./images/house_pictures/${property.image}" 
                                 alt="${property.type}"
                                 onload="console.log('Image loaded successfully:', this.src)"
                                 onerror="console.error('Failed to load image:', this.src, 'Error:', event);">
                            <div class="property-status ${property.status === 'Available' ? 'available' : 'tokenized'}">${property.status}</div>
                        </div>
                        <div class="property-details">
                            <h3>${property.type}</h3>
                            <p class="location">${property.location}</p>
                            <div class="property-stats">
                                <span>${property.beds} Beds</span>
                                <span>${property.baths} Baths</span>
                                <span>${property.sqft.toLocaleString()} sqft</span>
                            </div>
                            <div class="tokenization-info">
                                <div class="progress-bar">
                                    <div class="progress" style="width: ${property.tokenization}%"></div>
                                </div>
                                <p>${property.tokenization}% Tokenized</p>
                            </div>
                            <div class="price-info">
                                <div class="token-price">
                                    <span>Token Price</span>
                                    <strong>$${property.tokenPrice.toLocaleString()}</strong>
                                </div>
                                <div class="property-value">
                                    <span>Property Value</span>
                                    <strong>$${property.propertyValue}M</strong>
                                </div>
                            </div>
                            <a href="/wallet.html" class="invest-btn">Invest Now</a>
                        </div>
                    </div>
                `;
                propertyGrid.innerHTML += propertyCard;
            });

            // Update pagination buttons state
            const prevButton = document.querySelector('.page-btn.prev');
            const nextButton = document.querySelector('.page-btn.next');
            
            if (prevButton && nextButton) {
                prevButton.disabled = currentPage === 1;
                nextButton.disabled = currentPage >= Math.ceil(filteredProperties.length / propertiesPerPage);
                
                prevButton.style.opacity = prevButton.disabled ? '0.5' : '1';
                nextButton.style.opacity = nextButton.disabled ? '0.5' : '1';
            }
        }

        // Initialize pagination
        const setupPagination = () => {
            const prevButton = document.querySelector('.page-btn.prev');
            const nextButton = document.querySelector('.page-btn.next');
            
            if (prevButton) {
                prevButton.addEventListener('click', () => {
                    if (currentPage > 1) {
                        currentPage--;
                        displayProperties(currentPage);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                });
            }
            
            if (nextButton) {
                nextButton.addEventListener('click', () => {
                    if (currentPage < Math.ceil(filteredProperties.length / propertiesPerPage)) {
                        currentPage++;
                        displayProperties(currentPage);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                });
            }
        };

        // Filter properties based on user inputs
        function filterProperties() {
            if (!propertySearch || !propertyType || !priceRange || !tokenization) return;
            
            const searchTerm = propertySearch.value.toLowerCase();
            const selectedType = propertyType.value;
            const selectedPriceRange = priceRange.value;
            const selectedTokenization = tokenization.value;

            filteredProperties = allProperties.filter(property => {
                // Search term filter
                const matchesSearch = 
                    property.type.toLowerCase().includes(searchTerm) ||
                    property.location.toLowerCase().includes(searchTerm) ||
                    property.propertyValue.toString().includes(searchTerm);

                // Property type filter
                const matchesType = !selectedType || 
                    property.type.toLowerCase().includes(selectedType.toLowerCase());

                // Price range filter
                let matchesPrice = true;
                if (selectedPriceRange) {
                    const propertyPriceInDollars = property.propertyValue * 1000000;
                    const [minPrice, maxPrice] = selectedPriceRange.split('-').map(Number);
                    matchesPrice = propertyPriceInDollars >= minPrice && propertyPriceInDollars <= maxPrice;
                }

                // Tokenization status filter
                let matchesTokenization = true;
                if (selectedTokenization) {
                    switch(selectedTokenization) {
                        case 'available':
                            matchesTokenization = property.tokenization < 100;
                            break;
                        case 'in-progress':
                            matchesTokenization = property.tokenization > 0 && property.tokenization < 100;
                            break;
                        case 'completed':
                            matchesTokenization = property.tokenization === 100;
                            break;
                    }
                }

                return matchesSearch && matchesType && matchesPrice && matchesTokenization;
            });

            // Reset to first page when filtering
            currentPage = 1;
            displayProperties(currentPage);

            // Update UI to show number of results
            const resultsCount = document.createElement('p');
            resultsCount.className = 'results-count';
            resultsCount.textContent = `${filteredProperties.length} properties found`;
            const existingCount = document.querySelector('.results-count');
            if (existingCount) {
                existingCount.remove();
            }
            document.querySelector('.property-grid').insertAdjacentElement('beforebegin', resultsCount);
        }

        // Initialize property display
        displayProperties(currentPage);
        setupPagination();
    };

    // Show marketplace by default
    showMarketplace();
    
    // Initialize all functionality
    setupViewToggle();
    setupPropertyLookup();
    generateProperties();
}); 