# 🔧 Environment Variables & Configuration Setup

This document explains all environment variables and configuration options for the HealthMate application.

## 🚨 **Important: App Works Without Environment Variables!**

**The HealthMate app is fully functional without any environment setup.** All environment variables are optional and only needed for:
- Production Firebase authentication
- External API integrations
- Advanced features

## 📁 **Configuration Files**

### Current Configuration Files:
- `app.json` - Expo/React Native app configuration ✅ **Already configured**
- `package.json` - Node.js dependencies ✅ **Already configured**
- `tsconfig.json` - TypeScript configuration ✅ **Already configured**
- `.env.example` - Environment variables template ✅ **Just created**

### Optional Files (Create only if needed):
- `.env` - Your actual environment variables (copy from `.env.example`)
- `firebase.json` - Firebase configuration (if using Firebase hosting)

---

## 🔑 **Environment Variables Setup**

### Step 1: Copy Example File (Optional)

```bash
# Copy the example file to create your .env file
cp .env.example .env
```

### Step 2: Current Status - What's Needed

| Feature | Status | Environment Setup Required |
|---------|--------|---------------------------|
| **App Launch** | ✅ Ready | None - works immediately |
| **Navigation** | ✅ Ready | None |
| **UI/Themes** | ✅ Ready | None |
| **Mock Auth** | ✅ Ready | None |
| **Health UI** | ✅ Ready | None |
| **Real Firebase** | 🟡 Optional | Firebase config needed |
| **Device APIs** | 🔴 Future | Google Fit/Apple Health setup |
| **Push Notifications** | 🟡 Optional | Notification service config |

---

## 🔥 **Firebase Setup (Optional)**

### When to set up Firebase:
- You want real user authentication (not mock)
- You want to store user data in the cloud
- You want real-time data sync

### Firebase Configuration Steps:

1. **Create Firebase Project:**
   ```
   1. Go to https://console.firebase.google.com/
   2. Click "Create a project"
   3. Enter project name: "HealthMate"
   4. Enable Google Analytics (optional)
   ```

2. **Enable Authentication:**
   ```
   1. Firebase Console → Authentication
   2. Get started → Sign-in method
   3. Enable "Email/Password"
   4. Save
   ```

3. **Get Configuration:**
   ```
   1. Project Settings (gear icon)
   2. General tab → Your apps
   3. Click "</>" (Web app)
   4. Register app: "HealthMate"
   5. Copy the config object
   ```

4. **Update Environment File:**
   ```bash
   # In your .env file:
   EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=healthmate-abc123.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=healthmate-abc123
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=healthmate-abc123.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```

5. **Update AuthService.ts:**
   ```typescript
   // Replace the config in src/services/AuthService.ts
   const firebaseConfig = {
     apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
     authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
     projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
     // ... etc
   };
   ```

---

## 📱 **App Configuration Explained**

### app.json Configuration
```json
{
  "expo": {
    "name": "HealthMate",              ✅ App name
    "slug": "healthmate",              ✅ URL slug
    "version": "1.0.0",               ✅ App version
    "platforms": ["ios", "android"],  ✅ Target platforms
    "icons": {...},                   ✅ App icons
    "splash": {...},                  ✅ Splash screen
    "permissions": [...]              ✅ App permissions
  }
}
```

### package.json Dependencies
```json
{
  "dependencies": {
    "expo": "~54.0.7",                    ✅ Expo framework
    "@react-navigation/native": "^7.1.17", ✅ Navigation
    "@reduxjs/toolkit": "^2.9.0",         ✅ State management
    "firebase": "^12.2.1",               ✅ Authentication
    "react-native-paper": "^5.14.5"      ✅ UI components
    // ... all other dependencies are configured
  }
}
```

---

## 🌍 **Environment Variables Explained**

### Required for Production (Optional for Development):

```bash
# Firebase Authentication
EXPO_PUBLIC_FIREBASE_API_KEY=         # Firebase API key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=     # Auth domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=      # Project ID
```

