#!/bin/bash
cd /Users/shubhamjain/exploring/bet-platform

# Configure EAS project
echo "y" | eas init

# Build production APK
npm run android:production
