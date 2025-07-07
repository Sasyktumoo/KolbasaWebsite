import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { onAuthStateChanged, User } from 'firebase/auth';

import { FIREBASE_AUTH } from './FirebaseConfig';
import Login from './src/screens/Registration/Login';
import Register from './src/screens/Registration/Register';
import AppNavigator, { getLinkingConfig, RootStackParamList as AppNavigatorParamList } from './src/navigation/AppNavigator';
import { UserProvider } from './src/context/UserContext';
import { LanguageProvider } from './src/context/languages/LanguageContext'; // Add this import
import { CartProvider } from './src/context/cart/CartContext'; // Add this import
import { AlertProvider } from './src/context/AlertContext'; // Add this import

// Extend the RootStackParamList to include 'Main'
type RootStackParamList = AppNavigatorParamList & {
  KolbasaWebsite: { initialRoute?: string } | undefined;
};

// const Stack = createStackNavigator<AuthStackParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Error boundary component
type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log("App Error:", error);
    console.log("Error Info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorDetail}>{this.state.error?.toString()}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  // Get the linking configuration from AppNavigator
  const linking = getLinkingConfig();

  useEffect(() => {
    try {
      console.log("App initializing, setting up auth listener");
      const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
        console.log('Auth state changed:', user ? 'User logged in' : 'No user');
        setUser(user);
        if (initializing) setInitializing(false);
      }, (error) => {
        console.error("Auth error:", error);
        setError(error.message);
        setInitializing(false);
      });

      return unsubscribe;
    } catch (err: any) {
      console.error("Setup error:", err);
      setError(err.message);
      setInitializing(false);
      return () => {};
    }
  }, [initializing]);

  if (initializing) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error initializing app:</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <AlertProvider>
        <LanguageProvider>
          <CartProvider>
            <UserProvider value={{ user, setUser }}>
              <View style={{ 
                flex: 1, 
                height: '100%', 
                backgroundColor: '#fff' // Add white background to container
              }}>
                <NavigationContainer 
                  linking={linking}
                  fallback={<Text>Loading Navigation...</Text>}
                  documentTitle={{
                    formatter: (options, route) => {
                      if (!route) return 'Магазин Колбасы - Meat Products';
                      
                      if (route.name === 'KolbasaWebsite') {
                        // Let the main navigator handle title formatting
                        return 'Магазин Колбасы';
                      }
                      
                      // Auth screens
                      if (route.name === 'Login') return 'Sign In - Магазин Колбасы';
                      if (route.name === 'Register') return 'Create Account - Магазин Колбасы';
                      
                      return 'Магазин Колбасы - Meat Products';
                    }
                  }}
                  theme={{
                    // Add theme with white background
                    colors: {
                      background: '#fff',
                      primary: '#FF3B30',
                      card: '#fff',
                      text: '#333',
                      border: '#e0e0e0',
                      notification: '#FF3B30',
                    },
                    dark: false,
                    fonts: {
                      regular: {
                        fontFamily: 'System',
                        fontWeight: 'normal',
                      },
                      medium: {
                        fontFamily: 'System',
                        fontWeight: '500',
                      },
                      bold: {
                        fontFamily: 'System',
                        fontWeight: 'bold',
                      },
                      heavy: {
                        fontFamily: 'System',
                        fontWeight: '900',
                      },
                    },
                  }}
                >
                  <Stack.Navigator 
                    id={undefined} 
                    screenOptions={{ 
                      headerShown: false,
                      cardStyle: { 
                        flex: 1,
                        paddingHorizontal: Dimensions.get('window').width * 0.2,
                        backgroundColor: '#fff', // Explicitly set background color
                      } 
                    }}
                  >
                    <Stack.Screen 
                      name="KolbasaWebsite"
                      component={AppNavigator} 
                      initialParams={user ? undefined : { initialRoute: 'Login' }}
                    />
                  </Stack.Navigator>
                  <StatusBar style="auto" />
                </NavigationContainer>
              </View>
            </UserProvider>
          </CartProvider>
        </LanguageProvider>
      </AlertProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  errorDetail: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  }
});
