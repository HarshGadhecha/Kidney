import { Platform } from 'react-native';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

/**
 * Interstitial Ad Manager
 * Manages full-screen interstitial ads
 *
 * Usage:
 * - Call loadAd() when you want to prepare an ad
 * - Call showAd() to display the ad (usually after certain actions)
 */

class InterstitialAdManager {
  private interstitial: InterstitialAd | null = null;
  private loaded = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Use test ad unit IDs (replace with real IDs in production)
    const adUnitId = __DEV__
      ? TestIds.INTERSTITIAL
      : Platform.select({
          ios: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy',
          android: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy',
        }) || TestIds.INTERSTITIAL;

    this.interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    // Set up event listeners
    this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
      this.loaded = true;
      console.log('Interstitial ad loaded');
    });

    this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      this.loaded = false;
      // Preload next ad
      this.loadAd();
    });

    this.interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.warn('Interstitial ad error:', error);
      this.loaded = false;
    });

    // Preload the ad
    this.loadAd();
  }

  /**
   * Load an interstitial ad
   */
  public loadAd() {
    if (!this.interstitial) {
      this.initialize();
      return;
    }

    if (!this.loaded) {
      this.interstitial.load();
    }
  }

  /**
   * Show the interstitial ad if loaded
   * @returns Promise<boolean> - true if ad was shown, false if not ready
   */
  public async showAd(): Promise<boolean> {
    if (!this.loaded || !this.interstitial) {
      console.log('Interstitial ad not ready');
      return false;
    }

    try {
      await this.interstitial.show();
      return true;
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      return false;
    }
  }

  /**
   * Check if ad is loaded and ready to show
   */
  public isLoaded(): boolean {
    return this.loaded;
  }
}

// Export singleton instance
export const interstitialAd = new InterstitialAdManager();

/**
 * Helper function to show interstitial ad with frequency control
 * Shows ad every N interactions to avoid annoying users
 */
let interactionCount = 0;
const SHOW_AD_EVERY = 5; // Show ad every 5 interactions

export function showInterstitialAdWithFrequency() {
  interactionCount++;

  if (interactionCount >= SHOW_AD_EVERY) {
    interactionCount = 0;
    interstitialAd.showAd();
  }
}
