import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function NarrativesScreen() {
  const mockNarratives = [
    {
      id: 1,
      weekStart: '2024-12-30',
      title: 'Strong Foundation Week',
      summary: 'This week showed strong foundation-building momentum. Your research activities are creating a solid knowledge base for your design agency vision.',
      actionsCount: 4,
    },
    {
      id: 2,
      weekStart: '2024-12-23',
      title: 'Learning & Connecting',
      summary: 'You made excellent progress in understanding sustainable design principles while beginning to build your professional network.',
      actionsCount: 3,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Weekly Insights</Text>
          <Text style={styles.subtitle}>
            AI-powered summaries of your progress
          </Text>
        </View>

        {mockNarratives.map((narrative) => (
          <View key={narrative.id} style={styles.narrativeCard}>
            <View style={styles.narrativeHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="lightbulb-outline" size={24} color="#f59e0b" />
              </View>
              <View style={styles.narrativeHeaderText}>
                <Text style={styles.narrativeTitle}>{narrative.title}</Text>
                <Text style={styles.narrativeDate}>
                  Week of {new Date(narrative.weekStart).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.actionsBadge}>
                <Text style={styles.actionsBadgeText}>{narrative.actionsCount}</Text>
              </View>
            </View>
            
            <Text style={styles.narrativeSummary}>{narrative.summary}</Text>
          </View>
        ))}

        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyStateTitle}>More insights coming</Text>
          <Text style={styles.emptyStateText}>
            Keep logging your actions to generate more AI-powered insights about your progress.
          </Text>
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
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  narrativeCard: {
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
  narrativeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  narrativeHeaderText: {
    flex: 1,
  },
  narrativeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  narrativeDate: {
    fontSize: 14,
    color: '#64748b',
  },
  actionsBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  actionsBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
  },
  narrativeSummary: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});