/**
 * Home Dashboard Screen
 * Main overview of patient's health status
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AdBanner } from '@/components/ads/BannerAd';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { initDatabase } from '@/lib/database';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];
  const { user, isPremium } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Initialize database
    initDatabase().catch(console.error);

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Sync data with backend
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const quickActions = [
    { label: 'Log Vitals', icon: '💓', color: colors.vitals.weight, route: '/vitals' },
    { label: 'Add Lab', icon: '🧪', color: colors.primary, route: '/labs' },
    { label: 'Medications', icon: '💊', color: colors.secondary, route: '/medications' },
    { label: 'Food Log', icon: '🍽️', color: colors.warning, route: '/food' },
  ];

  const todayStats = {
    weight: { value: '--', unit: 'kg', label: 'Weight' },
    bp: { value: '--/--', unit: 'mmHg', label: 'Blood Pressure' },
    fluid: { value: 0, unit: 'ml', label: 'Fluid Intake' },
    meds: { value: 0, unit: '/5', label: 'Medications' },
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Animated.View entering={FadeInDown.delay(100)}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>{user?.name || 'Patient'}</Text>
            {isPremium && (
              <Badge label="Premium" variant="warning" size="sm" style={styles.premiumBadge} />
            )}
          </Animated.View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Today's Overview */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Overview</Text>
            <Card style={styles.overviewCard}>
              <View style={styles.statsGrid}>
                {Object.entries(todayStats).map(([key, stat], index) => (
                  <Animated.View key={key} entering={FadeInDown.delay(300 + index * 50)} style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                    <Text style={[styles.statUnit, { color: colors.textSecondary }]}>{stat.unit}</Text>
                    <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{stat.label}</Text>
                  </Animated.View>
                ))}
              </View>
            </Card>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.delay(500)}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {quickActions.map((action, index) => (
                <Animated.View key={action.label} entering={FadeInDown.delay(600 + index * 50)}>
                  <Card
                    onPress={() => router.push(action.route as any)}
                    style={styles.actionCard}
                    padding="md"
                  >
                    <Text style={styles.actionIcon}>{action.icon}</Text>
                    <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
                  </Card>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Recent Activity */}
          <Animated.View entering={FadeInDown.delay(800)}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
              <Button title="View All" variant="ghost" size="sm" onPress={() => {}} />
            </View>
            <Card>
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No recent activity
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                  Start logging your vitals, labs, and medications
                </Text>
              </View>
            </Card>
          </Animated.View>

          {/* Ad Banner */}
          {!isPremium && (
            <Animated.View entering={FadeInDown.delay(850)}>
              <AdBanner style={styles.adBanner} />
            </Animated.View>
          )}

          {/* Health Tips */}
          {!isPremium && (
            <Animated.View entering={FadeInDown.delay(900)}>
              <Card style={[styles.tipCard, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.tipTitle, { color: colors.primary }]}>Upgrade to Premium</Text>
                <Text style={[styles.tipText, { color: colors.text }]}>
                  Get unlimited lab uploads, advanced analytics, and personalized insights.
                </Text>
                <Button
                  title="Learn More"
                  variant="primary"
                  size="sm"
                  onPress={() => {}}
                  style={styles.tipButton}
                  gradient
                />
              </Card>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.xl,
    paddingTop: Spacing.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: Typography.fontSize.base,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: Typography.fontWeight.medium,
  },
  userName: {
    fontSize: Typography.fontSize['3xl'],
    color: '#FFFFFF',
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.xs,
  },
  premiumBadge: {
    marginTop: Spacing.sm,
  },
  content: {
    padding: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  overviewCard: {
    marginBottom: Spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  statUnit: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionCard: {
    width: 160,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  tipCard: {
    marginTop: Spacing.lg,
  },
  tipTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  tipText: {
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.md,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  tipButton: {
    alignSelf: 'flex-start',
  },
  adBanner: {
    marginVertical: Spacing.lg,
  },
});
