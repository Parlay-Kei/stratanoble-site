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

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signIn(email.trim(), password);
      
      if (error) {
        Alert.alert('Sign In Failed', error.message || 'Please check your credentials and try again.');
      } else {
        router.replace('/(tabs)');
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
            <Text style={styles.title}>Welcome back to ACHIEVERY</Text>
            <Text style={styles.subtitle}>
              Transform your daily activities into meaningful progress
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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
                placeholder="Enter your password"
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

            <Button
              title="Sign In"
              onPress={handleSignIn}
              loading={loading}
              style={styles.signInButton}
            />

            <Link href="/(auth)/reset-password" asChild>
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Guest Access */}
          <TouchableOpacity 
            style={styles.guestAccess}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.guestAccessText}>Continue as Guest</Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
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
    marginBottom: 0,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 48,
    padding: 4,
  },
  signInButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  forgotPassword: {
    alignItems: 'center',
    padding: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#1e3a8a',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
  guestAccess: {
    alignItems: 'center',
    padding: 12,
  },
  guestAccessText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
});