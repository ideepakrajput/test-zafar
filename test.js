const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

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

async function saveResponseToFile(data, filename) {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `${filename}_${timestamp}.json`;
        const filePath = path.join(__dirname, fileName);

        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ Response saved to: ${fileName}`);
        return fileName;
    } catch (error) {
        console.error('❌ Error saving file:', error.message);
    }
}

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

        // Save successful response to file
        const responseData = {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data,
            timestamp: new Date().toISOString(),
            testType: 'success'
        };

        await saveResponseToFile(responseData, 'api_response_success');

    } catch (error) {
        let errorData = {
            timestamp: new Date().toISOString(),
            testType: 'error'
        };

        if (error.response) {
            console.error('API Error Response:', error.response.status, error.response.data);
            errorData = {
                ...errorData,
                status: error.response.status,
                statusText: error.response.statusText,
                headers: error.response.headers,
                data: error.response.data,
                errorType: 'api_error'
            };
        } else if (error.request) {
            console.error('No response received:', error.message);
            errorData = {
                ...errorData,
                message: error.message,
                errorType: 'no_response'
            };
        } else {
            console.error('Request setup error:', error.message);
            errorData = {
                ...errorData,
                message: error.message,
                errorType: 'request_setup'
            };
        }

        // Save error response to file
        await saveResponseToFile(errorData, 'api_response_error');
    }
}

// Wait for server to start, then test
setTimeout(testAPI, 2000);