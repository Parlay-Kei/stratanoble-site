import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAnalytics } from '../hooks/useAnalytics';

/**
 * Example component demonstrating ACHIEVERY analytics usage
 * This shows how to integrate GA4 event tracking in your React Native components
 */
export const ExampleAnalyticsUsage: React.FC = () => {
  const {
    trackEvent,
    trackGoalCreated,
    trackGoalCompleted,
    trackProgressUpdate,
    trackMilestone,
    trackFeatureUsage,
    trackScreenView,
    trackButtonPress,
  } = useAnalytics();

  // Track screen view when component mounts
  useEffect(() => {
    trackScreenView('ExampleScreen');
  }, [trackScreenView]);

  // Example handlers for different ACHIEVERY actions
  const handleCreateGoal = async () => {
    await trackButtonPress('create_goal_button', 'ExampleScreen');
    await trackGoalCreated('fitness', 'high');
    
    // Your goal creation logic here
    console.log('Goal created!');
  };

  const handleCompleteGoal = async () => {
    await trackButtonPress('complete_goal_button', 'ExampleScreen');
    await trackGoalCompleted('goal_123', 7); // 7 days to complete
    
    // Your goal completion logic here
    console.log('Goal completed!');
  };

  const handleUpdateProgress = async () => {
    await trackButtonPress('update_progress_button', 'ExampleScreen');
    await trackProgressUpdate(75); // 75% progress
    
    // Your progress update logic here
    console.log('Progress updated!');
  };

  const handleMilestoneReached = async () => {
    await trackButtonPress('milestone_button', 'ExampleScreen');
    await trackMilestone('first_week_complete');
    
    // Your milestone logic here
    console.log('Milestone reached!');
  };

  const handleFeatureUsage = async () => {
    await trackButtonPress('feature_button', 'ExampleScreen');
    await trackFeatureUsage('calendar_integration');
    
    // Your feature usage logic here
    console.log('Feature used!');
  };

  const handleCustomEvent = async () => {
    await trackButtonPress('custom_event_button', 'ExampleScreen');
    await trackEvent('custom_achievery_action', {
      event_category: 'engagement',
      event_label: 'custom_interaction',
      value: 1,
      custom_parameter: 'example_parameter',
    });
    
    // Your custom event logic here
    console.log('Custom event tracked!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ACHIEVERY Analytics Example</Text>
      <Text style={styles.subtitle}>
        Tap buttons to trigger GA4 events with tracking ID: G-0TGKD1S1HB
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleCreateGoal}>
        <Text style={styles.buttonText}>Create Goal</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleCompleteGoal}>
        <Text style={styles.buttonText}>Complete Goal</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleUpdateProgress}>
        <Text style={styles.buttonText}>Update Progress</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleMilestoneReached}>
        <Text style={styles.buttonText}>Reach Milestone</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleFeatureUsage}>
        <Text style={styles.buttonText}>Use Feature</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleCustomEvent}>
        <Text style={styles.buttonText}>Custom Event</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Analytics Events Tracked:</Text>
        <Text style={styles.infoText}>• Screen views</Text>
        <Text style={styles.infoText}>• Button presses</Text>
        <Text style={styles.infoText}>• Goal creation & completion</Text>
        <Text style={styles.infoText}>• Progress updates</Text>
        <Text style={styles.infoText}>• Milestone achievements</Text>
        <Text style={styles.infoText}>• Feature usage</Text>
        <Text style={styles.infoText}>• Custom ACHIEVERY actions</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});
