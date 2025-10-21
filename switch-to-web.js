#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the original web config (backup)
const webConfig = {
  "expo": {
    "name": "betly",
    "slug": "betly",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
};

// Write the web config
fs.writeFileSync('./app.json', JSON.stringify(webConfig, null, 2));

console.log('✅ Switched to web/Expo development configuration');
console.log('🌐 App name: betly');
console.log('🔧 Ready for web development');
