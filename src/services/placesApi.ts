import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get the API key from Expo Constants
const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.extra?.googlePlacesApiKey || '';

// Check if API key is available
if (!GOOGLE_PLACES_API_KEY) {
  console.warn('Google Places API key is not configured. Places API functionality will not work.');
}

export interface PlaceResult {
  id: string;
  name: string;
  address: string;
  distance?: number;
  rating?: number;
  openNow?: boolean;
  phoneNumber?: string;
  website?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  types?: string[];
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

/**
 * Generate search terms based on material type
 * @param material Type of material to recycle
 * @param recyclingCode Optional recycling code for plastics
 * @returns Search query string
 */
export function generateRecyclingSearchTerm(
  material: string,
  recyclingCode?: string
): string {
  const baseQuery = "recycling center";
  const materialLower = material.toLowerCase();
  
  switch (materialLower) {
    case "plastic":
      return `${recyclingCode || ""} plastic ${baseQuery}`;
    case "glass":
      return `glass ${baseQuery}`;
    case "paper":
      return `paper ${baseQuery}`;
    case "metal":
      return `metal ${baseQuery}`;
    case "electronics":
      return "e-waste recycling center";
    case "hazardous":
      return "hazardous waste disposal";
    default:
      return `${materialLower} ${baseQuery}`;
  }
}

/**
 * Get current user location
 * @returns Promise with location coordinates
 */
export async function getCurrentLocation(): Promise<LocationCoords> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }
    
    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    // Fallback to San Francisco coordinates
    return {
      latitude: 37.7749,
      longitude: -122.4194
    };
  }
}

/**
 * Calculate distance between two coordinates in kilometers
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

/**
 * Create a URL for Google Places API call with proper parameters and API key
 * @param endpoint The endpoint to use (e.g., "nearbysearch")
 * @param params Parameters to include in the URL
 * @returns Complete URL for API call
 */
