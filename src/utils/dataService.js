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

export const addScannedItem = (item) => {
  if (item.recyclable) {
    userData = {
      ...userData,
      itemsRecycled: userData.itemsRecycled + 1,
      co2Saved: userData.co2Saved + parseFloat(item.impact.co2Saved),
      waterSaved: userData.waterSaved + parseFloat(item.impact.waterSaved),
      scannedItems: [
        { 
          date: new Date().toISOString().split('T')[0],
          itemName: item.itemName,
          recyclable: item.recyclable,
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
          impact: { co2Saved: 0, waterSaved: 0 }
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