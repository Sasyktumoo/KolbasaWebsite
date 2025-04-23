import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { onAuthStateChanged, User } from 'firebase/auth';

import { FIREBASE_AUTH } from './FirebaseConfig';
import Login from './src/screens/Registration/Login';
import Register from './src/screens/Registration/Register';
import AppNavigator, { getLinkingConfig } from './src/navigation/AppNavigator';
import { UserProvider } from './src/context/UserContext';

// Define Auth Stack param list
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

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

  // Redirect to /en/product_catalog on first load
  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        const currentUrl = window.location.pathname;
        if (currentUrl === '/' || currentUrl === '') {
          console.log('Redirecting to /en/product_catalog');
          window.history.replaceState({}, '', '/en/product_catalog');
        }
      } catch (e) {
        console.error('Navigation error:', e);
      }
    }
  }, []);

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
      <UserProvider value={{ user, setUser }}>
        <NavigationContainer 
          linking={linking}
          fallback={<Text>Loading Navigation...</Text>}
          documentTitle={{
            formatter: (options, route) => {
              if (!route) return 'Магазин Колбасы - Meat Products';
              
              if (route.name === 'Main') {
                // Let the main navigator handle title formatting
                return 'Магазин Колбасы';
              }
              
              // Auth screens
              if (route.name === 'Login') return 'Sign In - Магазин Колбасы';
              if (route.name === 'Register') return 'Create Account - Магазин Колбасы';
              
              return 'Магазин Колбасы - Meat Products';
            }
          }}
        >
          <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
            {user ? (
              // User is signed in, show main app
              <Stack.Screen name="Main" component={AppNavigator} />
            ) : (
              // No user, show authentication screens
              <>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
              </>
            )}
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </UserProvider>
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
