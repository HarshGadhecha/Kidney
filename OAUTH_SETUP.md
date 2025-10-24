# OAuth Setup Guide

This guide explains how to configure Google and Apple OAuth authentication for the Kidney Care app.

## Current Implementation

The app now includes OAuth login buttons on:
- **Welcome Page**: "Login with Google" and "Login with Apple" buttons
- **Login Page**: OAuth buttons alongside traditional email/password login

## What's Required

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - **iOS Client ID**: For iOS app
   - **Android Client ID**: For Android app
   - **Web Client ID**: For web/expo development

5. Update the client IDs in `services/auth/authService.ts`:
```typescript
const GOOGLE_CLIENT_ID = Platform.select({
  ios: 'YOUR_GOOGLE_IOS_CLIENT_ID',
  android: 'YOUR_GOOGLE_ANDROID_CLIENT_ID',
  default: 'YOUR_GOOGLE_WEB_CLIENT_ID',
});
```

6. Add authorized redirect URIs:
   - For development: `exp://localhost:8081/--/auth/callback`
   - For production: Your app's custom scheme (e.g., `kidney://auth/callback`)

### 2. Apple Sign-In Setup

1. Install the required package:
```bash
npx expo install expo-apple-authentication
```

2. Configure Apple Developer Account:
   - Go to [Apple Developer](https://developer.apple.com/)
   - Add "Sign in with Apple" capability to your app identifier
   - Create a Service ID for your app

3. Update `app.json` to include Apple Sign-In capability:
```json
{
  "expo": {
    "ios": {
      "usesAppleSignIn": true
    }
  }
}
```

4. Uncomment the Apple Sign-In implementation in `services/auth/authService.ts`

### 3. Configure App Redirect URI

The app is configured with the custom scheme `kidney://`. Update `app.json` if you need a different scheme:

```json
{
  "expo": {
    "scheme": "kidney"
  }
}
```

## Testing OAuth

1. **Development**: OAuth requires testing on physical devices or proper simulators
2. **Google**: Can be tested in Expo Go during development
3. **Apple**: Requires building the app with EAS or running on an actual device

## Current Status

The OAuth buttons and functionality are implemented but require configuration:
- Google OAuth: Needs client IDs to be configured
- Apple OAuth: Needs `expo-apple-authentication` package and developer account setup

## How It Works

1. User clicks OAuth button
2. OAuth provider authenticates the user
3. App receives user info (email, name, provider ID)
4. If user exists in database: Log them in
5. If user doesn't exist: Create new account automatically
6. User is redirected to the main app

## Security Notes

- OAuth credentials are stored securely using expo-secure-store
- No passwords are stored for OAuth users
- Provider ID is used as password hash identifier
