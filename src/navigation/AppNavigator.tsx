import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

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
    product: any;
    breadcrumbPath: string[];
  };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
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