function createPlacesApiUrl(endpoint: string, params: Record<string, string>): string {
  // Base Google Places API URL
  const baseUrl = `https://maps.googleapis.com/maps/api/place/${endpoint}/json`;
  
  // Add API key to parameters
  const allParams = { ...params, key: GOOGLE_PLACES_API_KEY };
  
  // Convert parameters to URL query string
  const queryString = Object.entries(allParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  
  return `${baseUrl}?${queryString}`;
}

/**
 * Mock data for testing when API key is not available
 */
function getMockRecyclingLocations(latitude: number, longitude: number, searchTerm: string): PlaceResult[] {
  const materialType = searchTerm.includes('plastic') ? 'plastic' :
                      searchTerm.includes('glass') ? 'glass' :
                      searchTerm.includes('paper') ? 'paper' :
                      searchTerm.includes('metal') ? 'metal' : 'general';
  
  const mockLocations: PlaceResult[] = [
    {
      id: 'mock-place-1',
      name: `${materialType.charAt(0).toUpperCase() + materialType.slice(1)} Recycling Center`,
      address: '123 Green Street, San Francisco, CA',
      distance: 1.2,
      rating: 4.5,
      openNow: true,
      coordinates: {
        latitude: latitude + 0.01,
        longitude: longitude + 0.01
      },
      types: ['recycling_center', 'establishment']
    },
    {
      id: 'mock-place-2',
      name: 'City Waste Management',
      address: '456 Earth Boulevard, San Francisco, CA',
      distance: 2.5,
      rating: 4.2,
      openNow: false,
      coordinates: {
        latitude: latitude - 0.02,
        longitude: longitude + 0.02
      },
      types: ['recycling_center', 'establishment']
    },
    {
      id: 'mock-place-3',
      name: 'EcoSmart Recycling',
      address: '789 Sustainability Avenue, San Francisco, CA',
      distance: 3.1,
      rating: 4.8,
      openNow: true,
      coordinates: {
        latitude: latitude + 0.03,
        longitude: longitude - 0.01
      },
      types: ['recycling_center', 'establishment']
    }
  ];
  
  return mockLocations;
}

/**
 * Find recycling locations near the given coordinates
 * @param searchTerm Search term to use (e.g. "plastic recycling center")
 * @param coords User coordinates (latitude, longitude)
 * @param radius Search radius in meters (default 10000 = 10km)
 * @returns Promise with array of PlaceResult
 */
export async function findRecyclingLocations(
  searchTerm: string,
  coords?: LocationCoords,
  radius: number = 10000
): Promise<PlaceResult[]> {
  try {
    // If coordinates aren't provided, try to get current location
    const userCoords = coords || await getCurrentLocation();
    const { latitude, longitude } = userCoords;
    
    console.log(`Searching for recycling locations with term: ${searchTerm}`);
    
    // If API key is not available, return mock data
    if (!GOOGLE_PLACES_API_KEY) {
      console.warn('Using mock data for recycling locations (no API key)');
      return getMockRecyclingLocations(latitude, longitude, searchTerm);
    }
    
    // Create URL for Places API
    const params = {
      location: `${latitude},${longitude}`,
      radius: radius.toString(),
      type: 'establishment',
      keyword: searchTerm
    };
    
    const url = createPlacesApiUrl('nearbysearch', params);
    
    // Make the API request
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Places API response error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'REQUEST_DENIED') {
        console.error('Google Places API request denied:', data.error_message);
        throw new Error(`API request denied: ${data.error_message}`);
      }
      
      if (!data.results || data.status !== "OK") {
        console.error("Google Places API Error:", data.status, data.error_message);
        return [];
      }
      
      // Parse and return the results
      return data.results.map((place: any) => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        distance: calculateDistance(
          latitude, 
          longitude, 
          place.geometry.location.lat, 
          place.geometry.location.lng
        ),
        rating: place.rating,
        openNow: place.opening_hours?.open_now,
        coordinates: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng
        },
        types: place.types,
      }));
    } catch (error) {
      console.error('Error calling Google Places API:', error);
      return getMockRecyclingLocations(latitude, longitude, searchTerm);
    }
  } catch (error) {
    console.error('Error finding recycling locations:', error);
    return [];
  }
}

/**
 * Get more details about a place using its place ID
 * @param placeId Place ID from Google Places API
 * @returns Promise with detailed place information
 */
export async function getPlaceDetails(placeId: string): Promise<Partial<PlaceResult> | null> {
  try {
    // If API key is not available, return mock details
    if (!GOOGLE_PLACES_API_KEY) {
      console.warn('Using mock data for place details (no API key)');
      return {
        id: placeId,
        name: 'Mock Recycling Center',
        phoneNumber: '(555) 123-4567',
        website: 'https://example.com/recycling',
        openNow: true
      };
    }
    
    // Create URL for Places API
    const params = {
      place_id: placeId,
      fields: 'name,formatted_phone_number,website,opening_hours'
    };
    
    const url = createPlacesApiUrl('details', params);
    
    // Make the API request
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Places Details API response error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'REQUEST_DENIED') {
      console.error('Google Places API request denied:', data.error_message);
      throw new Error(`API request denied: ${data.error_message}`);
    }
    
    if (!data.result || data.status !== "OK") {
      console.error("Google Places Details API Error:", data.status, data.error_message);
      return null;
    }
    
    return {
      id: placeId,
      name: data.result.name,
      phoneNumber: data.result.formatted_phone_number,
      website: data.result.website,
      openNow: data.result.opening_hours?.open_now
    };
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
}

/**
 * Get directions URL to a place
 * @param placeId Google Place ID
 * @param placeCoords Optional place coordinates
 * @returns URL to open in Google Maps
 */
export function getDirectionsUrl(placeId: string, placeCoords?: LocationCoords): string {
  if (placeCoords) {
    const { latitude, longitude } = placeCoords;
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${placeId}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=&destination_place_id=${placeId}`;
} 