import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Linking from 'expo-linking';
import { LinkingOptions, useNavigation, useRoute, NavigationProp } from '@react-navigation/native';

import ProductDetailPage from '../screens/ProductDetail/ProductDetailScreen';
import CategoryPage from '../screens/CategoryPage';
import HomePage from '../screens/HomePage';
// Import the new screens
import AboutUsScreen from '../screens/AboutUsScreen';
import OrderProductsScreen from '../screens/OrderProductsScreen';
import ProductDeliveryScreen from '../screens/ProductDeliveryScreen';
import OrderPaymentScreen from '../screens/OrderPaymentScreen';
import DummyScreen from '../screens/DummyScreen';
import Login from '../screens/Registration/Login';
import Register from '../screens/Registration/Register';
import ProfileScreen from '../screens/Profile/ProfileScreen'; // You'll need to create this file
import CartScreen from '../screens/Cart/CartScreen'; // Import CartScreen
import AddressBookScreen from '../screens/Profile/AddressBookScreen'; // Import AddressBookScreen
import { useUser } from '../context/UserContext';
import CheckoutFormScreen from '../screens/Cart/CheckoutFormScreen';
import OrderReviewScreen from '../screens/Cart/OrderReviewScreen';
import OrderHistory from '../screens/Profile/OrderHistory';

// Add this import


// Define your root stack param list and export it for reuse elsewhere
export type RootStackParamList = {
  Home: {
    locale: string;
    categoryId?: string;
    categoryPath?: string[];
    categoryName?: string;
  };
  CategoryPage: {
    searchQuery?: string;
    categoryId: string;
    categoryPath: string[];
    categoryName: string;
    locale: string;
  };
  ProductDetailPage: {
    product: any;
    breadcrumbPath: string[];
    locale: string;
    originalProduct: any;
  };
  // Add auth-related screens
  Login: undefined;
  Register: undefined;
  Profile: undefined;
  // Add the new screens to the param list
  AboutUs: undefined;
  OrderProducts: undefined;
  ProductDelivery: undefined;
  OrderPayment: undefined;

  Dummy: undefined;
  Cart: undefined; // Include Cart in the param list
  AddressBook: undefined; // Include AddressBook in the param list
  OrderHistory: undefined; // Include OrderHistory in the param list
  CheckoutForm: undefined;
  OrderReview: {
    customerInfo: {
      name: string;
      email: string;
      phone: string;
      message: string;
      address: any;
    }
  };
  ImageDownloader: undefined; // Add this line
};

// Export the linking configuration to use in App.tsx
export const getLinkingConfig = (): LinkingOptions<RootStackParamList> => ({
  prefixes: ['https://desyatka.site', 'http://desyatka.site'],
  config: {
    initialRouteName: 'Home',
    screens: {
      Home: {
        // Remove :locale? from path
        path: '',
        parse: {
          // Still parse locale internally but don't expose in URL
          locale: () => 'en'
        },
        stringify: {
          // Don't include locale in URL
          locale: () => ''
        }
      },
      CategoryPage: {
        // Remove :locale from path
        path: 'product_catalog/:categoryPath*',
        parse: {
          categoryId: (value: string) => {
            if (!value || value === '') return 'catalog';
            const segments = value.split('/');
            return segments[segments.length - 1];
          },
          categoryPath: (value: string) => {
            if (!value || value === '') return ['product_catalog'];
            return ['product_catalog', ...value.split('/')];
          },
          categoryName: (value: string) => {
            if (!value || value === '') return 'Product Catalog';
            const segments = value.split('/');
            const lastSegment = segments[segments.length - 1];
            return lastSegment
              .split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          },
          // Still handle locale internally
          locale: () => 'en'
        },
        stringify: {
          categoryPath: (path: string[]) => {
            if (path.length <= 1) return '';
            return path.slice(1).join('/');
          },
          // Don't include locale in URL
          locale: () => ''
        }
      },
      ProductDetailPage: {
        // Remove :locale from path
        path: 'products/:productId',
        parse: {
          product: (value: string) => {
            return {
              id: value,
              name: 'Product ' + value,
              description: 'Product description',
              price: 100,
              minOrder: 10,
              image: null
            };
          },
          breadcrumbPath: (value: string) => ['product_catalog', 'product'],
          // Still handle locale internally
          locale: () => 'en'
        },
        stringify: {
          productId: (product: any) => product.id,
          // Don't include locale in URL
          locale: () => ''
        }
      },
      // Other routes remain the same
      AboutUs: 'about-us',
      OrderProducts: 'order-products',
      ProductDelivery: 'product-delivery',
      OrderPayment: 'order-payment',
      Dummy: 'dummy',
      Cart: 'cart',
      AddressBook: 'address-book',
      OrderHistory: 'order-history',
      ImageDownloader: 'image-downloader',
    },
  },
});

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { user } = useUser();
  
  // Handle initialRoute param for authentication flow
  useEffect(() => {
    const initialRoute = (route.params as any)?.initialRoute;
    if (initialRoute && !user) {
      navigation.navigate(initialRoute as keyof RootStackParamList);
    }
  }, [navigation, route.params, user]);

  return (
    <Stack.Navigator id={undefined} screenOptions={{ cardStyle: {flex:1}, headerShown: false }}>
      <Stack.Screen 
        name="Home"
        component={HomePage}
        initialParams={{
          locale: 'en'
        }}
      />
      <Stack.Screen 
        name="CategoryPage" 
        component={CategoryPage}
      />
      <Stack.Screen 
        name="ProductDetailPage" 
        component={ProductDetailPage} 
      />
      {/* Add auth screens */}
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      {/* Cart screen */}
      <Stack.Screen name="Cart" component={CartScreen} />
      {/* Add the new screens */}
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />
      <Stack.Screen name="OrderProducts" component={OrderProductsScreen} />
      <Stack.Screen name="ProductDelivery" component={ProductDeliveryScreen} />
      <Stack.Screen name="OrderPayment" component={OrderPaymentScreen} />
      <Stack.Screen name="Dummy" component={DummyScreen} />
      <Stack.Screen name="AddressBook" component={AddressBookScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistory} />
      <Stack.Screen name="CheckoutForm" component={CheckoutFormScreen} />
      <Stack.Screen name="OrderReview" component={OrderReviewScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;