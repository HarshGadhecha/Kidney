import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const colors = theme.colors[colorScheme ?? 'light'];

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

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

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      style={styles.container}
    >
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        {/* App Icon */}
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          <View style={styles.iconBackground}>
            <Ionicons name="water" size={80} color="#fff" />
          </View>
        </Animated.View>

        {/* App Title */}
        <Text style={styles.title}>Kidney Care</Text>
        <Text style={styles.subtitle}>
          Your Personal Health Companion
        </Text>

        {/* Features */}
        <View style={styles.features}>
          <FeatureItem
            icon="fitness"
            text="Track your vitals daily"
            delay={100}
          />
          <FeatureItem
            icon="flask"
            text="Monitor lab results"
            delay={200}
          />
          <FeatureItem
            icon="medical"
            text="Manage medications"
            delay={300}
          />
          <FeatureItem
            icon="restaurant"
            text="Log your nutrition"
            delay={400}
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Button
            onPress={() => router.push('/(auth)/login')}
            variant="secondary"
            size="lg"
            style={styles.button}
          >
            Login
          </Button>
          <Button
            onPress={() => router.push('/(auth)/signup')}
            variant="primary"
            size="lg"
            style={styles.button}
          >
            Create Account
          </Button>
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
  const translateX = useSharedValue(-50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      translateX.value = withSpring(0);
      opacity.value = withSpring(1);
    }, delay);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.featureItem, animatedStyle]}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={24} color="#fff" />
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
    paddingHorizontal: theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: theme.spacing.xl,
  },
  iconBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: theme.typography.sizes['3xl'],
    fontWeight: theme.typography.weights.bold as any,
    color: '#fff',
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.medium as any,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: theme.spacing.xxl,
    textAlign: 'center',
  },
  features: {
    width: '100%',
    marginBottom: theme.spacing.xxl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  featureText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium as any,
    color: '#fff',
    flex: 1,
  },
  buttonsContainer: {
    width: '100%',
    gap: theme.spacing.md,
  },
  button: {
    width: '100%',
  },
  footer: {
    marginTop: theme.spacing.xl,
    fontSize: theme.typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});
