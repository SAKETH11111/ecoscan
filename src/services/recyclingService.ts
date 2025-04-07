import { findRecyclingLocations, generateRecyclingSearchTerm, getPlaceDetails } from './placesApi';
import type { PlaceResult } from './placesApi';

/**
 * Interface for scan results from the scanning process
 */
export interface ScanResult {
  itemName: string;
  recyclable: boolean;
  category: string;
  recyclingCode: string;
  instructions: string;
  impact: {
    co2Saved: string;
    waterSaved: string;
  };
  scannedImageUrl?: string;
  isMockData?: boolean;
  errorDetails?: string;
}

/**
 * Process a scan result to find recycling locations
 * @param scanResult Result from scanning an item
 * @returns Promise with nearby recycling locations
 */
export async function findDropOffLocationsFromScan(
  scanResult: ScanResult
): Promise<PlaceResult[]> {
  try {
    if (!scanResult) {
      throw new Error('No scan result provided');
    }
    
    // Generate search term based on the material category and recycling code
    const searchTerm = generateRecyclingSearchTerm(
      scanResult.category,
      scanResult.recyclingCode
    );
    
    // Find recycling locations
    const locations = await findRecyclingLocations(searchTerm);
    
    console.log(`Found ${locations.length} recycling locations for ${scanResult.itemName} (${scanResult.category})`);
    
    return locations;
  } catch (error) {
    console.error('Error finding drop-off locations:', error);
    return [];
  }
}

/**
 * Get additional details for a recycling location
 * @param location Basic location information
 * @returns Promise with enhanced location details
 */
export async function getRecyclingLocationDetails(
  location: PlaceResult
): Promise<PlaceResult> {
  try {
    const details = await getPlaceDetails(location.id);
    
    if (!details) {
      return location;
    }
    
    return {
      ...location,
      ...details
    };
  } catch (error) {
    console.error('Error getting location details:', error);
    return location;
  }
}

/**
 * Determine if a location accepts a specific material type
 * based on its types and the scan result
 * @param location Place result from Google Places API
 * @param scanResult Scan result with material information
 * @returns Boolean indicating if location likely accepts the material
 */
export function locationAcceptsMaterial(
  location: PlaceResult,
  scanResult: ScanResult
): boolean {
  if (!location.types || location.types.length === 0) {
    return true; // If we don't have type data, assume it accepts the material
  }
  
  // Common types for recycling centers
  const recyclingTypes = [
    'recycling_center',
    'waste_management',
    'point_of_interest',
    'establishment'
  ];
  
  // Check if any recycling-related types match
  const hasRecyclingType = location.types.some(type => 
    recyclingTypes.includes(type.toLowerCase())
  );
  
  // Material-specific logic
  const category = scanResult.category.toLowerCase();
  
  if (category === 'electronics' || category === 'e-waste') {
    return hasRecyclingType || 
      location.name.toLowerCase().includes('electronic') ||
      location.name.toLowerCase().includes('e-waste');
  }
  
  if (category === 'hazardous') {
    return hasRecyclingType || 
      location.name.toLowerCase().includes('hazardous') ||
      location.name.toLowerCase().includes('chemical');
  }
  
  // For common recyclables, most recycling centers will accept them
  return hasRecyclingType;
} 