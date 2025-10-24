/**
 * More/Settings Screen
 * App settings and additional features
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Text, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function MoreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];
  const { user, isPremium } = useAuthStore();

  const menuItems = [
    { label: 'Profile', icon: 'person.circle', route: '/profile' },
    { label: 'Settings', icon: 'gearshape', route: '/settings' },
    { label: 'Data Export', icon: 'square.and.arrow.up', route: '/export' },
    { label: 'Share Access', icon: 'person.2', route: '/sharing', premium: true },
    { label: 'Reports', icon: 'chart.bar', route: '/reports', premium: true },
    { label: 'Help & Support', icon: 'questionmark.circle', route: '/help' },
    { label: 'About', icon: 'info.circle', route: '/about' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>More</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'P'}
              </Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {user?.name || 'Patient'}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                {user?.email || 'patient@example.com'}
              </Text>
              {isPremium && (
                <Badge label="Premium" variant="warning" size="sm" style={styles.premiumBadge} />
              )}
            </View>
          </View>
        </Card>

        {/* Menu Items */}
        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <Card
              key={item.label}
              onPress={() => {}}
              style={styles.menuItem}
              padding="md"
            >
              <View style={styles.menuItemContent}>
                <View style={styles.menuItemLeft}>
                  <IconSymbol name={item.icon as any} size={24} color={colors.primary} />
                  <Text style={[styles.menuItemLabel, { color: colors.text }]}>
                    {item.label}
                  </Text>
                </View>
                {item.premium && !isPremium && (
                  <Badge label="Premium" variant="warning" size="sm" />
                )}
                <IconSymbol name="chevron.right" size={20} color={colors.textTertiary} />
              </View>
            </Card>
          ))}
        </View>

        {/* Version */}
        <Text style={[styles.version, { color: colors.textTertiary }]}>
          Version 1.0.0 (Phase 1 MVP)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  profileCard: {
    marginBottom: Spacing.lg,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.fontSize['2xl'],
    color: '#FFFFFF',
    fontWeight: Typography.fontWeight.bold,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  profileEmail: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  premiumBadge: {
    marginTop: Spacing.sm,
  },
  menu: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  menuItem: {
    marginBottom: 0,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginLeft: Spacing.md,
  },
  version: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
});