### Optional Feature Flags:
```bash
# Development vs Production
EXPO_PUBLIC_DEV_MODE=true             # Enable dev features
EXPO_PUBLIC_MOCK_DATA=true            # Use mock data
EXPO_PUBLIC_DEBUG_MODE=true           # Enable debug logs

# Future Features
EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH=true    # Fingerprint/Face ID
EXPO_PUBLIC_ENABLE_SOCIAL_LOGIN=true      # Google/Apple login
EXPO_PUBLIC_ENABLE_AI_INSIGHTS=false      # AI recommendations
```

### Future API Integrations:
```bash
# Google Fit Integration (Future)
EXPO_PUBLIC_GOOGLE_FIT_CLIENT_ID=     # Google OAuth client
EXPO_PUBLIC_GOOGLE_FIT_API_KEY=       # Google Fit API key

# External APIs (Future)
EXPO_PUBLIC_FOOD_API_KEY=             # Nutrition database API
EXPO_PUBLIC_API_BASE_URL=             # Backend API URL
```

---

## 🔐 **Security Notes**

### Environment Variable Rules:
- ✅ **EXPO_PUBLIC_*** variables are safe to use (exposed to client)
- ❌ **Never put sensitive secrets** in EXPO_PUBLIC_ variables
- ✅ Firebase config is safe to expose (it's client-side anyway)
- ❌ Don't commit `.env` file to git (already in .gitignore)

### What's Safe to Expose:
- Firebase API keys (they're client-side)
- App configuration settings
- Feature flags
- Public API endpoints

### Keep Secret (use backend for these):
- Database passwords
- Private API keys
- Server secrets
- Payment processor keys

---

## 🧪 **Testing Environment Setup**

### Current Working Setup (No .env needed):
```bash
cd HealthMate
npm install
npm start
# App works immediately with mock data!
```

### With Firebase (Optional):
```bash
cd HealthMate
cp .env.example .env
# Edit .env with your Firebase config
npm start
# App now uses real Firebase authentication
```

### Verify Environment:
```bash
# Check if environment variables are loaded
console.log(process.env.EXPO_PUBLIC_APP_NAME); // Should show "HealthMate"
```

---

## 🚀 **Deployment Environment**

### Development:
```bash
EXPO_PUBLIC_APP_ENVIRONMENT=development
EXPO_PUBLIC_DEV_MODE=true
EXPO_PUBLIC_MOCK_DATA=true
```

### Production:
```bash
EXPO_PUBLIC_APP_ENVIRONMENT=production
EXPO_PUBLIC_DEV_MODE=false
EXPO_PUBLIC_MOCK_DATA=false
# + Real Firebase config
```

---

## ❓ **FAQ**

**Q: Do I need to set up Firebase to use the app?**
A: No! The app works perfectly with mock authentication. Firebase is only needed for real user accounts.

**Q: What happens if I don't create a .env file?**
A: Nothing bad! The app uses default values and mock data. Everything works normally.

**Q: Can I use the app without internet?**
A: Yes! The app stores data locally and works offline. Internet is only needed for Firebase auth.

**Q: How do I know if my environment is set up correctly?**
A: If the app starts and you can navigate around, you're good! Check the Profile section for your configuration.

**Q: Where do I get Firebase API keys?**
A: Firebase Console → Project Settings → Web app → Config. It's free for small projects.

**Q: Is my Firebase config secure?**
A: Yes! Firebase client configs are meant to be public. Real security is handled on Firebase servers.

---

## ✅ **Quick Status Check**

### ✅ **What's Already Working:**
- App launches and runs
- All navigation works
- UI themes work perfectly
- Mock data displays correctly
- All components are functional
- TypeScript compilation passes
- No environment setup needed

### 🔄 **What Environment Adds:**
- Real user authentication (vs mock)
- Cloud data storage (vs local only)
- Push notifications
- External API integrations
- Production deployment readiness

---

## 🎯 **Recommendation**

**For trying the app:** No environment setup needed - just run `npm start`!

**For development:** Copy `.env.example` to `.env` and configure Firebase when you want real authentication.

**For production:** Set up all environment variables with real values before deploying to app stores.

Your HealthMate app is ready to go! 🎉