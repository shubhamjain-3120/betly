# Debug Steps for App Issues

## Step 1: Test Simple App
I've created a simple test version. Try this:

1. **Open Expo Go** on your iPhone
2. **Scan the QR code** from the terminal
3. **You should see**: "🎯 Bet Platform - Ready to start betting!"

If this works, the basic setup is correct.

## Step 2: Restore Full App
If the simple version works, restore the full app:

```bash
# Restore the full app
cp App-full.tsx App.tsx

# Restart the server
npx expo start --clear
```

## Step 3: Alternative Testing Methods

### Method A: Web Version
```bash
npx expo start --web
```
Then open http://localhost:19006 in your browser

### Method B: Tunnel Mode
```bash
npx expo start --tunnel
```
This creates a public URL that works better with mobile

### Method C: Local Network
```bash
npx expo start --lan
```
Make sure your phone and computer are on the same WiFi

## Step 4: Common Issues & Solutions

### Issue: "Request timed out"
**Solutions**:
1. Try tunnel mode: `npx expo start --tunnel`
2. Check your network connection
3. Restart Expo Go app
4. Try a different network

### Issue: "Unable to connect"
**Solutions**:
1. Make sure both devices are on same WiFi
2. Try tunnel mode for public URL
3. Check firewall settings
4. Restart router if needed

### Issue: App crashes on load
**Solutions**:
1. Check the simple version first
2. Look for JavaScript errors in terminal
3. Clear Expo Go cache
4. Update Expo Go to latest version

## Step 5: Network Troubleshooting

### Check if server is running:
```bash
curl -s http://localhost:8081 > /dev/null && echo "✅ Server running" || echo "❌ Server not running"
```

### Check network connectivity:
```bash
ping google.com
```

### Check if port is accessible:
```bash
lsof -i :8081
```

## Step 6: Reset Everything

If nothing works, try a complete reset:

```bash
# Stop everything
pkill -f expo
pkill -f metro

# Clear all caches
rm -rf node_modules/.cache
rm -rf .expo
rm -rf .metro

# Reinstall
rm -rf node_modules
npm install

# Start fresh
npx expo start --clear --tunnel
```

## What to Try Next

1. **Test simple app first** - Make sure basic setup works
2. **Try tunnel mode** - Often works better for mobile
3. **Check network** - Both devices on same WiFi
4. **Update Expo Go** - Make sure you have latest version
5. **Try different network** - Sometimes corporate WiFi blocks connections

## Still Having Issues?

Share the specific error message you're seeing, and I'll help you troubleshoot further!
