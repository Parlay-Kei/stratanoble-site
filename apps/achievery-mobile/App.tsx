import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import StrataNobleIntegration from './src/components/StrataNobleIntegration';
import WebPlatformIntegration from './src/components/WebPlatformIntegration';

export default function App() {
  const handleOpenWebsite = async () => {
    try {
      const url = 'https://stratanoble.com';
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open the website');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open the link');
    }
  };

  const handleOpenAchieveryWeb = async () => {
    try {
      const url = 'https://stratanoble.com/achievery';
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open ACHIEVERY web platform');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open the link');
    }
  };

  return (
    <LinearGradient
      colors={['#001122', '#002244']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ACHIEVERY</Text>
          <Text style={styles.subtitle}>Strategic Business Development</Text>
          <View style={styles.brandBadge}>
            <Ionicons name="business-outline" color="#50C878" size={16} />
            <Text style={styles.brandText}>Part of Strata Noble</Text>
          </View>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>📱 Mobile App Ready</Text>
          <Text style={styles.description}>
            React Native implementation complete with cross-platform integration.
          </Text>
          
          <View style={styles.featureList}>
            <Text style={styles.statusItem}>✅ Expo SDK 54.0.2</Text>
            <Text style={styles.statusItem}>✅ React Native 0.76.4</Text>
            <Text style={styles.statusItem}>✅ TypeScript Support</Text>
            <Text style={styles.statusItem}>✅ Supabase Integration</Text>
            <Text style={styles.statusItem}>✅ Deep Link Support</Text>
            <Text style={styles.statusItem}>✅ Push Notifications</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={handleOpenAchieveryWeb}
          >
            <Ionicons name="desktop-outline" color="#FFFFFF" size={20} />
            <Text style={styles.buttonText}>Open Web Platform</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]} 
            onPress={handleOpenWebsite}
          >
            <Ionicons name="globe-outline" color="#50C878" size={20} />
            <Text style={[styles.buttonText, { color: '#50C878' }]}>Visit StrataNoble.com</Text>
          </TouchableOpacity>
        </View>

        {/* Web Platform Integration */}
        <WebPlatformIntegration 
          currentSection="dashboard"
          showFullFeatures={true}
        />
        
        {/* Strata Noble Services Integration */}
        <StrataNobleIntegration 
          userProgress={{
            totalActions: 15,
            currentStreak: 3,
            tier: 'lite'
          }}
        />
      </View>
      <StatusBar style="light" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#50C878',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.9,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(80, 200, 120, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(80, 200, 120, 0.3)',
  },
  brandText: {
    color: '#50C878',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  description: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
    lineHeight: 20,
  },
  statusCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#50C878',
    marginBottom: 12,
    textAlign: 'center',
  },
  featureList: {
    marginTop: 16,
  },
  statusItem: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'left',
    opacity: 0.9,
  },
  actionButtons: {
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#50C878',
    shadowColor: '#50C878',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: '#50C878',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
