import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { theme } from '@/constants/theme';
import { signIn, signInWithGoogle, signInWithApple } from '@/services/auth/authService';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = theme.colors[colorScheme ?? 'light'];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signInUser = useAuthStore((state) => state.signIn);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await signIn({ email, password });

      if (response.success && response.user && response.token) {
        // Sign in to auth store
        await signInUser(response.user, response.token);

        // Navigate to main app
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithGoogle();

      if (response.success && response.user && response.token) {
        await signInUser(response.user, response.token);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithApple();

      if (response.success && response.user && response.token) {
        await signInUser(response.user, response.token);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="water" size={60} color="#fff" />
            </View>

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to your account</Text>

            {/* Form */}
            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                leftIcon="mail"
                style={styles.input}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                leftIcon="lock-closed"
                style={styles.input}
              />

              <Button
                onPress={handleLogin}
                variant="secondary"
                size="lg"
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
              >
                Login
              </Button>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.divider} />
              </View>

              {/* OAuth Buttons */}
              <View style={styles.oauthContainer}>
                <TouchableOpacity
                  style={styles.oauthButton}
                  onPress={handleGoogleSignIn}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-google" size={24} color="#fff" />
                  <Text style={styles.oauthButtonText}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.oauthButton}
                  onPress={handleAppleSignIn}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-apple" size={24} color="#fff" />
                  <Text style={styles.oauthButtonText}>Apple</Text>
                </TouchableOpacity>
              </View>

              {/* Links */}
              <View style={styles.linksContainer}>
                <Text style={styles.linkText}>
                  Don't have an account?{' '}
                  <Text
                    style={styles.link}
                    onPress={() => router.push('/(auth)/signup')}
                  >
                    Sign Up
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: theme.typography.weights.bold as any,
    color: '#fff',
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium as any,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: theme.spacing.xxl,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: theme.spacing.lg,
  },
  loginButton: {
    marginTop: theme.spacing.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
    width: '100%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    fontSize: theme.typography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: theme.spacing.md,
    fontWeight: theme.typography.weights.medium as any,
  },
  oauthContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  oauthButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: height < 700 ? 48 : 56,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: theme.spacing.xs,
  },
  oauthButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold as any,
    color: '#fff',
  },
  linksContainer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  linkText: {
    fontSize: theme.typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  link: {
    fontWeight: theme.typography.weights.semibold as any,
    color: '#fff',
    textDecorationLine: 'underline',
  },
});
