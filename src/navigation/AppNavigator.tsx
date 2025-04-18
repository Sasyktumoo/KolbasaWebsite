import React from 'react';
import { Platform, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Linking from 'expo-linking';

import ProductDetailPage from '../screens/ProductDetailPage';
import CategoryPage from '../screens/CategoryPage';

// Define your root stack param list
type RootStackParamList = {
  CategoryPage: {
    categoryId: string;
    categoryPath: string[];
    categoryName: string;
  };
  ProductDetailPage: {
    productId: string;
    breadcrumbPath: string[];
    product?: { name: string; id: string; [key: string]: any };
  };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  // Define the linking configuration for web URLs
  const linking = {
    prefixes: [Linking.createURL('/')],
    config: {
      screens: {
        CategoryPage: {
          path: ':categoryPath*',
          parse: {
            categoryId: (path: string) => {
              // Extract the category ID from the path
              if (!path || path === '') return 'catalog';
              const segments = path.split('/');
              return segments[segments.length - 1];
            },
            categoryPath: (path: string) => {
              // Convert URL path to category path array
              if (!path || path === '') return ['product_catalog'];
              return ['product_catalog', ...path.split('/')];
            },
            categoryName: (path: string) => {
              // Generate a display name from the last path segment
              if (!path || path === '') return 'Product Catalog';
              const segments = path.split('/');
              const lastSegment = segments[segments.length - 1];
              return lastSegment
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            },
          },
          stringify: {
            categoryPath: (path: string[]) => {
              // Skip the first element (product_catalog) as it's the root
              if (path.length <= 1) return '';
              return path.slice(1).join('/');
            },
          },
        },
        ProductDetailPage: {
          path: 'product/:productId',
          parse: {
            productId: (productId: string) => productId,
            breadcrumbPath: (path: string) => {
              // Build breadcrumb path from query param or default
              if (path) {
                return ['product_catalog', ...path.split(',')];
              }
              return ['product_catalog', 'product'];
            },
          },
            stringify: {
              productId: (id: string) => id,
              breadcrumbPath: (path: string[]) => path.slice(1).join(','),
              product: (product: any) => product.id
            },
          },
        },
      },
    };
  
    return (
      <NavigationContainer 
      linking={linking} 
      fallback={<Text>Loading...</Text>}
      documentTitle={{
        formatter: (options, route) => {
          // Set browser tab title based on route
          if (route?.name === 'ProductDetailPage') {
            const params = route.params as RootStackParamList['ProductDetailPage'];
            if (params?.product) {
              return `${params.product.name} - B2B.TRADE`;
            }
          }
          if (route?.name === 'CategoryPage') {
            const params = route.params as RootStackParamList['CategoryPage'];
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
          name="CategoryPage" 
          component={CategoryPage}
          initialParams={{
            categoryId: 'catalog',
            categoryPath: ['product_catalog'],
            categoryName: 'Product Catalog'
          }}
        />
        <Stack.Screen name="ProductDetailPage" component={ProductDetailPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;