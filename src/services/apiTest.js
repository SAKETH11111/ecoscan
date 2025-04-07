/**
 * Test file for verifying Google Places API integration
 * To test:
 * 1. Make sure your .env file has GOOGLE_PLACES_API_KEY defined
 * 2. Run: node src/services/apiTest.js
 */

const Constants = require('expo-constants');
require('dotenv').config();

// Test API key access
const googlePlacesApiKey = process.env.GOOGLE_PLACES_API_KEY;
console.log('Google Places API Key available:', !!googlePlacesApiKey);

// Test Places API with a simple search (not a full implementation)
async function testPlacesApi() {
  try {
    // Sample coordinates (San Francisco)
    const latitude = 37.7749;
    const longitude = -122.4194;
    
    // Simple query
    const searchTerm = 'recycling center';
    
    // Construct URL
    const endpoint = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
      `location=${latitude},${longitude}` +
      `&radius=10000` +
      `&type=establishment` +
      `&keyword=${encodeURIComponent(searchTerm)}` +
      `&key=${googlePlacesApiKey}`;
    
    // Make request
    const response = await fetch(endpoint);
    const data = await response.json();
    
    // Check response
    if (data.status === 'OK') {
      console.log('Successfully connected to Places API!');
      console.log(`Found ${data.results.length} results`);
      
      // Show first result
      if (data.results.length > 0) {
        const firstPlace = data.results[0];
        console.log('\nFirst result:');
        console.log('Name:', firstPlace.name);
        console.log('Address:', firstPlace.vicinity);
        console.log('Place ID:', firstPlace.place_id);
      }
    } else {
      console.error('API Error:', data.status);
      console.error('Error Message:', data.error_message);
    }
  } catch (error) {
    console.error('Error testing Places API:', error.message);
  }
}

// Run the test
testPlacesApi(); 