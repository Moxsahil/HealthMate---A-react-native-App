# 🚀 HealthMate - Complete Setup Guide

This guide will help you get the HealthMate application up and running on your local machine in just a few minutes.

## 📋 Prerequisites

Before starting, ensure you have the following installed on your system:

### Required Software
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)

### Development Environment
- **Expo CLI** (we'll install this)
- **Code Editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)

### For Mobile Testing
Choose at least one option:

**Option 1: iOS Simulator (macOS only)**
- Xcode from App Store
- iOS Simulator (included with Xcode)

**Option 2: Android Emulator (All platforms)**
- Android Studio - [Download here](https://developer.android.com/studio)
- Android Virtual Device (AVD)

**Option 3: Physical Device**
- Expo Go app from App Store/Play Store
- Your smartphone/tablet

**Option 4: Web Browser**
- Any modern browser (Chrome, Firefox, Safari)

---

## 🛠️ Step-by-Step Installation

### Step 1: Verify Node.js Installation

Open your terminal/command prompt and run:

```bash
node --version
npm --version
```

You should see version numbers. If not, install Node.js from the link above.

### Step 2: Install Expo CLI

```bash
npm install -g @expo/cli
```

Verify installation:
```bash
expo --version
```

### Step 3: Navigate to Project Directory

```bash
cd HealthMate
```

### Step 4: Install Project Dependencies

```bash
npm install
```

This will install all required packages. Wait for completion (may take 2-5 minutes).

### Step 5: Set Up Mobile Development Environment

#### For iOS (macOS only):
1. Install Xcode from App Store
2. Open Xcode → Preferences → Components → Install iOS Simulator
3. Accept license: `sudo xcodebuild -license accept`

#### For Android:
1. Install Android Studio
2. Open Android Studio
3. Go to Tools → AVD Manager
4. Click "Create Virtual Device"
5. Choose a device (e.g., Pixel 4)
6. Select system image (API 30+ recommended)
7. Finish setup and start emulator

---

## 🔧 Environment Variables Setup

### Firebase Configuration (Optional but Recommended)

The app currently works with mock authentication, but for real Firebase integration:

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Enable Authentication → Sign-in method → Email/Password

2. **Get Firebase Config:**
   - Project Settings → General → Your apps
   - Click "Web app" icon → Register app
   - Copy the configuration object

3. **Update Firebase Config:**
   Open `src/services/AuthService.ts` and replace:
   ```typescript
   const firebaseConfig = {
     apiKey: "your-actual-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef123456"
   };
   ```

### Environment File Setup (Optional)

Create a `.env` file in the project root for environment variables:

```bash
# .env file (create this in HealthMate/ root directory)

# Firebase Configuration (Optional - for production)
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# App Configuration
EXPO_PUBLIC_APP_NAME=HealthMate
EXPO_PUBLIC_APP_VERSION=1.0.0

# Development Settings
EXPO_PUBLIC_DEV_MODE=true
EXPO_PUBLIC_DEBUG_MODE=true
```

**Note:** The app works perfectly without these environment variables. They're only needed for production Firebase integration.

---

## 🚀 Starting the Application

### Method 1: Interactive Start (Recommended)

```bash
npm start
```

This opens the Expo Dev Tools with options:
- Press `a` - Open Android emulator
- Press `i` - Open iOS simulator (macOS only)
- Press `w` - Open in web browser
- Press `r` - Reload app
- Press `m` - Show menu
- Scan QR code with phone camera (iOS) or Expo Go app

### Method 2: Direct Platform Commands

```bash
# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

### Method 3: Physical Device

1. Install **Expo Go** app:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Run `npm start`
3. Scan QR code with device camera (iOS) or Expo Go app

---

## ✅ Verification Steps

After starting the app, verify everything works:

### 1. App Launch Test
- ✅ App opens to Welcome screen
- ✅ No error messages in terminal
- ✅ Metro bundler shows "Bundle loaded"

### 2. Navigation Test
- ✅ Tap "Get Started" → Registration screen loads
- ✅ Tap "Sign In" → Login screen loads
- ✅ Complete registration → Dashboard appears
- ✅ All 6 bottom tabs are accessible

### 3. Feature Test
- ✅ **Dashboard**: Health metrics display
- ✅ **Activity**: Progress bars show mock data
- ✅ **Nutrition**: Water glasses are interactive
- ✅ **Profile**: Dark mode toggle works
- ✅ **Sleep/Workouts**: Placeholder screens load

### 4. Theme Test
- ✅ Profile → Toggle dark mode
- ✅ UI switches between light/dark themes
- ✅ Setting persists after app restart

---

## 🔥 Troubleshooting

### Common Issues & Solutions

#### "Metro bundler can't listen on port 8081"
```bash
# Kill processes on port 8081
npx kill-port 8081
# Or restart computer
```

#### "expo command not found"
```bash
# Reinstall Expo CLI
npm uninstall -g @expo/cli
npm install -g @expo/cli
```

#### "Module not found" errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start --clear
```

#### Android emulator not detected
```bash
# Start emulator manually first
# Then run npm start and press 'a'
```

#### iOS simulator issues (macOS)
```bash
# Reset iOS Simulator
xcrun simctl erase all
```

#### Package compatibility warnings
```bash
# Update packages (already fixed in current setup)
npm install @react-native-community/datetimepicker@8.4.4
npm install react-native-svg@15.12.1
```

#### App crashes on startup
```bash
# Clear Expo cache
expo start --clear
# Or restart development server
expo start --tunnel
```

---

## 🧪 Testing Different Features

### Authentication Flow
1. Launch app → Welcome screen
2. "Get Started" → Registration form
3. Fill details → Account created
4. Dashboard loads with mock data

### Core Features
- **Dashboard**: View daily health summary
- **Activity**: Monitor steps, calories, distance
- **Nutrition**: Track water intake, view meals
- **Sleep**: Sleep tracking interface
- **Workouts**: Exercise logging interface
- **Profile**: Settings and theme toggle

---

## 🎯 What's Working vs. Mock Data

### ✅ Fully Functional
- Complete UI/UX with themes
- Navigation and user flows
- State management (Redux)
- Local storage (AsyncStorage)
- Authentication UI (mock backend)
- Notifications framework
- Charts and analytics UI

### 📊 Mock Data Currently
- Health metrics (steps, heart rate, etc.)
- Sleep and workout data
- User authentication
- Device sensor integration

---

## 📱 Development Commands

```bash
# Start development server
npm start

# Clear cache and start
npm start --clear

# Platform-specific starts
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser

# Code quality
npx tsc --noEmit  # TypeScript check

# Production build
expo build        # Build for app stores
```

---

## 🎉 Success! You're Ready

If you can see the HealthMate welcome screen and navigate through the app, you're all set! The app is fully functional with:

- ✅ Modern UI with dark/light themes
- ✅ Complete navigation system
- ✅ Health tracking interfaces
- ✅ State management
- ✅ Mock data for testing
- ✅ Professional code architecture

---

## 🆘 Need Help?

If you encounter any issues:

1. **Check Prerequisites**: Ensure Node.js and Expo CLI are installed
2. **Verify Location**: Make sure you're in the `HealthMate/` directory
3. **Clear Cache**: Try `npm start --clear`
4. **Check Terminal**: Look for error messages in the console
5. **Restart**: Sometimes `expo start` → stop → `expo start` helps

**The app is working correctly when:**
- Metro bundler starts without errors
- App loads on your chosen platform
- You can navigate between all tabs
- Theme toggle works in Profile section
- Mock health data displays properly

Enjoy exploring your new HealthMate application! 🎊💪🏃‍♀️🥗😴