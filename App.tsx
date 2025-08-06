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
import AppNavigator, { 
  getLinkingConfig, 
  navigationRef, // Import the navigation reference
  RootStackParamList as AppNavigatorParamList 
} from './src/navigation/AppNavigator';
import { UserProvider } from './src/context/UserContext';
import { LanguageProvider } from './src/context/languages/LanguageContext'; 
import { useLanguage } from './src/context/languages/useLanguage';
import { CartProvider } from './src/context/cart/CartContext';
import { AlertProvider } from './src/context/AlertContext';
import Header from './src/components/Header/Header'; // Import the Header component

// Extend the RootStackParamList to include 'Main'
type RootStackParamList = AppNavigatorParamList & {
  KolbasaWebsite: { initialRoute?: string } | undefined;
};

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

// Create a component that wraps the navigation container to use the translation hook
const AppContent = () => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  
  // Get the linking configuration from AppNavigator
  const linking = getLinkingConfig();

  // Add this effect to handle page refreshes
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (nav?.type === 'reload') {
      window.location.replace('https://desyatka.com');
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

  // Get translated store name
  const storeName = t('header.storeName');

  return (
    <UserProvider value={{ user, setUser }}>
      <View style={{ 
        flex: 1, 
        height: '100%', 
        backgroundColor: '#fff'
      }}>
        <NavigationContainer 
          ref={navigationRef} // Use the navigation reference
          linking={linking}
          fallback={<Text>Loading Navigation...</Text>}
          documentTitle={{
            formatter: (options, route) => {
              if (!route) return `${storeName} - Meat Products`;
              
              if (route.name === 'KolbasaWebsite') {
                return storeName;
              }
              
              // Auth screens
              if (route.name === 'Login') return `Sign In - ${storeName}`;
              if (route.name === 'Register') return `Create Account - ${storeName}`;
              
              return `${storeName} - Meat Products`;
            }
          }}
          theme={{
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
          {/* Header placed here once at the app level */}
          <Header />
          
          <Stack.Navigator 
            id={undefined} 
            screenOptions={{ 
              headerShown: false,
              cardStyle: { 
                flex: 1,
                paddingHorizontal: Dimensions.get('window').width > 768 ? Dimensions.get('window').width * 0.2 : 0,
                backgroundColor: '#fff',
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
  );
}

// Main App component to set up providers
export default function App() {
  return (
    <ErrorBoundary>
      <AlertProvider>
        <LanguageProvider>
          <CartProvider>
            <AppContent />
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
