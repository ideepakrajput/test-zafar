const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Middleware
app.use(express.json());

// Mock data for testing
const mockCities = [
    { _id: '1', english: 'New York', spanish: 'Nueva York', hindi: 'न्यूयॉर्क' },
    { _id: '2', english: 'London', spanish: 'Londres', hindi: 'लंदन' },
    { _id: '3', english: 'Paris', spanish: 'París', hindi: 'पेरिस' },
    { _id: '4', english: 'Tokyo', spanish: 'Tokio', hindi: 'टोक्यो' }
];

const mockCountries = [
    { _id: '1', english: 'United States', spanish: 'Estados Unidos', hindi: 'संयुक्त राज्य अमेरिका' },
    { _id: '2', english: 'United Kingdom', spanish: 'Reino Unido', hindi: 'यूनाइटेड किंगडम' },
    { _id: '3', english: 'France', spanish: 'Francia', hindi: 'फ्रांस' },
    { _id: '4', english: 'Japan', spanish: 'Japón', hindi: 'जापान' }
];

const mockAirlines = [
    { _id: '1', airline_name: 'American Airlines', english: 'American Airlines' },
    { _id: '2', airline_name: 'British Airways', english: 'British Airways' },
    { _id: '3', airline_name: 'Air France', english: 'Air France' },
    { _id: '4', airline_name: 'Japan Airlines', english: 'Japan Airlines' }
];

const mockAirports = [
    { _id: '1', english: 'JFK Airport', spanish: 'Aeropuerto JFK', hindi: 'जेएफके हवाई अड्डा' },
    { _id: '2', english: 'Heathrow Airport', spanish: 'Aeropuerto Heathrow', hindi: 'हीथ्रो हवाई अड्डा' },
    { _id: '3', english: 'Charles de Gaulle', spanish: 'Charles de Gaulle', hindi: 'चार्ल्स डी गॉल' },
    { _id: '4', english: 'Narita Airport', spanish: 'Aeropuerto Narita', hindi: 'नारिता हवाई अड्डा' }
];

// Mock collections
const Cities = {
    find: () => ({
        limit: (num) => Promise.resolve(mockCities.slice(0, num))
    })
};

const Countries = {
    find: () => ({
        limit: (num) => Promise.resolve(mockCountries.slice(0, num))
    })
};

const Airlines = {
    find: () => ({
        limit: (num) => Promise.resolve(mockAirlines.slice(0, num))
    })
};

const Airports = {
    find: () => ({
        limit: (num) => Promise.resolve(mockAirports.slice(0, num))
    })
};

const Page_types = {
    findOne: ({ _id }) => Promise.resolve({
        _id: _id,
        title: 'flight from %country% to %country2%',
        languages: [{
            en: 'flight-from-%country%-to-%country2%',
            es: 'vuelo-de-%country%-a-%country2%',
            hn: '%country%-%country2%-flight'
        }]
    })
};

const Webpages = {
    find: ({ slug }) => Promise.resolve([]), // Mock empty result for testing
    insertMany: (records) => {
        console.log(`Inserting ${records.length} records into Webpages collection`);
        return Promise.resolve(records);
    }
};

// Utility functions
function convertToSlug(text) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function splitArray(arr, chunkSize) {
    var result = [];
    for (var i = 0; i < arr.length; i += chunkSize) {
        var chunk = arr.slice(i, i + chunkSize);
        result.push(chunk);
    }
    return result;
}

// Updated replacePlaceholders function to handle all placeholders
function replacePlaceholders(obj, replacements) {
    if (typeof obj === 'string') {
        let result = obj;
        Object.keys(replacements).forEach(placeholder => {
            const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            result = result.replace(regex, replacements[placeholder]);
        });
        return result;
    } else if (Array.isArray(obj)) {
        return obj.map(item => replacePlaceholders(item, replacements));
    } else if (obj !== null && typeof obj === 'object') {
        const result = {};
        Object.keys(obj).forEach(key => {
            result[key] = replacePlaceholders(obj[key], replacements);
        });
        return result;
    }
    return obj;
}

