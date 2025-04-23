import React from 'react';
import { Platform } from 'react-native';
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

// Export the linking configuration to use in App.tsx
export const getLinkingConfig = (): LinkingOptions<RootStackParamList> => ({
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
              image: null // We'll fix this after confirming it works
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
});

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
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
  );
};

export default AppNavigator;