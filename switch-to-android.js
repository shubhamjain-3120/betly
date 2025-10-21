#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the Android production config
const androidConfig = JSON.parse(fs.readFileSync('./app.android.production.json', 'utf8'));

// Update the main app.json with Android production settings
const mainConfig = {
  ...androidConfig,
  // Keep some web-specific settings
  web: {
    favicon: "./assets/favicon.png"
  }
};

// Write the updated config
fs.writeFileSync('./app.json', JSON.stringify(mainConfig, null, 2));

console.log('✅ Switched to Android production configuration');
console.log('📱 App name: betly');
console.log('📦 Package: com.betly.app');
console.log('🔧 Ready for Android production build');
