import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../src/lib/auth';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    const prepare = async () => {
      try {
        // Wait for auth to initialize
        if (loading) return;
        
        // Navigate based on authentication status
        if (user) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/sign-in');
        }
      } catch (e) {
        console.warn(e);
        // Default to sign-in on error
        router.replace('/(auth)/sign-in');
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ACHIEVERY</Text>
      <Text style={styles.subtitle}>Transform Activities into Achievements</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a', // Navy blue from Strata Noble brand
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
  },
});