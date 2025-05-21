import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

interface SidebarProps {
  activeCategory?: string;
}

const Sidebar = ({ activeCategory }: SidebarProps) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Categories data
  const categories = [
    { id: 'meat_products', name: 'Meat Products', path: 'product_catalog/meat_products' },
    { id: 'dairy_products', name: 'Dairy Products', path: 'product_catalog/dairy_products' },
    { id: 'grains_cereals', name: 'Grains & Cereals', path: 'product_catalog/grains_cereals' },
    { id: 'vegetables', name: 'Vegetables', path: 'product_catalog/vegetables' }
  ];

  // Handle category selection
  const handleCategoryPress = (category: any) => {
    const newPath = category.path.split('/');
    navigation.navigate('CategoryPage', {
      categoryId: category.id,
      categoryPath: newPath,
      categoryName: category.name,
      locale: 'en'
    });
  };

  return (
    <View style={styles.sidebar}>
      <Text style={styles.sidebarTitle}>Categories</Text>
      {categories.map(category => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryItem,
            activeCategory === category.id && styles.activeCategoryItem
          ]}
          onPress={() => handleCategoryPress(category)}
        >
          <Text style={[
            styles.categoryText,
            activeCategory === category.id && styles.activeCategoryText
          ]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    backgroundColor: '#fff',
    padding: 15,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    height: '100%', // Ensure it fills the full height
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  categoryItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activeCategoryItem: {
    backgroundColor: '#f9f9f9',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  activeCategoryText: {
    color: '#FF3B30',
    fontWeight: '500',
  },
});

export default Sidebar;