const removeDuplicates = (array, key) => {
    const uniqueKeys = new Set();
    return array.filter((obj) => {
        const keyValue = obj[key];
        if (!uniqueKeys.has(keyValue)) {
            uniqueKeys.add(keyValue);
            return true;
        }
        return false;
    });
};

// Updated create function
app.post('/api/webpages/create', async (req, res) => {
    try {
        console.log('=== API Request Started ===');
        console.log('Request Body:', JSON.stringify(req.body, null, 2));

        const { category, page_type, page_type_id, createdBy, data } = req.body;

        if (!category || !page_type_id) {
            return res.status(400).json({
                message: "category and page_type_id cannot be empty!"
            });
        }

        // Get countries data
        const countries = await Countries.find().limit(4);
        const createdDocuments = [];

        // Language mapping
        const langObj = { en: "english", es: "spanish", hn: "hindi" };

        // Generate combinations for each language
        Object.keys(data).forEach(lang => {
            countries.forEach(country1 => {
                countries.forEach(country2 => {
                    // Skip same country combinations if needed
                    if (country1._id === country2._id) return;

                    // Get country names based on language
                    const country1Name = country1[langObj[lang]] || country1.english;
                    const country2Name = country2[langObj[lang]] || country2.english;

                    // Define replacements for data
                    const dataReplacements = {
                        '%country%': country1Name,
                        '%country2%': country2Name
                    };

                    // Define replacements for slug (always use English for URLs)
                    const slugReplacements = {
                        '%country%': country1.english,
                        '%country2%': country2.english
                    };

                    // Replace placeholders in the data
                    const processedData = replacePlaceholders(data[lang], dataReplacements);

                    // Create title and slug based on language
                    let title, slug;
                    if (lang === 'en') {
                        title = `flight from ${country1.english} to ${country2.english}`;
                        slug = `flight-from-${convertToSlug(country1.english)}-to-${convertToSlug(country2.english)}.html`;
                    } else if (lang === 'es') {
                        title = `vuelo de ${country1.spanish || country1.english} a ${country2.spanish || country2.english}`;
                        slug = `vuelo-de-${convertToSlug(country1.english)}-a-${convertToSlug(country2.english)}.html`;
                    } else if (lang === 'hn') {
                        title = `${country1.hindi || country1.english} ${country2.hindi || country2.english} flight`;
                        slug = `${convertToSlug(country1.english)}-${convertToSlug(country2.english)}-flight.html`;
                    }

                    const document = {
                        category,
                        page_type: page_type_id,
                        title,
                        data: processedData,
                        lang,
                        slug,
                        common_slug: `flight-from-${convertToSlug(country1.english)}-to-${convertToSlug(country2.english)}.html`,
                        common_title: `flight from ${country1.english} to ${country2.english}`,
                        query: {
                            '%country%': country1.english,
                            '%country2%': country2.english
                        },
                        createdBy
                    };

                    createdDocuments.push(document);
                });
            });
        });

        console.log(`Total records to insert: ${createdDocuments.length}`);

        // Remove duplicates based on slug
        const filteredArray = removeDuplicates(createdDocuments, "slug");
        console.log(`After removing duplicates: ${filteredArray.length}`);

        // Split into chunks for insertion
        const chunkedArray = splitArray(filteredArray, 10);
        console.log(`Split into ${chunkedArray.length} chunks`);

        // Insert records in chunks
        for (const insertRecords of chunkedArray) {
            await Webpages.insertMany(insertRecords);
        }

        console.log('=== Sample Generated Records ===');
        filteredArray.slice(0, 3).forEach((record, index) => {
            console.log(`Record ${index + 1}:`, JSON.stringify(record, null, 2));
        });

        res.status(200).json({
            success: "new documents added!",
            data: filteredArray,
            totalRecords: filteredArray.length
        });

    } catch (error) {
        console.error('Error creating webpages:', error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message
        });
    }
});

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
