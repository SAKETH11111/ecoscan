/**
 * Gemini API client for the EcoScan application.
 * This module provides functions to interact with the Python backend,
 * which interfaces with Google's Gemini API for image analysis.
 */

import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Base URL for the API - CHANGE THIS TO YOUR LOCAL SERVER ADDRESS
 */
const API_BASE_URL = 'http://192.168.142.85:8000'; // Your computer's local IP address

/**
 * @typedef {Object} Impact
 * @property {string} co2Saved - Amount of CO2 saved by recycling this item
 * @property {string} waterSaved - Amount of water saved by recycling this item
 */

/**
 * @typedef {Object} ScanResult
 * @property {string} itemName - The name of the scanned item
 * @property {boolean} recyclable - Whether the item is recyclable
 * @property {string} category - The material category (e.g., Plastic, Glass, Paper, Metal)
 * @property {string} recyclingCode - The recycling code if applicable (e.g., #1 PET, #2 HDPE)
 * @property {string} instructions - Instructions for how to properly recycle or dispose of the item
 * @property {Impact} impact - Environmental impact from recycling this item
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
    // If Gemini API server isn't running yet, use mock data
    const useMockData = false; // Set to false when your server is ready
    
    if (useMockData) {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Analyzing image URI:", imageUri);
      
      // For demonstration purposes - dynamically assign mock results
      // In a real app, this would come from the Gemini API
      const mockItems = [
        {
          itemName: "Plastic Bottle",
          recyclable: true,
          category: "Plastic",
          recyclingCode: "#1 PET",
          instructions: "Rinse the bottle and remove the cap before recycling. Make sure to remove any labels if possible.",
          impact: {
            co2Saved: "0.1 kg",
            waterSaved: "2L"
          }
        },
        {
          itemName: "Glass Bottle",
          recyclable: true,
          category: "Glass",
          recyclingCode: "GL",
          instructions: "Rinse thoroughly. Remove metal caps and plastic labels if required by your local recycling program.",
          impact: {
            co2Saved: "0.3 kg",
            waterSaved: "5L"
          }
        },
        {
          itemName: "Styrofoam Container",
          recyclable: false,
          category: "Plastic",
          recyclingCode: "#6 PS",
          instructions: "Most curbside programs do not accept styrofoam. Check for special recycling facilities in your area.",
          impact: {
            co2Saved: "0 kg",
            waterSaved: "0L"
          }
        },
        {
          itemName: "Aluminum Can",
          recyclable: true,
          category: "Metal",
          recyclingCode: "ALU",
          instructions: "Rinse and place in recycling bin. Aluminum cans are highly recyclable.",
          impact: {
            co2Saved: "0.5 kg",
            waterSaved: "4L"
          }
        }
      ];
      
      // For demo purposes, use a deterministic choice based on URI length
      // to simulate different results for different images
      // In a real implementation, Gemini would analyze the actual image content
      const index = imageUri.length % mockItems.length;
      const mockResult = { ...mockItems[index] };
      mockResult.scannedImageUrl = imageUri;
      mockResult.isMockData = true;
      
      // Log what the real API would receive and what we're returning
      console.log(`[MOCK] Analyzing image: ${imageUri}`);
      console.log(`[MOCK] Returning: ${mockResult.itemName} (${mockResult.recyclable ? 'Recyclable' : 'Not Recyclable'})`);
      
      return mockResult;
    }
    
    // Create form data for the image
    const formData = new FormData();
    
    // Determine file name and type from URI
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    
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
    
    // Return the result
    return response.data;
    
  } catch (error) {
    console.error('Error analyzing image:', error);
    
    // Enhanced error logging
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }
    console.error('Request config:', error.config);
    
    // Return an error result
    return {
      itemName: 'Analysis Failed',
      recyclable: false,
      category: 'Unknown',
      recyclingCode: '',
      instructions: 'Failed to analyze the image. Please check your network connection and server status. Error: ' + (error.message || 'Unknown error'),
      impact: {
        co2Saved: '0 kg',
        waterSaved: '0L'
      },
      errorDetails: error.message,
      scannedImageUrl: imageUri
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
    const response = await axios.get(`${API_BASE_URL}/api/health`, {
      timeout: 5000
    });
    return response.data.status === 'healthy';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

export default {
  analyzeImage,
  checkApiHealth
};