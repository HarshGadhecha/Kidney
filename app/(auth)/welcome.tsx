import { theme } from '@/constants/theme';
import { signInWithApple, signInWithGoogle } from '@/services/auth/authService';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const FEATURES = [
  { id: '1', icon: 'fitness', text: 'Track your vitals daily' },
  { id: '2', icon: 'flask', text: 'Monitor lab results' },
  { id: '3', icon: 'medical', text: 'Manage medications' },
  { id: '4', icon: 'restaurant', text: 'Log your nutrition' },
];

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const colors = theme.colors[colorScheme ?? 'light'];

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const [loading, setLoading] = useState(false);

  const signInUser = useAuthStore((state) => state.signIn);

  useEffect(() => {
    opacity.value = withSpring(1, { damping: 15 });
    scale.value = withRepeat(
      withSequence(
        withSpring(1.1, { damping: 2 }),
        withSpring(1, { damping: 2 })
      ),
      -1,
      true
    );
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

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

  const renderFeature = ({ item, index }: { item: typeof FEATURES[0], index: number }) => (
    <FeatureItem
      icon={item.icon as keyof typeof Ionicons.glyphMap}
      text={item.text}
      delay={(index + 1) * 100}
    />
  );

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      style={styles.container}
    >
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        {/* App Icon */}
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          <View style={styles.iconBackground}>
            <Ionicons name="water" size={height < 700 ? 60 : 80} color="#fff" />
          </View>
        </Animated.View>

        {/* App Title */}
        <Text style={styles.title}>Kidney Care</Text>
        <Text style={styles.subtitle}>
          Your Personal Health Companion
        </Text>

        {/* Features - Horizontal FlatList */}
        <View style={styles.featuresContainer}>
          <FlatList
            data={FEATURES}
            renderItem={renderFeature}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuresContent}
            snapToInterval={width * 0.7 + theme.spacing.md}
            decelerationRate="fast"
          />
        </View>

        {/* OAuth Buttons */}
        <View style={styles.buttonsContainer}>
          {/* Google Sign In */}
          <TouchableOpacity
            style={styles.oauthButton}
            onPress={handleGoogleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-google" size={24} color="#fff" />
            <Text style={styles.oauthButtonText}>Login with Google</Text>
          </TouchableOpacity>

          {/* Apple Sign In */}
          <TouchableOpacity
            style={styles.oauthButton}
            onPress={handleAppleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-apple" size={24} color="#fff" />
            <Text style={styles.oauthButtonText}>Login with Apple</Text>
          </TouchableOpacity>

          {/* Divider */}
          {/* <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View> */}

          {/* Create Account Button */}
          {/* <Button
            onPress={() => router.push('/(auth)/signup')}
            variant="secondary"
            size="lg"
            style={styles.button}
          >
            Create Account
          </Button> */}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Take control of your kidney health journey
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

interface FeatureItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  delay: number;
}

function FeatureItem({ icon, text, delay }: FeatureItemProps) {
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      translateY.value = withSpring(0);
      opacity.value = withSpring(1);
    }, delay);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.featureItem, animatedStyle]}>
      <View style={styles.featureIconLarge}>
        <Ionicons name={icon} size={height < 700 ? 28 : 32} color="#fff" />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  iconContainer: {
    marginBottom: height < 700 ? theme.spacing.lg : theme.spacing.xl,
  },
  iconBackground: {
    width: height < 700 ? 100 : 140,
    height: height < 700 ? 100 : 140,
    borderRadius: height < 700 ? 50 : 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: height < 700 ? theme.typography.sizes['2xl'] : theme.typography.sizes['3xl'],
    fontWeight: theme.typography.weights.bold as any,
    color: '#fff',
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: height < 700 ? theme.typography.sizes.sm : theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium as any,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: height < 700 ? theme.spacing.lg : theme.spacing.xxl,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  featuresContainer: {
    height: height < 700 ? 140 : 160,
    marginBottom: height < 700 ? theme.spacing.lg : theme.spacing.xxl,
  },
  featuresContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  featureItem: {
    width: width * 0.7,
    alignItems: 'center',
    marginRight: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
  },
  featureIconLarge: {
    width: height < 700 ? 56 : 64,
    height: height < 700 ? 56 : 64,
    borderRadius: height < 700 ? 28 : 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  featureText: {
    fontSize: height < 700 ? theme.typography.sizes.sm : theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium as any,
    color: '#fff',
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
    gap: height < 700 ? theme.spacing.sm : theme.spacing.md,
  },
  button: {
    width: '100%',
    height: height < 700 ? 48 : undefined,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: height < 700 ? 48 : 56,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  oauthButtonText: {
    fontSize: height < 700 ? theme.typography.sizes.sm : theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold as any,
    color: '#fff',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
    width: '100%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    fontSize: theme.typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: theme.spacing.md,
    fontWeight: theme.typography.weights.medium as any,
  },
  footer: {
    marginTop: height < 700 ? theme.spacing.md : theme.spacing.xl,
    fontSize: theme.typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
});