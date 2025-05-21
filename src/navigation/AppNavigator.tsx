import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Linking from 'expo-linking';
import { LinkingOptions } from '@react-navigation/native';

import ProductDetailPage from '../screens/ProductDetail/ProductDetailPage';
import CategoryPage from '../screens/CategoryPage';
import HomePage from '../screens/HomePage';
// Import the new screens
import AboutUsScreen from '../screens/AboutUsScreen';
import OrderProductsScreen from '../screens/OrderProductsScreen';
import ProductDeliveryScreen from '../screens/ProductDeliveryScreen';
import OrderPaymentScreen from '../screens/OrderPaymentScreen';
import FAQScreen from '../screens/FAQScreen';
import PremiumProgramScreen from '../screens/PremiumProgramScreen';
import NewsScreen from '../screens/NewsScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import DummyScreen from '../screens/DummyScreen';

// Define your root stack param list and export it for reuse elsewhere
export type RootStackParamList = {
  Home: {
    locale: string;
    categoryId?: string;
    categoryPath?: string[];
    categoryName?: string;
  };
  CategoryPage: {
    categoryId: string;
    categoryPath: string[];
    categoryName: string;
    locale: string;
  };
  ProductDetailPage: {
    product: any;
    breadcrumbPath: string[];
    locale: string;
  };
  // Add the new screens to the param list
  AboutUs: undefined;
  OrderProducts: undefined;
  ProductDelivery: undefined;
  OrderPayment: undefined;
  FAQ: undefined;
  PremiumProgram: undefined;
  News: undefined;
  Feedback: undefined;
  Dummy: undefined;
};

// Export the linking configuration to use in App.tsx
export const getLinkingConfig = (): LinkingOptions<RootStackParamList> => ({
  prefixes: [Linking.createURL('/')],
  config: {
    initialRouteName: 'Home',
    screens: {
      Home: {
        path: ':locale?',
        parse: {
          locale: (locale: string) => locale || 'en'
        },
        stringify: {
          locale: (locale: string) => locale || 'en'
        }
      },
      CategoryPage: {
        path: ':locale/product_catalog/:categoryPath*',
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
          locale: (locale: string) => locale || 'en'
        },
        stringify: {
          categoryPath: (path: string[]) => {
            if (path.length <= 1) return '';
            return path.slice(1).join('/');
          },
          locale: (locale: string) => locale || 'en'
        }
      },
      ProductDetailPage: {
        path: ':locale/products/:productId',
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
          locale: (locale: string) => locale || 'en'
        },
        stringify: {
          productId: (product: any) => product.id,
          locale: (locale: string) => locale || 'en'
        }
      },
      // Add linking configuration for new screens
      AboutUs: 'about-us',
      OrderProducts: 'order-products',
      ProductDelivery: 'product-delivery',
      OrderPayment: 'order-payment',
      FAQ: 'faq',
      PremiumProgram: 'premium-program',
      News: 'news',
      Feedback: 'feedback',
      Dummy: 'dummy',
    },
  },
});

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
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
      {/* Add the new screens */}
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />
      <Stack.Screen name="OrderProducts" component={OrderProductsScreen} />
      <Stack.Screen name="ProductDelivery" component={ProductDeliveryScreen} />
      <Stack.Screen name="OrderPayment" component={OrderPaymentScreen} />
      <Stack.Screen name="FAQ" component={FAQScreen} />
      <Stack.Screen name="PremiumProgram" component={PremiumProgramScreen} />
      <Stack.Screen name="News" component={NewsScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen name="Dummy" component={DummyScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;