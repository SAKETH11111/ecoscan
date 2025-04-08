/**
 * Gemini API client for the EcoScan application.
 * This module provides functions to interact with the Python backend,
 * which interfaces with Google's Gemini API for image analysis.
 */

import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Base URL for the API
 * - Use localhost for simulator testing
 * - For physical device testing, replace with your computer's IP address
 *   Example: 'http://192.168.1.10:8000'
 */
const API_BASE_URL = 'http://192.168.142.85:8000'; // Updated for physical device testing

/**
 * @typedef {Object} Impact
 * @property {string} co2Saved - Amount of CO2 saved by recycling this item
 * @property {string} waterSaved - Amount of water saved by recycling this item
 */

/**
 * @typedef {Object} AlternativeOption
 * @property {string} option - Alternative option for non-recyclable items
 */

/**
 * @typedef {Object} RecyclingTip
 * @property {string} tip - Recycling tip for the scanned item
 */

/**
 * @typedef {Object} ScanResult
 * @property {string} itemName - The name of the scanned item
 * @property {boolean} recyclable - Whether the item is recyclable
 * @property {string} category - The material category (e.g., Plastic, Glass, Paper, Metal)
 * @property {string} recyclingCode - The recycling code if applicable (e.g., #1 PET, #2 HDPE)
 * @property {string} instructions - Instructions for how to properly recycle or dispose of the item
 * @property {Impact} impact - Environmental impact from recycling this item
 * @property {AlternativeOption[]} [alternativeOptions] - Alternative options for non-recyclable items
 * @property {RecyclingTip[]} [recyclingTips] - Recycling tips for the item
 * @property {string} [scannedImageUrl] - URL of the scanned image
 * @property {boolean} [isMockData] - Whether this is mock data (for development)
 * @property {string} [errorDetails] - Details of any error that occurred
 */

/**
 * Analyzes an image using the Gemini API to determine recyclability.
 * 
 * @param {string} imageUri - The URI of the image to analyze
 * @returns {Promise<ScanResult>} - A promise that resolves to the analysis result
 */
