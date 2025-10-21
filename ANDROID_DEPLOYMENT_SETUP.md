# Android Deployment Setup Instructions

This guide will help you deploy "Couple of Wagers" to the Google Play Store using the separate Android configurations.

## Prerequisites

- Google Play Developer account ($25 one-time fee)
- EAS CLI installed globally
- Expo account
- Supabase project ready for production

## Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

## Step 2: Login to EAS

```bash
eas login
```

## Step 3: Configure EAS Project

```bash
eas build:configure
```

This will create the `eas.json` file (already created for you).

## Step 4: Update Project ID

1. Open `eas.json`
2. Replace `"your-project-id-here"` with your actual Expo project ID
3. You can get your project ID from the Expo dashboard

## Step 5: Set Up Environment Variables

### For Development Builds
```bash
eas secret:create --scope project --name SUPABASE_URL --value "https://rxoxblihuxcssdfcepat.supabase.co"
eas secret:create --scope project --name SUPABASE_ANON_KEY --value "your-anon-key"
```

### For Production Builds
```bash
eas secret:create --scope project --name SUPABASE_URL_PROD --value "your-production-supabase-url"
eas secret:create --scope project --name SUPABASE_ANON_KEY_PROD --value "your-production-anon-key"
```

## Step 6: Create Your First Build

### Development Build (Testing)
```bash
npm run android:dev
```

This creates an APK for testing on your device.

### Preview Build (Internal Testing)
```bash
npm run android:preview
```

This creates an APK for internal testing with your team.

### Production Build (Play Store)
```bash
npm run android:production
```

This automatically:
1. Switches to Android production config
2. Creates an AAB (Android App Bundle) for Play Store submission  
3. Switches back to web development config

## Step 7: Test Your Builds

1. **Download the APK** from the EAS build dashboard
2. **Install on Android device** for testing
3. **Test all features**:
   - User authentication
   - Bet creation and approval
   - Real-time updates
   - Leaderboard functionality

## Step 8: Prepare Play Store Assets

Follow the `PLAY_STORE_ASSETS_GUIDE.md` to create:
- App icons (512x512px and adaptive icons)
- Feature graphic (1024x500px)
- Screenshots (2-8 images)
- App descriptions
- Privacy policy

## Step 9: Submit to Google Play Store

### 9.1 Create New App in Play Console
1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in app details:
   - App name: "Couple of Wagers"
   - Default language: English
   - App or game: App
   - Free or paid: Free

### 9.2 Complete Store Listing
1. **App details**:
   - Short description (80 chars)
   - Full description (4000 chars)
   - App category: Social
   - Content rating: Complete questionnaire

2. **Graphics**:
   - Upload app icon
   - Upload feature graphic
   - Upload screenshots
   - Upload adaptive icon

3. **Privacy Policy**:
   - Upload your privacy policy
   - Or provide URL to hosted policy

### 9.3 Upload App Bundle
1. Go to "Release" → "Production"
2. Click "Create new release"
3. Upload the AAB file from EAS build
4. Add release notes
5. Review and roll out

## Step 10: Monitor and Update

### Track Performance
- Monitor app installs and ratings
- Check crash reports
- Review user feedback

### Update Process
1. Make code changes
2. Update version in `app.android.production.json`
3. Run `npm run android:production`
4. Upload new AAB to Play Console
5. Submit for review

## Troubleshooting

### Common Issues

1. **Build Fails**: Check EAS build logs for specific errors
2. **App Crashes**: Test on physical device, check console logs
3. **Supabase Connection**: Verify environment variables are set correctly
4. **Play Store Rejection**: Address feedback and resubmit

### Getting Help

- **EAS Documentation**: https://docs.expo.dev/build/introduction/
- **Play Console Help**: https://support.google.com/googleplay/android-developer
- **Expo Discord**: https://discord.gg/expo

## File Structure Summary

Your project now has these Android-specific files:
- `app.android.json` - Android dev config
- `app.android.production.json` - Android production config
- `eas.json` - EAS build configuration
- `env.android.dev` - Android dev environment variables
- `env.android.production` - Android production environment variables
- `privacy-policy.md` - Privacy policy for Play Store
- `PLAY_STORE_ASSETS_GUIDE.md` - Asset creation guide

## Next Steps

1. **Test thoroughly** with development builds
2. **Create all required assets** for Play Store
3. **Set up production Supabase** (if using separate instance)
4. **Submit to Play Store** and wait for review
5. **Monitor and iterate** based on user feedback

Your existing web/Expo development setup remains completely unchanged!
