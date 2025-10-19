# Troubleshooting Guide

## Common Issues and Solutions

### 1. Port Already in Use
**Error**: `Port 8081 is running this app in another window`

**Solution**:
```bash
# Kill existing processes
pkill -f "expo start"
pkill -f "metro"

# Start on different port
npx expo start --port 8083
```

### 2. Package Version Mismatch
**Error**: `react-native-screens@4.17.1 - expected version: ~4.16.0`

**Solution**:
```bash
npm install react-native-screens@~4.16.0
```

### 3. Metro Bundler Issues
**Error**: Metro bundler not starting or timing out

**Solution**:
```bash
# Clear cache and restart
npx expo start --clear

# Or reset Metro cache
npx expo start --reset-cache
```

### 4. iOS Simulator Issues
**Error**: `Unable to run simctl: Error: xcrun simctl help exited with non-zero code: 69`

**Solution**:
- This is normal if you don't have Xcode installed
- Use Expo Go on your physical iPhone instead
- Scan the QR code to test the app

### 5. Supabase Connection Issues
**Error**: "Supabase Not Configured" alert

**Solution**:
1. Run the setup script: `node setup-supabase.js`
2. Or manually create `config.ts` with your credentials
3. Set up your Supabase database using `supabase-setup.sql`

### 6. App Not Loading in Expo Go
**Symptoms**: App shows loading screen or crashes

**Solutions**:
1. **Check your internet connection**
2. **Restart Expo Go app**
3. **Clear Expo Go cache** (Settings → Clear Cache)
4. **Try different network** (switch WiFi/cellular)

### 7. TypeScript Errors
**Error**: Red squiggly lines in IDE

**Solutions**:
1. **Restart your IDE/editor**
2. **Run**: `npx tsc --noEmit` to check for errors
3. **Clear TypeScript cache**: Delete `node_modules/.cache`

### 8. Navigation Issues
**Error**: "Cannot find module" for screen imports

**Solution**:
- Check that all screen files exist in `app/tabs/`
- Verify import paths in `App.tsx`
- Restart the development server

## Quick Fixes

### Reset Everything
```bash
# Stop all processes
pkill -f "expo start"
pkill -f "metro"

# Clear caches
rm -rf node_modules/.cache
rm -rf .expo

# Reinstall dependencies
rm -rf node_modules
npm install

# Start fresh
npx expo start --clear
```

### Check App Status
```bash
# Check if app is running
curl -s http://localhost:8081 > /dev/null && echo "✅ App running" || echo "❌ App not running"

# Check for errors
npx expo-doctor
```

## Getting Help

1. **Check the logs** in your terminal for specific error messages
2. **Try the quick fixes** above
3. **Restart everything** (app, development server, Expo Go)
4. **Check your network connection**
5. **Update Expo Go** to the latest version

## Still Having Issues?

If none of the above solutions work:
1. Share the specific error message you're seeing
2. Check if you have the latest version of Expo Go
3. Try running on a different device/network
4. Check the Expo documentation for your specific error
