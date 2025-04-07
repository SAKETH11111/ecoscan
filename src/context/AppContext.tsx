import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserData, addScannedItem, updateChallengeProgress, getMonthlyGoalProgress } from '../utils/dataService';
import { findDropOffLocationsFromScan, getRecyclingLocationDetails } from '../services/recyclingService';
import type { ScanResult } from '../services/recyclingService';
import type { PlaceResult } from '../services/placesApi';

interface UserData {
  name: string;
  avatar: string;
  stats: {
    itemsRecycled: number;
    co2Saved: number;
    waterSaved: number;
  };
  challenges: any[];
  history: ScanResult[];
  [key: string]: any;
}

interface AppContextType {
  userData: UserData | null;
  goalProgress: number;
  isLoading: boolean;
  recyclingLocations: PlaceResult[];
  currentScanResult: ScanResult | null;
  isLoadingLocations: boolean;
  addRecycledItem: (item: ScanResult) => boolean;
  updateChallenge: (challengeId: string, progress: number) => boolean;
  refreshData: () => void;
  findRecyclingLocations: (scanResult: ScanResult) => Promise<void>;
  getLocationDetails: (location: PlaceResult) => Promise<PlaceResult>;
  setCurrentScanResult: (result: ScanResult | null) => void;
}

const AppContext = createContext<AppContextType>({
  userData: null,
  goalProgress: 0,
  isLoading: true,
  recyclingLocations: [],
  currentScanResult: null,
  isLoadingLocations: false,
  addRecycledItem: () => false,
  updateChallenge: () => false,
  refreshData: () => {},
  findRecyclingLocations: async () => {},
  getLocationDetails: async (location) => location,
  setCurrentScanResult: () => {},
});

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [goalProgress, setGoalProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recyclingLocations, setRecyclingLocations] = useState<PlaceResult[]>([]);
  const [currentScanResult, setCurrentScanResult] = useState<ScanResult | null>(null);
  const [isLoadingLocations, setIsLoadingLocations] = useState<boolean>(false);

  useEffect(() => {
    // Load initial user data
    loadUserData();
  }, []);

  const loadUserData = () => {
    setIsLoading(true);
    try {
      const data = getUserData();
      setUserData(data);
      
      const progress = getMonthlyGoalProgress();
      setGoalProgress(progress);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addRecycledItem = (item: ScanResult): boolean => {
    try {
      const updatedData = addScannedItem(item);
      setUserData(updatedData);
      
      const progress = getMonthlyGoalProgress();
      setGoalProgress(progress);
      
      return true;
    } catch (error) {
      console.error('Error adding recycled item:', error);
      return false;
    }
  };

  const updateChallenge = (challengeId: string, progress: number): boolean => {
    try {
      const updatedData = updateChallengeProgress(challengeId, progress);
      setUserData(updatedData);
      return true;
    } catch (error) {
      console.error('Error updating challenge:', error);
      return false;
    }
  };

  /**
   * Find recycling locations based on a scan result
   */
  const findRecyclingLocations = async (scanResult: ScanResult): Promise<void> => {
    try {
      setIsLoadingLocations(true);
      setCurrentScanResult(scanResult);
      
      // Find recycling drop-off locations
      const locations = await findDropOffLocationsFromScan(scanResult);
      setRecyclingLocations(locations);
    } catch (error) {
      console.error('Error finding recycling locations:', error);
      setRecyclingLocations([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  /**
   * Get detailed information about a recycling location
   */
  const getLocationDetails = async (location: PlaceResult): Promise<PlaceResult> => {
    try {
      return await getRecyclingLocationDetails(location);
    } catch (error) {
      console.error('Error getting location details:', error);
      return location;
    }
  };

  const value: AppContextType = {
    userData,
    goalProgress,
    isLoading,
    recyclingLocations,
    currentScanResult,
    isLoadingLocations,
    addRecycledItem,
    updateChallenge,
    refreshData: loadUserData,
    findRecyclingLocations,
    getLocationDetails,
    setCurrentScanResult,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext; 