export const analyzeImage = async (imageUri) => {
  try {
    // Log that we're processing the image
    console.log('Processing image with URI:', imageUri);
    
    // Default to mock data if API check fails
    let useMockData = false;
    
    // Try to check if the API server is available
    try {
      const isServerAvailable = await checkApiHealth();
      useMockData = !isServerAvailable;
      console.log(`API server is ${isServerAvailable ? 'available' : 'not available'}`);
    } catch (error) {
      console.log('Error checking API health, falling back to mock data');
      useMockData = true;
    }
    
    // Enhanced mock data with proper additional fields
    if (useMockData) {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Using mock data for image analysis:", imageUri);
      
      // Enhanced mock items with more detailed data
      const mockItems = [
        {
          itemName: "Plastic Bottle",
          recyclable: true,
          category: "Plastic",
          recyclingCode: "#1 PET",
          instructions: "Rinse the bottle and remove the cap before recycling. Make sure to remove any labels if possible. PET plastic is one of the most commonly recycled plastics worldwide.",
          impact: {
            co2Saved: "0.12 kg",
            waterSaved: "2.5L"
          },
          alternativeOptions: [
            { option: "Reuse the bottle for storing homemade beverages" },
            { option: "Use for DIY crafts or gardening projects" },
            { option: "Look for brands with recyclable packaging" }
          ],
          recyclingTips: [
            { tip: "Compress bottles to save space in recycling bins" },
            { tip: "Remove caps and sort separately if your program requires it" },
            { tip: "Check if your local program accepts colored PET or only clear" }
          ]
        },
        {
          itemName: "Glass Bottle",
          recyclable: true,
          category: "Glass",
          recyclingCode: "GL",
          instructions: "Rinse thoroughly. Remove metal caps and plastic labels if required by your local recycling program. Glass can be recycled indefinitely without loss of quality.",
          impact: {
            co2Saved: "0.3 kg",
            waterSaved: "5L"
          },
          alternativeOptions: [
            { option: "Reuse for food storage or as a vase" },
            { option: "Use in DIY home decor projects" },
            { option: "Donate intact bottles to community art programs" }
          ],
          recyclingTips: [
            { tip: "Sort by color if your recycling program requires it" },
            { tip: "Keep glass separate from other recyclables to prevent breakage" },
            { tip: "Remove any non-glass attachments before recycling" }
          ]
        },
        {
          itemName: "Styrofoam Container",
          recyclable: false,
          category: "Plastic",
          recyclingCode: "#6 PS",
          instructions: "Most curbside programs do not accept styrofoam. Check for special recycling facilities in your area that accept expanded polystyrene (EPS) foam.",
          impact: {
            co2Saved: "0 kg",
            waterSaved: "0L"
          },
          alternativeOptions: [
            { option: "Check for specialty styrofoam recycling drop-off locations" },
            { option: "Reuse for storage or shipping padding if in good condition" },
            { option: "Choose alternative packaging materials in the future" }
          ],
          recyclingTips: [
            { tip: "Look for the #6 PS symbol on foam products" },
            { tip: "Consider alternatives like paper or compostable containers" },
            { tip: "Some shipping stores accept clean styrofoam peanuts for reuse" }
          ]
        },
        {
          itemName: "Aluminum Can",
          recyclable: true,
          category: "Metal",
          recyclingCode: "ALU",
          instructions: "Rinse and place in recycling bin. Aluminum cans are highly recyclable and can be back on the shelf as new cans in as little as 60 days.",
          impact: {
            co2Saved: "0.5 kg",
            waterSaved: "4L"
          },
          alternativeOptions: [
            { option: "Crush cans to save space in recycling bins" },
            { option: "Use in DIY crafts or garden projects" },
            { option: "Collect for scrap metal recycling programs" }
          ],
          recyclingTips: [
            { tip: "Rinse food and beverage cans thoroughly" },
            { tip: "Remove paper labels when possible" },
            { tip: "Check if your program accepts aluminum foil and trays too" }
          ]
        }
      ];
      
      // For demo purposes, use a deterministic choice based on URI length
      // to simulate different results for different images
      const index = imageUri.length % mockItems.length;
      const mockResult = { ...mockItems[index] };
      mockResult.scannedImageUrl = imageUri;
      mockResult.isMockData = true;
      
      // Log what the real API would receive and what we're returning
      console.log(`[MOCK] Analyzing image: ${imageUri}`);
      console.log(`[MOCK] Returning: ${mockResult.itemName} (${mockResult.recyclable ? 'Recyclable' : 'Not Recyclable'})`);
      console.log(`Scan result with image: ${mockResult.scannedImageUrl}`);
      
      return mockResult;
    }
    
    // Real API implementation when server is available
    try {
      console.log("Sending image to API server for analysis");
      
      // Create form data for the image
      const formData = new FormData();
      
      // Determine file name and type from URI
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1] || 'jpg';
      
      // Create file object
      const fileName = `image.${fileType}`;
      
      // Prepare the image for upload
      formData.append('file', {
        uri: imageUri,
        name: fileName,
        type: `image/${fileType}`
      });
      
      // Make API request
      const response = await axios.post(`${API_BASE_URL}/api/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 second timeout for image processing
      });
      
      console.log("API analysis complete, processing response");
      
      // Add the missing fields if they don't exist in the API response
      const result = response.data;
      
      if (!result.alternativeOptions) {
        result.alternativeOptions = [
          { option: "Check local special waste disposal options" },
          { option: "Look for brands with recyclable alternatives" },
          { option: "Consider reusing the item if possible" }
        ];
      }
      
      if (!result.recyclingTips) {
        result.recyclingTips = [
          { tip: "Always rinse containers before recycling" },
          { tip: "Check the recycling number on plastic items" },
          { tip: "Remove caps and labels when required by local guidelines" }
        ];
      }
      
      console.log(`Scan result with image: ${result.scannedImageUrl}`);
      
      // Return the result with image path
      return result;
    } catch (error) {
      console.error("API request failed:", error.message || "Unknown error");
      throw error; // Re-throw to be caught by the outer try-catch
    }
    
  } catch (error) {
    console.error('Error analyzing image:', error);
    
    // Enhanced error logging
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }
    
    // Return an error result
    return {
      itemName: 'Analysis Failed',
      recyclable: false,
      category: 'Unknown',
      recyclingCode: '',
      instructions: 'Failed to analyze the image. Please check your network connection and try again.',
      impact: {
        co2Saved: '0 kg',
        waterSaved: '0L'
      },
      alternativeOptions: [
        { option: "Try scanning a different item" },
        { option: "Make sure the item is clearly visible in the image" },
        { option: "Check your internet connection" }
      ],
      recyclingTips: [
        { tip: "Always rinse containers before recycling" },
        { tip: "Check the recycling number on plastic items" },
        { tip: "Remove caps and labels when required by local guidelines" }
      ],
      errorDetails: error.message,
      scannedImageUrl: imageUri,
      isMockData: true
    };
  }
};

/**
 * Checks if the API server is running.
 * 
 * @returns {Promise<boolean>} - True if server is reachable
 */
export const checkApiHealth = async () => {
  try {
    console.log(`Checking API health at: ${API_BASE_URL}/api/health`);
    // Use a shorter timeout for the health check to avoid long waiting times
    const response = await axios.get(`${API_BASE_URL}/api/health`, {
      timeout: 2000 // Reduced timeout for faster fallback to mock data
    });
    
    if (response.data && response.data.status === 'healthy') {
      console.log('✅ API server is running and healthy');
      return true;
    }
    
    console.log(`⚠️ API responded with unexpected data: ${JSON.stringify(response.data)}`);
    return false;
  } catch (error) {
    // More detailed error logging
    if (error.code === 'ECONNABORTED') {
      console.log('⚠️ API health check timed out after 2000ms');
    } else if (error.code === 'ERR_NETWORK') {
      console.log(`❌ Network error connecting to ${API_BASE_URL} - check if server is running`);
    } else {
      const errorMessage = error.code || error.message || 'Unknown error';
      console.log(`❌ API health check failed: ${errorMessage}`);
    }
    
    console.log('ℹ️ Falling back to mock data - start the API server to use real data');
    return false;
  }
};

export default {
  analyzeImage,
  checkApiHealth
};