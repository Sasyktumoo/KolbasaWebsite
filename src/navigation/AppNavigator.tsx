import React from 'react';
import { Platform, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Linking from 'expo-linking';
import { LinkingOptions } from '@react-navigation/native';

import ProductDetailPage from '../screens/ProductDetailPage';
import CategoryPage from '../screens/CategoryPage';

// Define your root stack param list and export it for reuse elsewhere
export type RootStackParamList = {
  Home: {
    categoryId: string;
    categoryPath: string[];
    categoryName: string;
    locale: string;
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
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  // Define the linking configuration for web URLs
  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: [Linking.createURL('/')],
    config: {
      initialRouteName: 'Home',
      screens: {
        Home: {
          path: ':locale/product_catalog',
          parse: {
            categoryId: () => 'catalog',
            categoryPath: () => ['product_catalog'],
            categoryName: () => 'Product Catalog',
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
              // Skip the "product_catalog" part as it's in the base path
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
              // In a real app, you would fetch product details here
              return {
                id: value,
                name: 'Product ' + value,
                description: 'Product description',
                price: 100,
                minOrder: 10,
                image: require('../assets/images/placeholder.png')
              };
            },
            breadcrumbPath: (value: string) => ['product_catalog', 'product'],
            locale: (locale: string) => locale || 'en'
          },
          stringify: {
            productId: (product: any) => product.id,
            locale: (locale: string) => locale || 'en'
          }
        }
      },
    },
  };

  // Default redirect to /en/product_catalog on first load
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      // Only run this on web platform
      const currentUrl = window.location.pathname;
      if (currentUrl === '/' || currentUrl === '') {
        window.history.replaceState({}, '', '/en/product_catalog');
      }
    }
  }, []);

  return (
    <NavigationContainer
      linking={linking}
      fallback={<Text>Loading...</Text>}
      documentTitle={{
        formatter: (options, route) => {
          if (route?.name === 'ProductDetailPage') {
            const params = route.params as any;
            if (params?.product) {
              return `${params.product.name} - B2B.TRADE`;
            }
          }
          if (route?.name === 'CategoryPage' || route?.name === 'Home') {
            const params = route.params as any;
            if (params?.categoryName) {
              return `${params.categoryName} - B2B.TRADE`;
            }
          }
          return 'B2B.TRADE - Meat Products';
        }
      }}
    >
      <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="Home"
          component={CategoryPage}
          initialParams={{
            categoryId: 'catalog',
            categoryPath: ['product_catalog'],
            categoryName: 'Product Catalog',
            locale: 'en'
          }}
        />
        <Stack.Screen 
          name="CategoryPage" 
          component={CategoryPage}
        />
        <Stack.Screen name="ProductDetailPage" component={ProductDetailPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;