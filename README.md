# Webpage Generator API

This is a Node.js API that generates dynamic webpages based on templates and data collections. It's designed for creating flight booking pages with multiple language support.

## What This Code Does

### Core Functionality

The API takes a template payload and generates multiple webpage variations by:

1. **Template Processing**: Takes templates with placeholders like `%country%`, `%city%`, `%airline%`
2. **Dynamic Content Generation**: Replaces placeholders with real data from mock collections
3. **Multi-language Support**: Generates content in English, Spanish, and Hindi
4. **SEO Optimization**: Creates SEO-friendly URLs and slugs
5. **Batch Processing**: Handles large datasets efficiently

### Key Components

#### 1. Mock Data Collections

-   **Cities**: New York, London, Paris, Tokyo (with translations)
-   **Countries**: USA, UK, France, Japan (with translations)
-   **Airlines**: American Airlines, British Airways, etc.
-   **Airports**: JFK, Heathrow, Charles de Gaulle, etc.

#### 2. Template Processing Functions

-   `convertToSlug()`: Creates URL-friendly slugs
-   `convertToData()`: Processes nested data structures and replaces placeholders
-   `forloop()`: Generates combinations for multiple placeholder types
-   `isAnyStringExistInArrayNode()`: Finds placeholders in data structures

#### 3. Main API Flow

1. Validates input payload
2. Identifies placeholders in templates
3. Maps placeholders to data collections
4. Generates all possible combinations
5. Creates webpage records with processed content
6. Removes duplicates and saves to database

### Example Transformation

**Input Template:**

```
"heading": "flight from %country% to %country2%"
```

**Generated Output:**

-   "flight from United States to United Kingdom"
-   "flight from France to Japan"
-   "vuelo de Estados Unidos a Reino Unido" (Spanish)
-   "संयुक्त राज्य अमेरिका से यूनाइटेड किंगडम तक उड़ान" (Hindi)

### Usage

1. **Install Dependencies:**

    ```bash
    npm install
    ```

2. **Run Server:**

    ```bash
    npm start
    ```

3. **Run Test:**

    ```bash
    npm test
    ```

4. **Run Complete Test:**
    ```bash
    node run-test.js
    ```

### API Endpoint

-   **POST** `/api/webpages/create`
-   **Content-Type**: `application/json`
-   **Description**: Creates multiple webpage variations from a template

#### Request Body Structure:

```json
{
  "category": "countries",
  "page_type": "flight from %city% to %city2%",
  "page_type_id": "6834941abfae2612e862942d",
  "createdBy": "66c7283d85272162e6e246b8",
  "data": {
    "en": {
      "flights": [...],
      "meta_title": "Flight to %country%",
      "meta_description": "Flight to %country%"
    },
    "es": {
      "flights": [...],
      "meta_title": "Vuelo a %country%"
    },
    "hn": {
      "flights": [...],
      "meta_title": "%country% के लिए उड़ान"
    }
  }
}
```

#### Response Structure:

```json
{
  "success": "new documents added!",
  "totalRecords": 48,
  "data": [
    {
      "category": "countries",
      "page_type": "6834941abfae2612e862942d",
      "title": "flight from United States to United Kingdom",
      "data": {
        "flights": [...],
        "meta_title": "Flight to United States",
        "meta_description": "Flight to United States"
      },
      "lang": "en",
      "slug": "flight-from-united-states-to-united-kingdom.html",
      "common_slug": "flight-from-united-states-to-united-kingdom.html",
      "query": {
        "%country%": "United States"
      },
      "createdBy": "66c7283d85272162e6e246b8"
    }
  ]
}
```

### Supported Placeholders

-   `%city%` / `%city2%` - City names
-   `%country%` / `%country2%` - Country names
-   `%airline%` / `%airline2%` - Airline names
-   `%airport%` / `%airport2%` - Airport names

### Language Support

-   **en**: English
-   **es**: Spanish (Español)
-   **hn**: Hindi (हिंदी)

### Features

-   ✅ Multi-language content generation
-   ✅ SEO-friendly URL generation
-   ✅ Duplicate content prevention
-   ✅ Batch processing for large datasets
-   ✅ Nested object placeholder replacement
-   ✅ Query parameter generation for filtering
-   ✅ Error handling and validation

### File Structure

```
webpage-generator-project/
├── app.js              # Main server application
├── test.js             # API test script
├── run-test.js         # Combined server + test runner
├── package.json        # Dependencies and scripts
└── README.md          # This documentation
```

### Error Handling

The API includes comprehensive error handling for:

-   Missing required fields
-   Invalid payload structure
-   Database connection issues
-   Template processing errors
-   Duplicate detection

### Performance Considerations

-   Processes data in chunks of 10 records
-   Filters out existing pages to prevent duplicates
-   Uses efficient regex patterns for placeholder replacement
-   Implements proper memory management for large datasets

````

Now let me create a detailed explanation document:

