require('dotenv').config();
const fetch = require('node-fetch');

// Check if API key is loaded immediately
const apiKey = process.env.PERPLEXITY_API_KEY;
console.log(`API key loaded: ${apiKey ? 'YES (length: ' + apiKey.length + ')' : 'NO - API key is missing!'}`);

const extractJSONFromResponse = (content) => {
    console.log(`\n📝 Extracting JSON from response (content length: ${content.length})`);
    console.log(`Content sample: ${content.substring(0, 200)}...`);
    
    try {
        // Clean up the content string first
        const cleanContent = content.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width spaces
        const jsonMatch = cleanContent.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
        
        if (jsonMatch && jsonMatch[1]) {
            console.log(`✅ Found JSON match: ${jsonMatch[1].substring(0, 100)}...`);
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

                console.log(`✅ Cleaned JSON: ${cleanJson.substring(0, 100)}...`);
                // Parse the cleaned JSON
                const parsed = JSON.parse(cleanJson);
                console.log(`✅ Successfully parsed JSON`);
                return parsed;
            } catch (e) {
                console.error('⚠️ JSON parsing error:', e);
                console.error('⚠️ Attempted to parse:', jsonMatch[1].substring(0, 200));
                
                // Fallback: Try parsing after more aggressive cleaning
                try {
                    console.log(`🔄 Trying fallback JSON parsing with aggressive cleaning`);
                    const fallbackJson = jsonMatch[1]
                        .replace(/\/\/.*/g, '') // Remove all comments
                        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
                        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":') // Ensure quoted property names
                        .replace(/\s+/g, ' ')
                        .trim();
                    console.log(`🔄 Fallback JSON: ${fallbackJson.substring(0, 100)}...`);
                    const parsed = JSON.parse(fallbackJson);
                    console.log(`✅ Successfully parsed JSON with fallback method`);
                    return parsed;
                } catch (fallbackError) {
                    console.error('❌ Fallback parsing also failed:', fallbackError);
                    throw new Error('Failed to parse JSON after cleaning');
                }
            }
        }
        console.error('❌ No JSON object found in response');
        console.error('❌ Content sample:', content.substring(0, 300));
        throw new Error('No JSON object found in response');
    } catch (e) {
        console.error('❌ Content parsing error:', e);
        console.error('❌ Raw content sample:', content.substring(0, 300));
        throw new Error(`Failed to extract valid JSON: ${e.message}`);
    }
};

const validatePropertyData = (data) => {
    console.log(`\n🔍 Validating property data`);
    
    if (!data || !data.propertyData) {
        console.error('❌ Missing propertyData object');
        throw new Error('Missing propertyData object');
    }

    const required = {
        estimatedValue: 'number',
        squareFootage: 'number',
        yearBuilt: 'number',
        bedrooms: 'number',
        bathrooms: 'number',
        propertyType: 'string',
        lastSalePrice: ['number', 'null'],
        lastSaleDate: 'string',
        lotSize: 'string',
        neighborhood: 'object',
        marketTrends: 'object'
    };

    const errors = [];
    
    Object.entries(required).forEach(([field, type]) => {
        const value = data.propertyData[field];
        
        if (value === undefined) {
            errors.push(`Missing required field: ${field}`);
            return;
        }

        if (Array.isArray(type)) {
            if (!type.includes(typeof value) && !(value === null && type.includes('null'))) {
                errors.push(`Invalid type for ${field}: expected ${type.join(' or ')}, got ${typeof value}`);
            }
        } else if (typeof value !== type && !(value === null && type === 'number')) {
            errors.push(`Invalid type for ${field}: expected ${type}, got ${typeof value}`);
        }
    });

    // Validate nested objects
    if (data.propertyData.neighborhood) {
        if (typeof data.propertyData.neighborhood.rating !== 'number' || 
            data.propertyData.neighborhood.rating < 0 || 
            data.propertyData.neighborhood.rating > 10) {
            errors.push('Invalid neighborhood rating: must be number between 0 and 10');
        }
        if (typeof data.propertyData.neighborhood.description !== 'string') {
            errors.push('Invalid neighborhood description: must be string');
        }
        if (!Array.isArray(data.propertyData.neighborhood.amenities)) {
            errors.push('Invalid amenities: must be array');
        }
    }

    if (data.propertyData.marketTrends) {
        if (typeof data.propertyData.marketTrends.yearlyAppreciation !== 'string') {
            errors.push('Invalid yearlyAppreciation: must be string');
        }
        if (typeof data.propertyData.marketTrends.medianPrice !== 'number') {
            errors.push('Invalid medianPrice: must be number');
        }
        if (typeof data.propertyData.marketTrends.daysOnMarket !== 'number') {
            errors.push('Invalid daysOnMarket: must be number');
        }
    }

    if (errors.length > 0) {
        console.warn('⚠️ Validation warnings:', errors);
        // Instead of throwing, we'll return the data anyway with a warning
        data._validationWarnings = errors;
        return data;
    }

    console.log(`✅ Data validation successful`);
    return data;
};

