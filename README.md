# HealthMate - Complete Health & Fitness Tracker

HealthMate is a modern, full-featured health and fitness tracking mobile application built with React Native and Expo. It provides comprehensive health monitoring, nutrition tracking, sleep analysis, and workout logging capabilities with a beautiful, responsive UI that supports both light and dark themes.

## 🚀 Features

### ✅ Core Features Implemented

- **User Authentication**
  - Email/password registration and login
  - Firebase authentication integration
  - Social login placeholders (Google, Apple)
  - Password reset functionality
  - Secure token storage

- **Dashboard & Overview**
  - Daily health metrics summary
  - Progress tracking with visual indicators
  - Quick action buttons
  - Weekly summary statistics

- **Activity Tracking**
  - Steps counter with daily goals
  - Distance tracking
  - Calories burned calculation
  - Active minutes monitoring
  - Heart rate tracking (placeholder for device integration)

- **Nutrition & Hydration**
  - Meal logging with macronutrient breakdown
  - Food database integration (extensible)
  - Water intake tracking with visual progress
  - Customizable nutrition goals
  - Calorie counting and macro tracking

- **Sleep Monitoring**
  - Sleep session logging
  - Sleep quality rating (1-5 scale)
  - Duration tracking
  - Sleep goal setting and monitoring

- **Workout Management**
  - Exercise database
  - Workout session logging
  - Set and rep tracking
  - Timer functionality
  - Workout history

- **Progress Analytics**
  - Interactive charts and graphs
  - Progress rings and visual indicators
  - Weekly and monthly trends
  - Performance comparisons

- **Smart Notifications**
  - Water intake reminders
  - Sleep time notifications
  - Workout reminders
  - Meal logging prompts
  - Achievement notifications

- **Profile & Settings**
  - User profile management
  - Dark/light theme toggle
  - Goal customization
  - Data export capabilities
  - Notification preferences

### 🎨 Design & UI

- Modern, minimalist card-based design
- Smooth animations and transitions
- Responsive layout for all screen sizes
- Accessibility-friendly components
- Material Design icons
- Consistent color scheme and typography

### 🔧 Technical Architecture

- **Frontend**: React Native with Expo SDK 51+
- **Language**: TypeScript for type safety
- **Navigation**: React Navigation v6
- **State Management**: Redux Toolkit
- **Local Storage**: AsyncStorage + SQLite
- **Authentication**: Firebase Auth
- **Notifications**: Expo Notifications
- **Charts**: Victory Native
- **UI Components**: React Native Paper + Custom components
- **Animations**: React Native Reanimated 3

## 📦 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (macOS) or Android Emulator

### Getting Started

1. **Clone and Install**
   ```bash
   cd HealthMate
   npm install
   ```

2. **Configure Firebase (Optional)**
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Authentication with Email/Password
   - Copy your Firebase config to `src/services/AuthService.ts`
   - Replace the placeholder config with your actual Firebase credentials

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Run on Device/Simulator**
   - iOS: `npm run ios`
   - Android: `npm run android`
   - Web: `npm run web`

### Development Commands

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run web

# Type check
npx tsc --noEmit

# Build for production
expo build
```

## 🏗️ Project Structure

```
HealthMate/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Charts/
│   │       ├── LineChart.tsx
│   │       └── ProgressRing.tsx
│   ├── constants/           # App constants and themes
│   │   └── Colors.ts
│   ├── hooks/              # Custom React hooks
│   │   └── useTheme.ts
│   ├── navigation/         # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainTabNavigator.tsx
│   ├── screens/            # Screen components
│   │   ├── auth/           # Authentication screens
│   │   └── main/           # Main app screens
│   ├── services/           # External services
│   │   ├── AuthService.ts
│   │   ├── NotificationService.ts
│   │   └── StorageService.ts
│   ├── store/              # Redux store and slices
│   │   ├── slices/
│   │   ├── store.ts
│   │   └── ThemeContext.tsx
│   └── types/              # TypeScript type definitions
│       └── navigation.ts
├── assets/                 # Static assets
├── App.tsx                 # Root component
└── package.json
```

## 🔮 Future Enhancements

The following features are planned for future releases:

- **Device Integration**
  - Google Fit / Apple Health API integration
  - Wearable device support (Fitbit, Garmin, Apple Watch)
  - Bluetooth heart rate monitor support

- **Advanced Analytics**
  - AI-powered health insights
  - Trend analysis and predictions
  - Personalized recommendations

- **Social Features**
  - Friends and challenges
  - Leaderboards and competitions
  - Social sharing capabilities

- **Enhanced Nutrition**
  - Barcode scanning for foods
  - Recipe calculator
  - Nutritionist recommendations

- **Premium Features**
  - Advanced sleep analysis
  - Personalized workout plans
  - Detailed health reports (PDF export)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📱 Screenshots

*(Screenshots would be added here showing the app in action)*

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React Native and Expo teams for the excellent development platform
- Victory team for the charting library
- Material Design for the icon set
- Firebase for authentication services

## 📞 Support

For support, email support@healthmate.app or open an issue in the GitHub repository.

---

**HealthMate** - Your personal health companion 💪🏃‍♀️🥗😴