import { ScrollView, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch latest data
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.subtitle}>Ready to transform today's activities?</Text>
        </View>

        {/* Dream Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="target-outline" size={24} color="#1e3a8a" />
            <Text style={styles.cardTitle}>Your Dream</Text>
          </View>
          <Text style={styles.dreamText}>
            Start a design agency focused on sustainable brand identity
          </Text>
          <View style={styles.phaseTag}>
            <Text style={styles.phaseText}>Explore Phase</Text>
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trending-up-outline" size={24} color="#10b981" />
            <Text style={styles.cardTitle}>This Week's Progress</Text>
          </View>
          <Text style={styles.progressText}>3 / 5 actions completed</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '60%' }]} />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Actions (2)</Text>
          
          <View style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="book-outline" size={20} color="#3b82f6" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionText}>
                Read article about sustainable design principles
              </Text>
              <Text style={styles.actionCategory}>Learning • 2:30 PM</Text>
            </View>
          </View>

          <View style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="people-outline" size={20} color="#8b5cf6" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionText}>
                Connected with local design mentor on LinkedIn
              </Text>
              <Text style={styles.actionCategory}>Connecting • 11:45 AM</Text>
            </View>
          </View>
        </View>

        {/* Latest Insight */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="lightbulb-outline" size={24} color="#f59e0b" />
            <Text style={styles.cardTitle}>Latest Insight</Text>
          </View>
          <Text style={styles.insightText}>
            This week showed strong foundation-building momentum. Your research 
            activities are creating a solid knowledge base for your design agency vision.
          </Text>
          <Text style={styles.insightDate}>Week of Dec 30, 2024</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding for tab bar
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 8,
  },
  dreamText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  phaseTag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  phaseText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '500',
  },
  progressText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  actionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  actionCategory: {
    fontSize: 13,
    color: '#64748b',
  },
  insightText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 8,
  },
  insightDate: {
    fontSize: 13,
    color: '#64748b',
  },
});