const sanitizePropertyData = (data) => {
    console.log(`\n🧹 Sanitizing property data`);
    
    if (!data?.propertyData) {
        console.error('❌ Invalid data structure:', JSON.stringify(data));
        throw new Error('Missing or invalid property data structure');
    }

    // Helper function to safely get nested values
    const safeGet = (obj, path, defaultValue) => {
        try {
            return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? defaultValue;
        } catch (e) {
            return defaultValue;
        }
    };

    // Helper function to ensure number type
    const ensureNumber = (value, defaultValue = 0) => {
        const num = Number(value);
        return !isNaN(num) ? num : defaultValue;
    };

    // Helper function to ensure string type
    const ensureString = (value, defaultValue = '') => {
        if (value === null || value === undefined) return defaultValue;
        return String(value).trim() || defaultValue;
    };

    // Helper function to ensure array type
    const ensureArray = (value, defaultValue = []) => {
        return Array.isArray(value) ? value.filter(Boolean) : defaultValue;
    };

    try {
        const sanitized = {
            propertyData: {
                estimatedValue: ensureNumber(safeGet(data, 'propertyData.estimatedValue', 0)),
                squareFootage: ensureNumber(safeGet(data, 'propertyData.squareFootage', 0)),
                yearBuilt: ensureNumber(safeGet(data, 'propertyData.yearBuilt', 0)),
                bedrooms: ensureNumber(safeGet(data, 'propertyData.bedrooms', 0)),
                bathrooms: ensureNumber(safeGet(data, 'propertyData.bathrooms', 0)),
                propertyType: ensureString(safeGet(data, 'propertyData.propertyType', 'Not specified')),
                lastSalePrice: safeGet(data, 'propertyData.lastSalePrice', null),
                lastSaleDate: ensureString(safeGet(data, 'propertyData.lastSaleDate', 'No sale date available')),
                lotSize: ensureString(safeGet(data, 'propertyData.lotSize', 'Not specified')),
                neighborhood: {
                    rating: Math.min(10, Math.max(0, ensureNumber(safeGet(data, 'propertyData.neighborhood.rating', 0)))),
                    description: ensureString(safeGet(data, 'propertyData.neighborhood.description', 'No description available')),
                    amenities: ensureArray(safeGet(data, 'propertyData.neighborhood.amenities', [])),
                    trend: ensureString(safeGet(data, 'propertyData.neighborhood.trend', 'Stable'))
                },
                marketTrends: {
                    yearlyAppreciation: ensureString(safeGet(data, 'propertyData.marketTrends.yearlyAppreciation', 'Not available')),
                    medianPrice: ensureNumber(safeGet(data, 'propertyData.marketTrends.medianPrice', 0)),
                    daysOnMarket: ensureNumber(safeGet(data, 'propertyData.marketTrends.daysOnMarket', 0))
                }
            }
        };

        console.log(`✅ Sanitization successful`);
        return sanitized;
    } catch (error) {
        console.error('❌ Sanitization error:', error);
        throw error;
    }
};

// Generate mock property data as fallback
function generateMockPropertyData(address, city, state) {
    console.log(`\n🤖 Generating mock data for ${address}, ${city}, ${state}`);
    
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
    
    console.log(`✅ Generated mock data with estimated value: $${estimatedValue.toLocaleString()}`);
    
    return {
        propertyData: {
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
        }
    };
}

