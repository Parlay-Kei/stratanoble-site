import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

interface StrataNobleIntegrationProps {
  userProgress?: {
    totalActions: number;
    currentStreak: number;
    tier: 'lite' | 'growth' | 'partner';
  };
}

export const StrataNobleIntegration: React.FC<StrataNobleIntegrationProps> = ({
  userProgress = { totalActions: 0, currentStreak: 0, tier: 'lite' }
}) => {
  const handleOpenWebsite = async (path: string = '') => {
    const url = `https://stratanoble.com${path}`;
    
    try {
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

  const handleBookConsultation = () => {
    Alert.alert(
      'Ready for Strategic Coaching?',
      `Your ${userProgress.totalActions} completed actions show strong momentum. Our consultants can help accelerate your growth.`,
      [
        { text: 'Not Now', style: 'cancel' },
        { 
          text: 'Book Consultation', 
          onPress: () => handleOpenWebsite('/consultation')
        }
      ]
    );
  };

  const services = [
    {
      iconFamily: 'Ionicons' as const,
      iconName: 'people-outline' as const,
      title: 'Strategic Consultation',
      description: 'Personalized coaching based on your ACHIEVERY data',
      action: handleBookConsultation,
      color: '#3B82F6'
    },
    {
      iconFamily: 'MaterialIcons' as const,
      iconName: 'menu-book' as const,
      title: 'Business Resources',
      description: 'Templates, guides, and frameworks for growth',
      action: () => handleOpenWebsite('/resources'),
      color: '#10B981'
    },
    {
      iconFamily: 'Ionicons' as const,
      iconName: 'trending-up-outline' as const,
      title: 'Growth Analytics',
      description: 'Advanced insights and performance analysis',
      action: () => handleOpenWebsite('/analytics'),
      color: '#8B5CF6'
    },
    {
      iconFamily: 'Ionicons' as const,
      iconName: 'chatbubbles-outline' as const,
      title: 'Community Access',
      description: 'Connect with other ambitious professionals',
      action: () => handleOpenWebsite('/community'),
      color: '#F59E0B'
    }
  ];

  const renderIcon = (iconFamily: 'Ionicons' | 'MaterialIcons' | 'FontAwesome5', iconName: string, color: string, size: number) => {
    switch (iconFamily) {
      case 'Ionicons':
        return <Ionicons name={iconName as any} color={color} size={size} />;
      case 'MaterialIcons':
        return <MaterialIcons name={iconName as any} color={color} size={size} />;
      case 'FontAwesome5':
        return <FontAwesome5 name={iconName as any} color={color} size={size} />;
      default:
        return <Ionicons name="help-outline" color={color} size={size} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="globe-outline" color="#FFFFFF" size={24} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Strata Noble Services</Text>
          <Text style={styles.subtitle}>
            Accelerate your progress with expert guidance
          </Text>
        </View>
      </View>

      <View style={styles.progressBanner}>
        <Text style={styles.progressText}>
          🎯 Your Progress: {userProgress.totalActions} actions • {userProgress.currentStreak} day streak
        </Text>
        <Text style={styles.progressSubtext}>
          {userProgress.totalActions >= 25 
            ? "You're ready for advanced strategic coaching!" 
            : `${25 - userProgress.totalActions} more actions to unlock Growth tier benefits`
          }
        </Text>
      </View>

      <View style={styles.servicesGrid}>
        {services.map((service, index) => {
          return (
            <TouchableOpacity
              key={index}
              style={[styles.serviceCard, { borderLeftColor: service.color }]}
              onPress={service.action}
              activeOpacity={0.7}
            >
              <View style={[styles.serviceIcon, { backgroundColor: service.color }]}>
                {renderIcon(service.iconFamily, service.iconName, '#FFFFFF', 20)}
              </View>
              
              <View style={styles.serviceContent}>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </View>
              
              <Ionicons name="open-outline" color="#9CA3AF" size={16} />
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity 
        style={styles.websiteButton}
        onPress={() => handleOpenWebsite()}
      >
        <Ionicons name="globe-outline" color="#FFFFFF" size={20} />
        <Text style={styles.websiteButtonText}>Visit StrataNoble.com</Text>
        <Ionicons name="open-outline" color="#FFFFFF" size={16} />
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
    marginBottom: 16,
  },
  iconContainer: {
    backgroundColor: '#1F2937',
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
  progressBanner: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  progressSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  servicesGrid: {
    marginBottom: 20,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  serviceIcon: {
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  websiteButton: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  websiteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
});

export default StrataNobleIntegration;