```markdown:EXPLANATION.md
# Detailed Code Explanation

## Overview
This application is a **Dynamic Webpage Generator** that creates multiple webpage variations from templates. It's specifically designed for travel/flight booking websites that need to generate thousands of similar pages with different destinations, airlines, etc.

## Core Problem It Solves
Instead of manually creating hundreds of pages like:
- "Flight from New York to London"
- "Flight from Paris to Tokyo"
- "Vuelo de Nueva York a Londres" (Spanish)

The system automatically generates all combinations from templates with placeholders.

## Step-by-Step Process Flow

### 1. Input Processing
```javascript
// Input payload contains templates with placeholders
{
  "data": {
    "en": {
      "meta_title": "Flight to %country%",
      "heading": "flight from %country% to %country2%"
    }
  }
}
````

### 2. Placeholder Detection

```javascript
let categories = ["%city%", "%country%", "%airline%", "%airport%"];
// System scans templates to find which placeholders are used
```

### 3. Data Collection Mapping

```javascript
let catobj = {
    "%country%": Countries, // Maps to countries database
    "%city%": Cities, // Maps to cities database
    "%airline%": Airlines, // Maps to airlines database
};
```

### 4. Content Generation Loop

For each language → For each data record → Generate webpage:

```javascript
// Example transformation:
"Flight to %country%" + "United States" = "Flight to United States"
"vuelo a %country%" + "Estados Unidos" = "vuelo a Estados Unidos"
```

### 5. SEO Slug Creation

```javascript
convertToSlug("Flight from United States to United Kingdom");
// Result: "flight-from-united-states-to-united-kingdom"
```

### 6. Duplicate Prevention

```javascript
// Checks if page already exists before creating
var exists = await Webpages.find({slug: url});
if (exists.length == 0) {
    // Create new page
}
```

## Key Functions Explained

### `convertToSlug(text)`

**Purpose**: Creates SEO-friendly URLs

```javascript
"Flight to New York" → "flight-to-new-york"
```

### `convertToData(nodeObject, searchVariable, replacementValue)`

**Purpose**: Recursively processes nested objects to replace placeholders

```javascript
// Input:
{
  "title": "Flight to %country%",
  "flights": [{"heading": "Book %country% flights"}]
}

// Output:
{
  "title": "Flight to United States",
  "flights": [{"heading": "Book United States flights"}]
}
```

### `forloop()`

**Purpose**: Handles complex multi-placeholder scenarios

-   When template has both `%country%` AND `%city%`
-   Generates all possible combinations
-   Example: "Flight from %city% in %country%" creates pages for every city-country combination

### `isAnyStringExistInArrayNode()`

**Purpose**: Scans data structures to find placeholders

-   Looks through all object properties
-   Identifies which placeholders are actually used
-   Returns array of found placeholders

## Language Processing Logic

### English (en)

-   Uses English names from database
-   Creates English slugs
-   English meta tags

### Spanish (es)

-   Uses Spanish translations
-   Creates Spanish content
-   English-based slugs for consistency

### Hindi (hn)

-   Uses Hindi translations for display
-   English slugs for technical compatibility
-   Hindi meta content

## Database Structure (Mocked)

### Countries Collection

```javascript
{
  _id: "1",
  english: "United States",
  spanish: "Estados Unidos",
  hindi: "संयुक्त राज्य अमेरिका"
}
```

### Generated Webpage Record

```javascript
{
  category: "countries",
  page_type: "flight_template_id",
  title: "Flight from United States to United Kingdom",
  data: {/* processed template data */},
  lang: "en",
  slug: "flight-from-united-states-to-united-kingdom.html",
  query: {"%country%": "United States"},
  createdBy: "user_id"
}
```

## Performance Optimizations

1. **Chunked Processing**: Splits large datasets into batches of 10
2. **Duplicate Prevention**: Checks existing pages before creation
3. **Memory Management**: Processes one language at a time
4. **Efficient Regex**: Uses optimized patterns for placeholder replacement

## Real-World Use Cases

### Travel Websites

-   Generate destination pages for every city/country combination
-   Create airline-specific booking pages
-   Multi-language travel content

### E-commerce

-   Product category pages
-   Location-based store pages
-   Multi-language product descriptions

### Real Estate

-   Property listing pages by location
-   Agent profile pages
-   Market analysis pages by area

## Error Scenarios Handled

1. **Missing Required Fields**: Returns 400 error
2. **Invalid Templates**: Graceful fallback to defaults
3. **Database Errors**: Proper error logging and response
4. **Memory Issues**: Chunked processing prevents overload
5. **Duplicate Content**: Automatic detection and prevention

## Scalability Considerations

-   **Horizontal Scaling**: Can process different languages in parallel
-   **Database Optimization**: Uses indexed queries for duplicate checking
-   **Memory Efficiency**: Processes data in small chunks
-   **Caching**: Generated slugs and processed templates can be cached

This system essentially automates the creation of thousands of similar but unique webpages, which is crucial for SEO and user experience in content-heavy websites.

````

Now let me run the test to show you the actual output:

```bash
node run-test.js
````
