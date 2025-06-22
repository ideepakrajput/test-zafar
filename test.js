const axios = require('axios');

const testPayload = {
    "category": "countries",
    "page_type": "flight from %city% to %city2%",
    "page_type_id": "6834941abfae2612e862942d",
    "createdBy": "66c7283d85272162e6e246b8",
    "data": {
        "en": {
            "flights": [
                {
                    "heading": "flight from %country% to %country2%",
                    "slogan": "",
                    "queryType": "cheapest",
                    "componentType": "flight",
                    "slug": "flight-from-%country%-to-%country2%"
                }
            ],
            "faqs": [],
            "subheading": "Flight to %country%",
            "meta_title": "Flight to %country%",
            "meta_description": "Flight to %country%"
        },
        "es": {
            "flights": [
                {
                    "heading": "vuelo de %country% a %country2%",
                    "slogan": "",
                    "queryType": "latest",
                    "componentType": "flight",
                    "slug": "vuelo-de-%country%-a-%country2%"
                }
            ],
            "faqs": [],
            "subheading": "Vuelo a %country%",
            "meta_title": "Vuelo a %country%",
            "meta_description": "Vuelo a %country%"
        },
        "hn": {
            "flights": [
                {
                    "heading": "%country% से %country2% तक उड़ान",
                    "slogan": "",
                    "queryType": "latest",
                    "componentType": "flight",
                    "slug": "%country%--%country2%--"
                }
            ],
            "faqs": [],
            "subheading": "%country% के लिए उड़ान",
            "meta_title": "%country% के लिए उड़ान",
            "meta_description": "%country% के लिए उड़ान"
        }
    }
};

async function testAPI() {
    try {
        console.log('=== Starting API Test ===');
        console.log('Sending request to: http://localhost:3000/api/webpages/create');

        const response = await axios.post('http://localhost:3000/api/webpages/create', testPayload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('=== API Response ===');
        console.log('Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        if (error.response) {
            console.error('API Error Response:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.message);
        } else {
            console.error('Request setup error:', error.message);
        }
    }
}

// Wait for server to start, then test
setTimeout(testAPI, 2000);