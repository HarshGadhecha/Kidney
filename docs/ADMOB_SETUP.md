# AdMob Integration Setup Guide

This document explains how to set up and configure AdMob for the Kidney Care App.

## Overview

The app uses **react-native-google-mobile-ads** SDK for displaying advertisements. Currently configured with test IDs for development.

## Components

### 1. BannerAd Component
Located at: `components/ads/BannerAd.tsx`

Displays banner ads at the bottom of screens. Usage:
```tsx
import { AdBanner } from '@/components/ads/BannerAd';

<AdBanner style={{ marginVertical: 10 }} />
```

### 2. InterstitialAd Manager
Located at: `components/ads/InterstitialAdManager.ts`

Manages full-screen interstitial ads. Usage:
```tsx
import { interstitialAd, showInterstitialAdWithFrequency } from '@/components/ads/InterstitialAdManager';

// Show ad with frequency control (every 5 interactions)
showInterstitialAdWithFrequency();

// Or show manually
interstitialAd.showAd();
```

## Production Setup

### Step 1: Create AdMob Account
1. Go to [AdMob Console](https://admob.google.com/)
2. Sign up or log in with your Google account
3. Create a new app or link existing app

### Step 2: Get Your App IDs and Ad Unit IDs

#### App IDs
- **iOS App ID**: ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY
- **Android App ID**: ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY

#### Ad Unit IDs
Create the following ad units in AdMob:
- **Banner Ad (iOS)**: ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY
- **Banner Ad (Android)**: ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY
- **Interstitial Ad (iOS)**: ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY
- **Interstitial Ad (Android)**: ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY

### Step 3: Update Configuration Files

#### 1. Update `app.json`
Replace test App IDs with your production App IDs:
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-YOUR-ANDROID-APP-ID",
          "iosAppId": "ca-app-pub-YOUR-IOS-APP-ID"
        }
      ]
    ]
  }
}
```

#### 2. Update `BannerAd.tsx`
Replace test ad unit IDs (line 22-26):
```typescript
const adUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      ios: 'ca-app-pub-YOUR-IOS-BANNER-UNIT-ID',
      android: 'ca-app-pub-YOUR-ANDROID-BANNER-UNIT-ID',
    }) || TestIds.BANNER;
```

#### 3. Update `InterstitialAdManager.ts`
Replace test ad unit IDs (line 22-26):
```typescript
const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.select({
      ios: 'ca-app-pub-YOUR-IOS-INTERSTITIAL-UNIT-ID',
      android: 'ca-app-pub-YOUR-ANDROID-INTERSTITIAL-UNIT-ID',
    }) || TestIds.INTERSTITIAL;
```

### Step 4: Configure Premium Features

Premium users should NOT see ads. This is already implemented:
- The `isPremium` flag from auth store controls ad visibility
- Banner ads only show when `!isPremium`
- Check premium status before showing interstitial ads

### Step 5: Rebuild the App

After updating configuration:
```bash
# iOS
npx expo prebuild --clean
npx expo run:ios

# Android
npx expo prebuild --clean
npx expo run:android
```

## Ad Placement Strategy

### Current Implementation
1. **Home Screen**: Banner ad between Recent Activity and Health Tips
2. **Future**: Can add interstitial ads after key actions

### Best Practices
- Don't overwhelm users with ads
- Show interstitials sparingly (current: every 5 interactions)
- Always respect premium subscription (no ads for premium users)
- Test ad placement doesn't interfere with app functionality

## Testing

### Development Mode
- Uses test ad unit IDs automatically
- Test ads will display with "Test Ad" label
- No real revenue generated

### Production Mode
- Real ads will display
- Monitor AdMob console for impressions and revenue
- Watch for policy violations

## Privacy & Compliance

### Required Disclosures
1. Update Privacy Policy to mention:
   - Use of Google AdMob
   - Data collection for personalized ads
   - User consent for personalized ads (GDPR/CCPA)

2. Implement consent management:
```typescript
import { AdsConsent } from 'react-native-google-mobile-ads';

// Request consent
const consentInfo = await AdsConsent.requestInfoUpdate();
if (consentInfo.isConsentFormAvailable) {
  await AdsConsent.showForm();
}
```

## Troubleshooting

### Ads not showing
1. Check internet connection
2. Verify ad unit IDs are correct
3. Check AdMob account is approved
4. Ensure app is not in premium mode
5. Check console for error messages

### Test ads not showing
1. Make sure `__DEV__` is true
2. Check internet connection
3. Verify react-native-google-mobile-ads is installed correctly

## Revenue Optimization

### Tips for Maximum Revenue
1. Place ads where users naturally pause
2. Use appropriate ad sizes for screen real estate
3. A/B test different ad placements
4. Monitor eCPM in AdMob console
5. Enable mediation for higher fill rates
6. Offer ad-free experience as premium feature

## Support

- [AdMob Help Center](https://support.google.com/admob/)
- [React Native Google Mobile Ads Docs](https://docs.page/invertase/react-native-google-mobile-ads)
- [AdMob Policy Center](https://support.google.com/admob/answer/6128543)
