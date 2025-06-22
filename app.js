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
        title: 'flight from %city% to %city2%',
        languages: [{
            en: 'flight-from-%city%-to-%city2%',
            es: 'vuelo-de-%city%-a-%city2%',
            hn: '%city%-%city2%-flight'
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

async function forloop(
    collection_name,
    matches,
    title,
    body,
    lang = "en",
    slug,
    newdata = {},
    eng_slug,
    comm_slug,
    query
) {
    let arrayToInsert = [];
    let langObj = { en: "english", es: "spanish", hn: "hindi" };

    let data = await collection_name.find().limit(4);
    data = data.filter((entry) => !title.includes(entry[langObj[lang]]));

    let sr = 0;
    for (const myvar of data) {
        let query2 = { ...query };
        let eng_name;

        if (matches == "%airline%") {
            eng_name = myvar.airline_name;
        } else {
            eng_name = myvar[langObj[lang]];
        }

        const originalString = title;
        const searchVariable = matches;
        const replacementValue = eng_name;

        const modifiedString = originalString.replace(
            new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
            replacementValue
        );

        let url = convertToSlug(
            slug.replace(
                new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
                replacementValue
            )
        ) + ".html";

        var exists = await Webpages.find({ slug: url });

        if (exists.length == 0) {
            let eng_name2;
            if (matches == "%airline%") {
                eng_name2 = myvar.airline_name;
            } else {
                eng_name2 = myvar["english"];
            }

            const originalString2 = title;
            const originalSlug2 = comm_slug;
            const searchVariable2 = matches;
            const replacementValue2 = eng_name2;
            query2[searchVariable2] = myvar["english"];

            const modifiedString2 = originalString2.replace(
                new RegExp(searchVariable2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
                replacementValue2
            );

            const modifiedSlug2 = originalSlug2.replace(
                new RegExp(searchVariable2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
                replacementValue2
            );

            let url2 = convertToSlug(
                eng_slug.replace(
                    new RegExp(searchVariable2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
                    replacementValue2
                )
            ) + ".html";

            let final_common_slug = convertToSlug(modifiedSlug2) + ".html";
            let ndata = convertToData(
                newdata,
                searchVariable,
                replacementValue,
                replacementValue2
            );

            var singleRow = {
                category: body.category,
                page_type: body.page_type_id,
                title: modifiedString2,
                data: ndata,
                lang: lang,
                slug: url2,
                common_slug: final_common_slug,
                common_title: modifiedSlug2,
                query: query2,
                createdBy: body.createdBy,
            };

            arrayToInsert.push(singleRow);
        }
        sr++;
    }
    return arrayToInsert;
}

function isAnyStringExistInArrayNode(stringArray, nodeObject) {
    let narr = [];
    for (const property in nodeObject) {
        if (typeof nodeObject[property] === "string") {
            for (const searchString of stringArray) {
                if (nodeObject[property].includes(searchString)) {
                    narr.push(searchString);
                }
            }
        }
    }

    if (narr.length > 0) {
        return narr.filter(function (item, pos) {
            return narr.indexOf(item) == pos;
        });
    } else return [];
}

function convertToData(nodeObject, searchVariable, replacementValue, replacementValue2) {
    let nobj = {};

    for (const property in nodeObject) {
        if (typeof nodeObject[property] === "string") {
            let oldval = nodeObject[property];

            const regex = /{{#(.*?)#}}/g;
            const matches = nodeObject[property].match(regex);

            if (matches) {
                matches.forEach((match) => {
                    let nvar = match.replace(
                        new RegExp(
                            searchVariable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                            "g"
                        ),
                        replacementValue2
                    );
                    oldval = oldval.replace(
                        new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
                        nvar
                    );
                });
            }

            nobj[property] = oldval.replace(
                new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
                replacementValue
            );
        } else if (typeof nodeObject[property] === "object" && nodeObject[property] !== null) {
            if (Array.isArray(nodeObject[property])) {
                nobj[property] = nodeObject[property].map(item =>
                    typeof item === 'object' ? convertToData(item, searchVariable, replacementValue, replacementValue2) : item
                );
            } else {
                nobj[property] = convertToData(
                    nodeObject[property],
                    searchVariable,
                    replacementValue,
                    replacementValue2
                );
            }
        } else {
            nobj[property] = nodeObject[property];
        }
    }

    return nobj;
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

// Add this function to replace placeholders with actual values
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

// Main create function
const create = async (req, res) => {
    try {
        console.log('=== API Request Started ===');
        console.log('Request Body:', JSON.stringify(req.body, null, 2));

        if (!req.body.page_type || !req.body.category) {
            return res.status(400).send({
                message: "category and page_type can not be empty!"
            });
        }

        let categories = [
            "%city%",
            "%city2%",
            "%country%",
            "%country2%",
            "%airline%",
            "%airline2%",
            "%airport%",
            "%airport2%",
        ];

        let pageslugs = await Page_types.findOne({ _id: req.body.page_type_id });
        console.log('Page slugs:', pageslugs);

        let slugs = {};

        if (
            pageslugs.languages &&
            req.body.data &&
            pageslugs.languages.length > 0 &&
            Object.keys(pageslugs.languages[0]).length > 0 &&
            Object.keys(req.body.data).length > 0
        ) {
            for (let key of Object.keys(req.body.data)) {
                if (req.body.data[key].slug) {
                    slugs[key] = req.body.data[key].slug;
                } else if (pageslugs.languages[0][key]) {
                    slugs[key] = pageslugs.languages[0][key];
                } else {
                    slugs[key] = req.body.page_type;
                }
            }
        } else if (req.body.data && Object.keys(req.body.data).length > 0) {
            for (let key of Object.keys(req.body.data)) {
                if (req.body.data[key].slug) {
                    slugs[key] = req.body.data[key].slug;
                } else {
                    slugs[key] = pageslugs.languages[key];
                }
            }
        } else {
            slugs["en"] = req.body.page_type;
        }

        console.log('Generated slugs:', slugs);

        const slugObj = {};
        for (let key of Object.keys(slugs)) {
            let narr = [];
            if (typeof slugs[key] === "string") {
                for (const searchString of categories) {
                    if (slugs[key].includes(searchString)) {
                        narr.push(searchString);
                    }
                }
            }
            slugObj[key] = narr;
        }

        console.log('Slug object with categories:', slugObj);

        let body_arr = {};
        for (let key of Object.keys(req.body.data)) {
            const result = isAnyStringExistInArrayNode(categories, req.body.data[key]);
            let arra = [];
            if (slugObj[key] && slugObj[key].length > 0 && result.length > 0) {
                arra = result.filter((x) => !slugObj[key].includes(x));
            }
            body_arr[key] = arra;
        }

        console.log('Body array:', body_arr);

        let catobj = {
            "%city%": Cities,
            "%city2%": Cities,
            "%country%": Countries,
            "%country2%": Countries,
            "%airline%": Airlines,
            "%airline2%": Airlines,
            "%airport%": Airports,
            "%airport2%": Airports,
        };

        let langObj = { en: "english", es: "spanish", hn: "hindi" };
        let matches = slugObj;

        if (Object.keys(matches).length > 0) {
            var arrayToInsert = [];

            for (let key of Object.keys(matches)) {
                if (matches[key].length === 0) continue;

                let collection_name = catobj[matches[key][0]];
                let eng_name = "";
                let eng_slug = "english";

                if (collection_name) {
                    let data = await collection_name.find().limit(4);
                    console.log(`Processing ${key} language with ${data.length} records`);

                    for (const myvar of data) {
                        let query = {};

                        if (matches[key][0] == "%airline%") {
                            eng_name = myvar.airline_name;
                            eng_slug = myvar.airline_name;
                        } else {
                            if (key === 'hn') {
                                eng_name = myvar["english"]; // use English for Hindi slug/meta
                                eng_slug = myvar["english"];
                            } else {
                                eng_name = myvar[langObj[key]];
                                eng_slug = myvar["english"];
                            }
                        }

                        let common_page_type = pageslugs.languages[0][key];

                        const originalString = common_page_type;
                        const searchVariable = matches[key][0];
                        const replacementValue = eng_name;
                        const originalCommonSlug = pageslugs.title;

                        const modifiedString = originalString.replace(
                            new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
                            replacementValue
                        );

                        const modifiedCommonSlug = originalCommonSlug.replace(
                            new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
                            eng_slug
                        );

                        let data2 = await collection_name.find().limit(4);
                        data2 = data2.filter(
                            (item) => item[langObj[key]] !== replacementValue
                        );

                        if (matches[key][0] == "%airline%") {
                            eng_name = myvar.airline_name;
                            eng_slug = myvar.airline_name;
                        } else {
                            if (key === 'hn') {
                                eng_name = myvar["english"];
                                eng_slug = myvar["english"];
                            } else {
                                eng_name = myvar[langObj[key]];
                                eng_slug = myvar["english"];
                            }
                        }

                        const originalString2 = modifiedString;
                        const originalCommonSlug2 = modifiedCommonSlug;
                        const searchVariable2 = matches[key][0];
                        const replacementValue2 = eng_name;
                        const replacementSlug2 = eng_slug;

                        query[searchVariable2] = myvar["english"];

                        const modifiedString2 = originalString2.replace(
                            new RegExp(searchVariable2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
                            replacementValue2
                        );

                        const modifiedCommonSlug2 = originalCommonSlug2.replace(
                            new RegExp(searchVariable2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
                            replacementSlug2
                        );

                        let ndata = convertToData(
                            req.body.data[key],
                            searchVariable,
                            replacementValue,
                            replacementValue2
                        );

                        if (matches[key].length > 1) {
                            let modifiedSlug;
                            if (slugs[key]) {
                                const oslug = modifiedString;
                                modifiedSlug = oslug.replace(
                                    new RegExp(
                                        searchVariable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"
                                    ),
                                    replacementValue
                                );
                            }
                            let url2 = modifiedSlug != "" ? modifiedSlug : modifiedString;

                            let modifiedSlug2;
                            if (slugs[key]) {
                                const oslug2 = modifiedString2;
                                modifiedSlug2 = oslug2.replace(
                                    new RegExp(
                                        searchVariable2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"
                                    ),
                                    replacementValue2
                                );
                            }
                            let common_slug = modifiedSlug2 != "" ? modifiedSlug2 : modifiedString2;

                            let arr2 = await forloop(
                                catobj[matches[key][1]],
                                matches[key][1],
                                modifiedString2,
                                req.body,
                                key,
                                url2,
                                ndata,
                                common_slug,
                                modifiedCommonSlug2,
                                query
                            );

                            if (matches[key].length == 3 && arr2.length > 0) {
                                for (const arr2val of arr2) {
                                    let arr3 = await forloop(
                                        catobj[matches[key][2]],
                                        matches[key][2],
                                        arr2val.title,
                                        req.body,
                                        key,
                                        arr2val.slug,
                                        arr2val.data,
                                        arr2val.title,
                                        arr2val.common_title,
                                        query
                                    );
                                    arrayToInsert = arrayToInsert.concat(arr3);
                                }
                            } else {
                                arrayToInsert = arrayToInsert.concat(arr2);
                            }
                        } else {
                            let url = convertToSlug(modifiedCommonSlug2) + ".html";
                            let final_common_slug = convertToSlug(modifiedCommonSlug2) + ".html";

                            var exists = await Webpages.find({ slug: url });

                            if (exists.length == 0) {
                                var singleRow = {
                                    category: req.body.category,
                                    page_type: req.body.page_type_id,
                                    title: modifiedString2,
                                    data: ndata,
                                    slug: url,
                                    lang: key,
                                    common_slug: final_common_slug,
                                    query: query,
                                    createdBy: req.body.createdBy,
                                };

                                arrayToInsert.push(singleRow);
                            }
                        }
                    }
                }
            }

            console.log(`Total records to insert: ${arrayToInsert.length}`);

            const filteredArray = removeDuplicates(arrayToInsert, "title");
            console.log(`After removing duplicates: ${filteredArray.length}`);

            var chunkedArray = splitArray(filteredArray, 10);
            console.log(`Split into ${chunkedArray.length} chunks`);

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
        } else {
            res.status(400).json({
                message: "No matching categories found in slugs"
            });
        }

    } catch (error) {
        console.error('Error in create function:', error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message
        });
    }
};

// API endpoint
// app.post('/api/webpages/create', create);

app.post('/api/webpages/create', async (req, res) => {
    try {
        const { category, page_type, page_type_id, createdBy, data } = req.body;

        // Define your city combinations
        const cities = ['New York', 'London', 'Paris', 'Tokyo'];
        const createdDocuments = [];

        // Generate combinations for each language
        Object.keys(data).forEach(lang => {
            cities.forEach(city1 => {
                cities.forEach(city2 => {
                    // Skip same city combinations if needed
                    // if (city1 === city2) return;

                    // Define replacements
                    const replacements = {
                        '%country%': city1,
                        '%country2%': city2,
                        '%city%': city1,
                        '%city2%': city2
                    };

                    // Replace placeholders in the data
                    const processedData = replacePlaceholders(data[lang], replacements);

                    // Create title and slug based on language
                    let title, slug;
                    if (lang === 'en') {
                        title = `flight-from-${city1}-to-${city2}`;
                        slug = `flight-from-${city1.toLowerCase().replace(/\s+/g, '-')}-to-${city2.toLowerCase().replace(/\s+/g, '-')}.html`;
                    } else if (lang === 'es') {
                        title = `vuelo-de-${city1}-a-${city2}`;
                        slug = `vuelo-de-${city1.toLowerCase().replace(/\s+/g, '-')}-a-${city2.toLowerCase().replace(/\s+/g, '-')}.html`;
                    } else if (lang === 'hn') {
                        title = `${city1}-${city2}-flight`;
                        slug = `${city1.toLowerCase().replace(/\s+/g, '-')}-${city2.toLowerCase().replace(/\s+/g, '-')}-flight.html`;
                    }

                    const document = {
                        category,
                        page_type: page_type_id,
                        title,
                        data: processedData,
                        lang,
                        slug,
                        common_slug: `flight-from-${city1.toLowerCase().replace(/\s+/g, '-')}-to-${city2.toLowerCase().replace(/\s+/g, '-')}.html`,
                        common_title: `flight from ${city1} to ${city2}`,
                        query: {
                            '%city%': city1,
                            '%city2%': city2
                        },
                        createdBy
                    };

                    createdDocuments.push(document);
                });
            });
        });

        // Save documents to database (assuming you're using MongoDB)
        // const result = await YourModel.insertMany(createdDocuments);

        res.status(200).json({
            success: "new documents added!",
            data: createdDocuments,
            totalRecords: createdDocuments.length
        });

    } catch (error) {
        console.error('Error creating webpages:', error);
        res.status(500).json({ error: 'Internal server error' });
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
