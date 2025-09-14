import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface WebPlatformIntegrationProps {
  currentSection?: 'dashboard' | 'actions' | 'narratives' | 'profile';
  showFullFeatures?: boolean;
}

export const WebPlatformIntegration: React.FC<WebPlatformIntegrationProps> = ({
  currentSection = 'dashboard',
  showFullFeatures = true
}) => {
  const handleOpenWebPlatform = async (path: string = '') => {
    const url = `https://stratanoble.com/achievery${path}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open the web platform');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open the link');
    }
  };

  const handleOpenWithDeepLink = async (section: string) => {
    // Create web URL with deep link parameter for mobile app detection
    const webUrl = `https://stratanoble.com/achievery/${section}?from_mobile=true&return_to=app`;
    
    try {
      await Linking.openURL(webUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to open web platform');
    }
  };

  const webFeatures = [
    {
      icon: 'analytics-outline' as const,
      title: 'Advanced Analytics',
      description: 'Detailed progress charts and trends',
      path: '/analytics',
      color: '#3B82F6'
    },
    {
      icon: 'document-text-outline' as const,
      title: 'Extended Narratives',
      description: 'Full weekly reports and insights',
      path: '/narratives',
      color: '#10B981'
    },
    {
      icon: 'settings-outline' as const,
      title: 'Account Settings',
      description: 'Manage subscription and preferences',
      path: '/profile',
      color: '#6B7280'
    },
    {
      icon: 'cloud-download-outline' as const,
      title: 'Export Data',
      description: 'Download your progress data',
      path: '/export',
      color: '#8B5CF6'
    }
  ];

  const quickActions = [
    {
      icon: 'desktop-outline' as const,
      title: 'Full Dashboard',
      description: 'Access complete web interface',
      action: () => handleOpenWebPlatform()
    },
    {
      icon: 'share-outline' as const,
      title: 'Share Progress',
      description: 'Generate shareable progress report',
      action: () => handleOpenWebPlatform('/share')
    },
    {
      icon: 'help-circle-outline' as const,
      title: 'Support Center',
      description: 'Get help and tutorials',
      action: () => handleOpenWebPlatform('/support')
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="globe-outline" color="#FFFFFF" size={24} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Web Platform Features</Text>
          <Text style={styles.subtitle}>
            Access advanced features on the full web platform
          </Text>
        </View>
      </View>

      {/* Current Section Quick Access */}
      <View style={styles.quickAccessCard}>
        <View style={styles.quickAccessHeader}>
          <MaterialCommunityIcons 
            name="lightning-bolt" 
            color="#F59E0B" 
            size={20} 
          />
          <Text style={styles.quickAccessTitle}>Continue on Web</Text>
        </View>
        <Text style={styles.quickAccessDescription}>
          Pick up where you left off with the full desktop experience
        </Text>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => handleOpenWithDeepLink(currentSection)}
        >
          <Ionicons name="arrow-forward-outline" color="#FFFFFF" size={20} />
          <Text style={styles.continueButtonText}>
            Open {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)} on Web
          </Text>
        </TouchableOpacity>
      </View>

      {/* Web-Only Features */}
      {showFullFeatures && (
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Web-Exclusive Features</Text>
          <View style={styles.featuresGrid}>
            {webFeatures.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.featureCard, { borderLeftColor: feature.color }]}
                onPress={() => handleOpenWebPlatform(feature.path)}
                activeOpacity={0.7}
              >
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <Ionicons name={feature.icon} color="#FFFFFF" size={18} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <Ionicons name="open-outline" color="#9CA3AF" size={16} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickActionCard}
              onPress={action.action}
              activeOpacity={0.7}
            >
              <Ionicons name={action.icon} color="#6B7280" size={24} />
              <Text style={styles.quickActionTitle}>{action.title}</Text>
              <Text style={styles.quickActionDescription}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Strata Noble Services Link */}
      <TouchableOpacity 
        style={styles.servicesButton}
        onPress={() => Linking.openURL('https://stratanoble.com')}
      >
        <MaterialCommunityIcons name="business" color="#FFFFFF" size={20} />
        <Text style={styles.servicesButtonText}>Explore Strata Noble Services</Text>
        <Ionicons name="arrow-forward-outline" color="#FFFFFF" size={16} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  quickAccessCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  quickAccessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  quickAccessDescription: {
    fontSize: 14,
    color: '#78350F',
    marginBottom: 12,
  },
  continueButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  featuresSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  featuresGrid: {
    gap: 8,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
  },
  featureIcon: {
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  quickActionsSection: {
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActionDescription: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  servicesButton: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  servicesButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 8,
  },
});

export default WebPlatformIntegration;