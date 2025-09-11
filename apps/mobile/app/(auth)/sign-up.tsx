import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../src/components/ui';
import { useAuth } from '../../src/lib/auth';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const { signUp } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter your name.');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Missing Information', 'Please enter your email.');
      return false;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return false;
    }

    if (!acceptedTerms) {
      Alert.alert('Terms Required', 'Please accept the Terms of Service and Privacy Policy.');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const { error } = await signUp(email.trim(), password, {
        name: name.trim(),
      });
      
      if (error) {
        Alert.alert('Sign Up Failed', error.message || 'Please try again.');
      } else {
        Alert.alert(
          'Check Your Email',
          'We sent you a confirmation email. Please click the link to verify your account.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
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
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons name="target" size={32} color="#ffffff" />
              </View>
            </View>
            <Text style={styles.title}>Join ACHIEVERY</Text>
            <Text style={styles.subtitle}>
              Start transforming your activities into achievements
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              autoCapitalize="words"
              autoCorrect={false}
            />

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.passwordContainer}>
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="At least 6 characters"
                secureTextEntry={!showPassword}
                containerStyle={styles.passwordInput}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>

            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              secureTextEntry={!showPassword}
            />

            {/* Terms Checkbox */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxSelected]}>
                {acceptedTerms && (
                  <Ionicons name="checkmark" size={16} color="#ffffff" />
                )}
              </View>
              <Text style={styles.termsText}>
                I accept the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={loading}
              style={styles.signUpButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </Link>
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
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#1e3a8a',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    marginBottom: 16,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 48,
    padding: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  termsLink: {
    color: '#1e3a8a',
    fontWeight: '500',
  },
  signUpButton: {
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
  },
  footerLink: {
    fontSize: 14,
    color: '#1e3a8a',
    fontWeight: '600',
  },
});