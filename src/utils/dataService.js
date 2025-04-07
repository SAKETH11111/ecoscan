// This is a mock data service for demonstration
// In a real app, this would use AsyncStorage or a database

let userData = {
  itemsRecycled: 24,
  co2Saved: 15, // kg
  waterSaved: 120, // L
  monthlyGoal: 40,
  scannedItems: [
    { 
      date: '2025-04-01',
      itemName: 'Plastic Bottle',
      recyclable: true,
      impact: { co2Saved: 0.2, waterSaved: 3 } 
    },
    { 
      date: '2025-04-02',
      itemName: 'Aluminum Can',
      recyclable: true,
      impact: { co2Saved: 0.5, waterSaved: 5 } 
    },
    { 
      date: '2025-04-03',
      itemName: 'Glass Jar',
      recyclable: true,
      impact: { co2Saved: 0.3, waterSaved: 2 } 
    },
  ],
  challenges: [
    { id: '1', title: 'Plastic-Free Week', progress: 60, daysLeft: 3 },
  ]
};

export const getUserData = () => {
  return { ...userData };
};

// Helper to extract numeric value from strings like "0.2 kg" or "3 L"
const extractNumericValue = (valueStr) => {
  if (typeof valueStr === 'number') return valueStr;
  
  const match = valueStr.match(/^(\d+(\.\d+)?)/);
  if (match && match[1]) {
    return parseFloat(match[1]);
  }
  return 0;
};

export const addScannedItem = (item) => {
  // Skip mock data from being added to stats if it has the flag
  if (item.isMockData) {
    // Still add to history but don't count in stats
    userData = {
      ...userData,
      scannedItems: [
        { 
          date: new Date().toISOString().split('T')[0],
          itemName: item.itemName,
          recyclable: item.recyclable,
          impact: item.impact,
          isMockData: true
        },
        ...userData.scannedItems,
      ].slice(0, 10) // Keep only the last 10 items
    };
    return { ...userData };
  }

  if (item.recyclable) {
    // Extract numeric values from impact strings (e.g., "0.2 kg" -> 0.2)
    const co2Value = extractNumericValue(item.impact.co2Saved);
    const waterValue = extractNumericValue(item.impact.waterSaved);
    
    userData = {
      ...userData,
      itemsRecycled: userData.itemsRecycled + 1,
      co2Saved: userData.co2Saved + co2Value,
      waterSaved: userData.waterSaved + waterValue,
      scannedItems: [
        { 
          date: new Date().toISOString().split('T')[0],
          itemName: item.itemName,
          recyclable: item.recyclable,
          category: item.category,
          recyclingCode: item.recyclingCode,
          impact: item.impact
        },
        ...userData.scannedItems,
      ].slice(0, 10) // Keep only the last 10 items
    };
  } else {
    userData = {
      ...userData,
      scannedItems: [
        { 
          date: new Date().toISOString().split('T')[0],
          itemName: item.itemName,
          recyclable: item.recyclable,
          category: item.category,
          recyclingCode: item.recyclingCode,
          impact: { co2Saved: "0 kg", waterSaved: "0 L" }
        },
        ...userData.scannedItems,
      ].slice(0, 10) // Keep only the last 10 items
    };
  }

  return { ...userData };
};

export const updateChallengeProgress = (challengeId, progress) => {
  userData = {
    ...userData,
    challenges: userData.challenges.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, progress }
        : challenge
    )
  };

  return { ...userData };
};

export const getMonthlyGoalProgress = () => {
  return (userData.itemsRecycled / userData.monthlyGoal) * 100;
};