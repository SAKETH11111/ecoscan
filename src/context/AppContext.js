import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserData, addScannedItem, updateChallengeProgress, getMonthlyGoalProgress } from '../utils/dataService';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [goalProgress, setGoalProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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

  const addRecycledItem = (item) => {
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

  const updateChallenge = (challengeId, progress) => {
    try {
      const updatedData = updateChallengeProgress(challengeId, progress);
      setUserData(updatedData);
      return true;
    } catch (error) {
      console.error('Error updating challenge:', error);
      return false;
    }
  };

  const value = {
    userData,
    goalProgress,
    isLoading,
    addRecycledItem,
    updateChallenge,
    refreshData: loadUserData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;