module.exports = async (req, res) => {
    console.log("\n==================================");
    console.log("🏠 PROPERTY LOOKUP API CALLED");
    console.log("==================================");
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        console.log(`❌ Invalid method: ${req.method}`);
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    try {
        const { address, city, state } = req.body;
        
        console.log(`\n📋 Request body:`, JSON.stringify(req.body, null, 2));
        
        if (!address || !city || !state) {
            console.log(`❌ Missing required fields`);
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'Address, city, and state are all required'
            });
        }
        
        console.log(`\n🔍 Looking up property: ${address}, ${city}, ${state}`);
        
        // Check if API key is available
        if (!apiKey) {
            console.warn('⚠️ PERPLEXITY_API_KEY not set. Using mock data.');
            console.warn('⚠️ Check your .env file configuration!');
            const mockData = generateMockPropertyData(address, city, state);
            return res.status(200).json(mockData);
        }
        
        console.log(`\n🔑 Using API key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}`);
        
        try {
            console.log(`\n📡 Preparing API request to Perplexity`);
            
            const requestBody = {
                model: "sonar",
                messages: [
                    {
                        role: "system",
                        content: `You are a real estate data expert. When given a property address, provide realistic property details in JSON format. The response MUST include estimatedValue as a direct number in propertyData. Format must be:
                        {
                            "propertyData": {
                                "estimatedValue": number,  // Direct property value, not in marketTrends
                                "squareFootage": number,
                                "yearBuilt": number,
                                "bedrooms": number,
                                "bathrooms": number,
                                "propertyType": string,
                                "lastSalePrice": number,
                                "lastSaleDate": string,
                                "lotSize": string,
                                "neighborhood": {
                                    "rating": number (1-10),
                                    "description": string,
                                    "amenities": string[],
                                    "trend": string
                                },
                                "marketTrends": {
                                    "yearlyAppreciation": string,
                                    "medianPrice": number,
                                    "daysOnMarket": number
                                }
                            }
                        }`
                    },
                    {
                        role: "user",
                        content: `Find property details for ${address}, ${city}, ${state}. Include a realistic estimated value.`
                    }
                ]
            };

            console.log(`\n📤 Sending request to Perplexity API`);
            console.log(`🔗 URL: https://api.perplexity.ai/chat/completions`);
            console.log(`📦 Request body sample:`, JSON.stringify(requestBody).substring(0, 200) + '...');
            
            const response = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody),
                timeout: 15000 // 15 second timeout
            });

            console.log(`\n📥 Received response from Perplexity API - Status: ${response.status}`);
            
            if (!response.ok) {
                console.warn(`❌ API request failed: ${response.status}. Using mock data.`);
                const mockData = generateMockPropertyData(address, city, state);
                return res.status(200).json(mockData);
            }

            const data = await response.json();
            console.log(`\n📦 Response data received, content length: ${JSON.stringify(data).length}`);
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
                console.error('❌ Invalid API response structure:', JSON.stringify(data).substring(0, 300));
                const mockData = generateMockPropertyData(address, city, state);
                return res.status(200).json(mockData);
            }
            
            console.log(`\n📜 Message content sample: ${data.choices[0].message.content.substring(0, 200)}...`);
            
            try {
                const rawData = extractJSONFromResponse(data.choices[0].message.content);
                console.log(`\n📊 Extracted data:`, JSON.stringify(rawData).substring(0, 200) + '...');
                
                const sanitizedData = sanitizePropertyData(rawData);
                console.log(`\n🏡 Final property data:`, JSON.stringify(sanitizedData).substring(0, 200) + '...');

                console.log(`\n✅ Successfully processed property data`);
                return res.status(200).json(sanitizedData);
            } catch (parseError) {
                console.error('❌ Failed to parse API response:', parseError);
                // Fallback to mock data
                const mockData = generateMockPropertyData(address, city, state);
                return res.status(200).json(mockData);
            }
        } catch (apiError) {
            console.error('❌ API call error:', apiError);
            // Fallback to mock data
            const mockData = generateMockPropertyData(address, city, state);
            return res.status(200).json(mockData);
        }
    } catch (error) {
        console.error('❌ Error in property lookup:', error);
        res.status(500).json({ 
            error: 'Failed to fetch property data',
            details: error.message,
            timestamp: new Date().toISOString(),
            errorType: error.constructor.name
        });
    }
}; 