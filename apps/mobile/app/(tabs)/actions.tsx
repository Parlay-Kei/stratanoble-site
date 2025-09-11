import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type ActionCategory = 'learning' | 'building' | 'connecting';

const categories = [
  {
    id: 'learning' as ActionCategory,
    label: 'Learning',
    icon: 'book-outline' as const,
    color: '#3b82f6',
    description: 'Acquiring new skills or knowledge',
  },
  {
    id: 'building' as ActionCategory,
    label: 'Building',
    icon: 'construct-outline' as const,
    color: '#10b981',
    description: 'Creating, developing, or improving something',
  },
  {
    id: 'connecting' as ActionCategory,
    label: 'Connecting',
    icon: 'people-outline' as const,
    color: '#8b5cf6',
    description: 'Building relationships or networking',
  },
];

export default function ActionsScreen() {
  const [actionText, setActionText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ActionCategory | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!actionText.trim() || !selectedCategory) {
      Alert.alert('Missing Information', 'Please describe your action and select a category.');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Submit to API
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      Alert.alert('Success!', 'Your action has been logged and is being processed.', [
        { text: 'OK', onPress: () => {
          setActionText('');
          setSelectedCategory(null);
        }}
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to log action. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Log New Action</Text>
            <Text style={styles.subtitle}>
              What did you do today that moved you forward?
            </Text>
          </View>

          {/* Action Input */}
          <View style={styles.card}>
            <Text style={styles.label}>Describe what you did</Text>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="I helped a friend with their resume..."
              value={actionText}
              onChangeText={setActionText}
              textAlignVertical="top"
            />
            <Text style={styles.hint}>
              Be specific about what you actually did, not what you plan to do.
            </Text>
          </View>

          {/* Category Selection */}
          <View style={styles.card}>
            <Text style={styles.label}>What type of activity was this?</Text>
            
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.categoryCardSelected
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <View style={styles.categoryIcon}>
                  <Ionicons
                    name={category.icon}
                    size={24}
                    color={selectedCategory === category.id ? '#ffffff' : category.color}
                  />
                </View>
                <View style={styles.categoryContent}>
                  <Text style={[
                    styles.categoryLabel,
                    selectedCategory === category.id && styles.categoryLabelSelected
                  ]}>
                    {category.label}
                  </Text>
                  <Text style={[
                    styles.categoryDescription,
                    selectedCategory === category.id && styles.categoryDescriptionSelected
                  ]}>
                    {category.description}
                  </Text>
                </View>
                {selectedCategory === category.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!actionText.trim() || !selectedCategory || loading) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!actionText.trim() || !selectedCategory || loading}
          >
            <Text style={[
              styles.submitButtonText,
              (!actionText.trim() || !selectedCategory || loading) && styles.submitButtonTextDisabled
            ]}>
              {loading ? 'Logging Action...' : 'Log Action'}
            </Text>
          </TouchableOpacity>

          {/* Action Limit Info */}
          <View style={styles.limitInfo}>
            <Ionicons name="information-circle-outline" size={16} color="#64748b" />
            <Text style={styles.limitText}>
              You have 2 actions remaining this week.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  categoryCardSelected: {
    borderColor: '#1e3a8a',
    backgroundColor: '#dbeafe',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  categoryLabelSelected: {
    color: '#1e3a8a',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  categoryDescriptionSelected: {
    color: '#3b82f6',
  },
  submitButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#cbd5e1',
  },
  limitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  limitText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
  },
});