import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CommunityScreen = () => {
  // Mock data for demonstration
  const leaderboard = [
    { id: '1', name: 'Sarah Johnson', points: 1250, avatar: null },
    { id: '2', name: 'David Chen', points: 1120, avatar: null },
    { id: '3', name: 'Miguel Torres', points: 950, avatar: null },
    { id: '4', name: 'Emma Wilson', points: 820, avatar: null },
    { id: '5', name: 'You', points: 780, avatar: null, isUser: true },
  ];

  const challenges = [
    { id: '1', title: 'Plastic-Free Week', participants: 245, daysLeft: 3 },
    { id: '2', title: 'Electronic Waste Drive', participants: 132, daysLeft: 7 },
  ];

  const renderLeaderboardItem = ({ item, index }) => (
    <View style={[styles.leaderboardItem, item.isUser && styles.userItem]}>
      <Text style={styles.rankText}>{index + 1}</Text>
      <View style={styles.avatarPlaceholder} />
      <Text style={styles.nameText}>{item.name}</Text>
      <Text style={styles.pointsText}>{item.points}</Text>
    </View>
  );

  const renderChallengeItem = ({ item }) => (
    <View style={styles.challengeCard}>
      <Text style={styles.challengeTitle}>{item.title}</Text>
      <View style={styles.challengeDetails}>
        <Text style={styles.challengeParticipants}>{item.participants} participants</Text>
        <Text style={styles.challengeDaysLeft}>{item.daysLeft} days left</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Community</Text>
      
      <Text style={styles.sectionTitle}>Leaderboard</Text>
      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={item => item.id}
        style={styles.leaderboardList}
        scrollEnabled={false}
      />
      
      <Text style={styles.sectionTitle}>Active Challenges</Text>
      <FlatList
        data={challenges}
        renderItem={renderChallengeItem}
        keyExtractor={item => item.id}
        style={styles.challengesList}
        scrollEnabled={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 30,
    color: '#1E1E1E',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#1E1E1E',
  },
  leaderboardList: {
    marginBottom: 30,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  userItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  rankText: {
    width: 30,
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  nameText: {
    flex: 1,
    fontSize: 16,
    color: '#1E1E1E',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  challengesList: {
    marginBottom: 20,
  },
  challengeCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: 8,
  },
  challengeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  challengeParticipants: {
    fontSize: 14,
    color: '#666666',
  },
  challengeDaysLeft: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
  },
});

export default CommunityScreen;