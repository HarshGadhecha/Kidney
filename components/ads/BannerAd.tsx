import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Text, useColorScheme } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { theme } from '@/constants/theme';

interface BannerAdProps {
  size?: BannerAdSize;
  style?: any;
}

/**
 * AdMob Banner Ad Component
 * Displays banner ads using Google Mobile Ads SDK
 *
 * Note: In production, replace test IDs with your actual AdMob unit IDs
 */
export function AdBanner({ size = BannerAdSize.BANNER, style }: BannerAdProps) {
  const colorScheme = useColorScheme();
  const colors = theme.colors[colorScheme ?? 'light'];
  const [adError, setAdError] = useState(false);

  // Use test ad unit IDs (replace with real IDs in production)
  const adUnitId = __DEV__
    ? TestIds.BANNER
    : Platform.select({
        ios: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy',
        android: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy',
      }) || TestIds.BANNER;

  if (adError) {
    return (
      <View style={[styles.placeholderContainer, { backgroundColor: colors.backgroundSecondary }, style]}>
        <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
          Ad space
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={adUnitId}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdFailedToLoad={(error) => {
          console.warn('Ad failed to load:', error);
          setAdError(true);
        }}
      />
    </View>
  );
}

/**
 * Initialize AdMob
 * Call this once when the app starts
 */
export async function initializeAdMob() {
  try {
    // AdMob initialization is automatic with react-native-google-mobile-ads
    // No explicit initialization needed in most cases
    console.log('AdMob initialized');
  } catch (error) {
    console.error('AdMob initialization error:', error);
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  placeholderContainer: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 8,
  },
  placeholderText: {
    fontSize: 12,
  },
});
