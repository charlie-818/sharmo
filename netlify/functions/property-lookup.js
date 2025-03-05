require('dotenv').config();
const fetch = require('node-fetch');

const apiKey = process.env.PERPLEXITY_API_KEY;

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
                console.error('Attempted to parse:', jsonMatch[1]);
                
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
        console.error('Raw content:', content);
        throw new Error(`Failed to extract valid JSON: ${e.message}`);
    }
};

const validatePropertyData = (data) => {
    if (!data || !data.propertyData) {
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

    // Validate market history
    if (!data.propertyData.marketHistory || 
        !Array.isArray(data.propertyData.marketHistory.years) ||
        !Array.isArray(data.propertyData.marketHistory.values) ||
        data.propertyData.marketHistory.years.length !== data.propertyData.marketHistory.values.length) {
        errors.push('Invalid market history data');
    }

    // Validate investment projection
    if (!data.propertyData.investmentProjection ||
        !Array.isArray(data.propertyData.investmentProjection.years) ||
        !Array.isArray(data.propertyData.investmentProjection.returns) ||
        data.propertyData.investmentProjection.years.length !== data.propertyData.investmentProjection.returns.length) {
        errors.push('Invalid investment projection data');
    }

    if (errors.length > 0) {
        console.error('Validation errors:', errors);
        throw new Error(`Data validation failed: ${errors.join('; ')}`);
    }

    return data;
};

const sanitizePropertyData = (data) => {
    if (!data?.propertyData) {
        console.error('Invalid data structure:', data);
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
                    amenities: ensureArray(safeGet(data, 'propertyData.neighborhood.amenities', []))
                },
                marketTrends: {
                    yearlyAppreciation: ensureString(safeGet(data, 'propertyData.marketTrends.yearlyAppreciation', 'Not available')),
                    medianPrice: ensureNumber(safeGet(data, 'propertyData.marketTrends.medianPrice', 0)),
                    daysOnMarket: ensureNumber(safeGet(data, 'propertyData.marketTrends.daysOnMarket', 0))
                },
                marketHistory: {
                    years: ensureArray(safeGet(data, 'propertyData.marketHistory.years', [])),
                    values: ensureArray(safeGet(data, 'propertyData.marketHistory.values', []))
                },
                investmentProjection: {
                    years: ensureArray(safeGet(data, 'propertyData.investmentProjection.years', [])),
                    returns: ensureArray(safeGet(data, 'propertyData.investmentProjection.returns', []))
                }
            }
        };

        return sanitized;
    } catch (error) {
        console.error('Sanitization error:', error);
        throw error;
    }
};

module.exports = {
    handler: async (event) => {
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Content-Type': 'application/json'
        };

        if (event.httpMethod === 'OPTIONS') {
            return { statusCode: 204, headers, body: '' };
        }

        if (event.httpMethod !== 'POST') {
            return { 
                statusCode: 405, 
                headers,
                body: JSON.stringify({ error: 'Method Not Allowed' })
            };
        }

        try {
            if (!apiKey) {
                throw new Error('PERPLEXITY_API_KEY environment variable is not set');
            }
            
            const { address, city, state } = JSON.parse(event.body);
            console.log(`\n🔍 Looking up property: ${address}, ${city}, ${state}`);
            
            // Format the Perplexity API request
            const promptData = `I need detailed information about a property located at ${address}, ${city}, ${state}. 
            Please provide realistic property data including estimated value, square footage, number of bedrooms/bathrooms, 
            property type, year built, last sale price and date, lot size, and neighborhood information. 
            Also include market trends like yearly appreciation, median price in the area, and average days on market.
            Return this data in a JSON format with a "propertyData" object containing all fields.`;
            
            // Make the request to the Perplexity API
            const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
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
                                    "lastSalePrice": number or null,
                                    "lastSaleDate": string,
                                    "lotSize": string,
                                    "neighborhood": {
                                        "rating": number (0-10),
                                        "description": string,
                                        "amenities": string[]
                                    },
                                    "marketTrends": {
                                        "yearlyAppreciation": string,
                                        "medianPrice": number,
                                        "daysOnMarket": number
                                    },
                                    "marketHistory": {
                                        "years": number[],
                                        "values": number[]
                                    },
                                    "investmentProjection": {
                                        "years": number[],
                                        "returns": number[]
                                    }
                                }
                            }`
                        },
                        {
                            role: "user",
                            content: promptData
                        }
                    ],
                    temperature: 0.7
                })
            });

            if (!perplexityResponse.ok) {
                console.error('Perplexity API error:', await perplexityResponse.text());
                throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
            }

            const responseData = await perplexityResponse.json();
            console.log('Perplexity API response received');
            
            // Extract content from Perplexity response
            if (!responseData.choices || !responseData.choices[0] || !responseData.choices[0].message) {
                throw new Error('Invalid response format from Perplexity API');
            }
            
            const content = responseData.choices[0].message.content;
            
            // Extract JSON from the response content
            const extractedData = extractJSONFromResponse(content);
            
            // Validate the data structure
            const validatedData = validatePropertyData(extractedData);
            
            // Sanitize the property data
            const sanitizedData = sanitizePropertyData(validatedData);
            
            console.log('Processed property data successfully');
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(sanitizedData)
            };
        } catch (error) {
            console.error('Error processing request:', error);
            
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Failed to process property lookup',
                    message: error.message 
                })
            };
        }
    }
};
