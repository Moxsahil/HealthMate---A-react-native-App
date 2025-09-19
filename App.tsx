import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider, useDispatch } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { store } from './src/store/store';
import { ThemeProvider } from './src/store/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { useTheme } from './src/hooks/useTheme';
import AuthService from './src/services/AuthService';
import { loginSuccess } from './src/store/slices/authSlice';

const ThemedApp: React.FC = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();

  useEffect(() => {
    // Set up Firebase auth state listener for persistent authentication
    const unsubscribe = AuthService.onAuthStateChange((user) => {
      if (user) {
        dispatch(loginSuccess({
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        }));
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [dispatch]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PaperProvider>
            <ThemedApp />
          </PaperProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </Provider>
  );
}
