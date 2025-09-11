import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/lib/auth';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  // Generate user initials
  const getUserInitials = () => {
    const name = user?.user_metadata?.name || user?.email || 'User';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: async () => {
          const { error } = await signOut();
          if (error) {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        }}
      ]
    );
  };

  const profileOptions = [
    { id: 'dream', label: 'Edit Dream', icon: 'target-outline', color: '#3b82f6' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications-outline', color: '#f59e0b' },
    { id: 'subscription', label: 'Subscription', icon: 'card-outline', color: '#10b981' },
    { id: 'trust-ledger', label: 'Trust Ledger', icon: 'shield-outline', color: '#8b5cf6' },
    { id: 'help', label: 'Help & Support', icon: 'help-circle-outline', color: '#64748b' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getUserInitials()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email || 'No email'}
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil-outline" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Current Dream */}
        <View style={styles.dreamCard}>
          <View style={styles.dreamHeader}>
            <Ionicons name="target-outline" size={24} color="#1e3a8a" />
            <Text style={styles.dreamTitle}>Current Dream</Text>
          </View>
          <Text style={styles.dreamText}>
            Start a design agency focused on sustainable brand identity
          </Text>
          <View style={styles.phaseContainer}>
            <View style={styles.phaseTag}>
              <Text style={styles.phaseText}>Explore Phase</Text>
            </View>
            <Text style={styles.phaseProgress}>12 actions logged</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>47</Text>
            <Text style={styles.statLabel}>Total Actions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Insights</Text>
          </View>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {profileOptions.map((option) => (
            <TouchableOpacity key={option.id} style={styles.optionItem}>
              <View style={[styles.optionIcon, { backgroundColor: `${option.color}20` }]}>
                <Ionicons name={option.icon as any} size={20} color={option.color} />
              </View>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Subscription Info */}
        <View style={styles.subscriptionCard}>
          <Text style={styles.subscriptionTitle}>Free Plan</Text>
          <Text style={styles.subscriptionText}>
            5 actions per week • Basic features
          </Text>
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
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
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    backgroundColor: '#1e3a8a',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  editButton: {
    padding: 8,
  },
  dreamCard: {
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
  dreamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dreamTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 8,
  },
  dreamText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  phaseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phaseTag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  phaseText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '500',
  },
  phaseProgress: {
    fontSize: 14,
    color: '#64748b',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  optionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  subscriptionCard: {
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
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  subscriptionText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  signOutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '500',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 16,
  },
});