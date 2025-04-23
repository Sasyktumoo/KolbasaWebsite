import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  SafeAreaView,
  FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BreadcrumbNavigation from '../components/BreadcrumbNavigation';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { changeLanguage } from '../utils/language';
import Header from '../components/Header';

// Type for our product data
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  minOrder: number;
  image: any;
}

// Type for our category data
interface Category {
  id: string;
  name: string;
  path: string;
  image?: any;
}

interface CategoryPageProps {
  route: RouteProp<RootStackParamList, 'CategoryPage'> | RouteProp<RootStackParamList, 'Home'>;
}

const CategoryPage = ({ route }: CategoryPageProps) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { categoryId, categoryPath, categoryName } = route.params;

  // Define our top-level categories (main catalog categories)
  const mainCategories: Category[] = [
    { 
      id: 'meat_products', 
      name: 'Meat Products', 
      path: 'product_catalog/meat_products',
      image: require('../assets/images/placeholder.png')
    },
    { 
      id: 'dairy_products', 
      name: 'Dairy Products', 
      path: 'product_catalog/dairy_products',
      image: require('../assets/images/placeholder.png')
    },
    { 
      id: 'grains_cereals', 
      name: 'Grains & Cereals', 
      path: 'product_catalog/grains_cereals',
      image: require('../assets/images/placeholder.png')
    },
    { 
      id: 'vegetables', 
      name: 'Vegetables', 
      path: 'product_catalog/vegetables',
      image: require('../assets/images/placeholder.png')
    },
  ];

  // Define meat product categories (shown after clicking "Meat Products")
  const meatCategories: Category[] = [
    { id: 'salami', name: 'Salami', path: 'product_catalog/meat_products/salami' },
    { id: 'sausages', name: 'Sausages', path: 'product_catalog/meat_products/sausages' },
    { id: 'tibia', name: 'Tibia', path: 'product_catalog/meat_products/tibia' },
  ];

  // Create product arrays for each category
  const productsByCategory: Record<string, Product[]> = {
    'salami': [
      {
        id: 'italian_salami',
        name: 'Italian Salami',
        description: 'Traditional Italian dry cured salami with garlic and wine',
        price: 320.50,
        minOrder: 25,
        image: require('../assets/images/placeholder.png')
      },
      {
        id: 'pepperoni',
        name: 'Pepperoni',
        description: 'Classic pepperoni, perfect for pizzas and charcuterie boards',
        price: 295.75,
        minOrder: 30,
        image: require('../assets/images/placeholder.png')
      },
      {
        id: 'chorizo',
        name: 'Chorizo',
        description: 'Spanish-style chorizo with smoked paprika and garlic',
        price: 340.25,
        minOrder: 20,
        image: require('../assets/images/placeholder.png')
      }
    ],
    'sausages': [
      {
        id: 'bratwurst',
        name: 'Bratwurst',
        description: 'Traditional German sausage made from pork and veal',
        price: 215.80,
        minOrder: 40,
        image: require('../assets/images/placeholder.png')
      },
      {
        id: 'kielbasa',
        name: 'Kielbasa',
        description: 'Polish smoked sausage, perfect for grilling or adding to stews',
        price: 235.40,
        minOrder: 35,
        image: require('../assets/images/placeholder.png')
      },
      {
        id: 'andouille',
        name: 'Andouille',
        description: 'Cajun-style smoked sausage, essential for gumbo and jambalaya',
        price: 275.60,
        minOrder: 30,
        image: require('../assets/images/placeholder.png')
      }
    ],
    'tibia': [
      {
        id: 'beef_shank',
        name: 'Beef Shank',
        description: 'Premium cut beef shank with bone, perfect for slow cooking',
        price: 228.65,
        minOrder: 50,
        image: require('../assets/images/placeholder.png')
      },
      {
        id: 'beef_ribeye',
        name: 'Beef Ribeye',
        description: 'Prime beef ribeye steak, well marbled for extra flavor',
        price: 354.80,
        minOrder: 30,
        image: require('../assets/images/placeholder.png')
      },
      {
        id: 'beef_brisket',
        name: 'Beef Brisket',
        description: 'Tender beef brisket, ideal for smoking or slow roasting',
        price: 190.25,
        minOrder: 60,
        image: require('../assets/images/placeholder.png')
      },
      {
        id: 'ground_beef',
        name: 'Ground Beef',
        description: 'Fresh ground beef, 80% lean, 20% fat, perfect for burgers',
        price: 145.50,
        minOrder: 40,
        image: require('../assets/images/placeholder.png')
      },
      {
        id: 'beef_tenderloin',
        name: 'Beef Tenderloin',
        description: 'Premium cut beef tenderloin, the most tender beef cut',
        price: 418.70,
        minOrder: 25,
        image: require('../assets/images/placeholder.png')
      }
    ]
  };

  // Determine what to show based on categoryId
  const getSubcategories = (): Category[] => {
    switch (categoryId) {
      case 'catalog':
        return mainCategories;
      case 'meat_products':
        return meatCategories;
      default:
        return [];
    }
  };

  // Get products based on category - now dynamic
  const getProducts = (): Product[] => {
    // Return products for the current category if they exist
    return productsByCategory[categoryId] || [];
  };

  const subcategories = getSubcategories();
  const products = getProducts();

  // Generate breadcrumb items based on the path
  const generateBreadcrumbItems = () => {
    // Start with catalog
    const items = [
      {
        id: 'catalog',
        label: 'Product Catalog',
        onPress: () => navigation.navigate('Home', { 
          categoryId: 'catalog',
          categoryPath: ['product_catalog'],
          categoryName: 'Product Catalog',
          locale: route.params.locale || 'en'
        })
      }
    ];

    // Build breadcrumbs from path parts
    let currentPath = 'product_catalog';
    let pathSegments = ['product_catalog'];
    
    categoryPath.slice(1).forEach((path) => {
      pathSegments.push(path);
      
      // Get a nice display name from the path
      const displayName = path.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      items.push({
        id: path,
        label: displayName,
        onPress: () => navigation.navigate('CategoryPage', {
          categoryId: path,
          categoryPath: pathSegments,
          categoryName: displayName,
          locale: route.params.locale || 'en'
        })
      });
    });

    return items;
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetailPage', { 
      product,
      breadcrumbPath: [...categoryPath, product.id],
      locale: route.params.locale || 'en'
    });
  };

  const handleSubcategoryPress = (category: Category) => {
    // Format the category path correctly
    const newPath = category.path.split('/');
    const locale = route.params.locale || 'en';
    
    // Use the correct screen name based on whether it's the root catalog
    if (category.id === 'catalog') {
      navigation.navigate('Home', {
        categoryId: category.id,
        categoryPath: newPath,
        categoryName: category.name,
        locale
      });
    } else {
      navigation.navigate('CategoryPage', {
        categoryId: category.id,
        categoryPath: newPath,
        categoryName: category.name,
        locale
      });
    }
  };

  // Handle language change
  const handleLanguageChange = (newLocale: string) => {
    changeLanguage(navigation, { name: route.name as keyof RootStackParamList, params: route.params }, newLocale);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* New Header Component */}
        <Header 
          onCatalogPress={() => navigation.navigate('Home', { 
            categoryId: 'catalog',
            categoryPath: ['product_catalog'],
            categoryName: 'Product Catalog',
            locale: route.params.locale || 'en'
          })}
        />
        
        {/* Dynamic Breadcrumbs */}
        <BreadcrumbNavigation items={generateBreadcrumbItems()} />
        
        {/* Category Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.categoryTitle}>{categoryName}</Text>
        </View>

        {/* Subcategories Section (if any) */}
        {subcategories.length > 0 && (
          <View style={styles.subcategoriesSection}>
            <Text style={styles.sectionTitle}>
              {categoryId === 'catalog' ? 'Categories' : 'Subcategories'}
            </Text>
            
            {/* For main catalog, show larger category cards with images */}
            {categoryId === 'catalog' ? (
              <View style={styles.mainCategoriesGrid}>
                {subcategories.map((category) => (
                  <TouchableOpacity 
                    key={category.id}
                    style={styles.mainCategoryCard}
                    onPress={() => handleSubcategoryPress(category)}
                  >
                    <Image 
                      source={category.image || require('../assets/images/placeholder.png')} 
                      style={styles.categoryImage}
                      resizeMode="cover"
                    />
                    <View style={styles.categoryOverlay}>
                      <Text style={styles.mainCategoryName}>{category.name}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.subcategoriesList}>
                {subcategories.map((category) => (
                  <TouchableOpacity 
                    key={category.id}
                    style={styles.subcategoryCard}
                    onPress={() => handleSubcategoryPress(category)}
                  >
                    <View style={styles.subcategoryIconContainer}>
                      <Ionicons name="folder-outline" size={24} color="#FF3B30" />
                    </View>
                    <Text style={styles.subcategoryName}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Products Section */}
        {products.length > 0 && (
          <View style={styles.productsSection}>
            <Text style={styles.sectionTitle}>Products</Text>
            <View style={styles.productsGrid}>
              {products.map((product) => (
                <TouchableOpacity 
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => handleProductPress(product)}
                >
                  <Image 
                    source={product.image} 
                    style={styles.productImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productDescription} numberOfLines={2}>
                    {product.description}
                  </Text>
                  <Text style={styles.productPrice}>{product.price}₽ per kg</Text>
                  <Text style={styles.productMinOrder}>Min. order: {product.minOrder} kg</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Show message when no subcategories or products */}
        {subcategories.length === 0 && products.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyMessage}>No items found in this category.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Your existing styles...
const styles = StyleSheet.create({
  // All your existing styles here
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  headerCompanyInfo: {
    alignItems: 'flex-end',
    flex: 1,
  },
  phoneNumber: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 3,
    color: '#555',
  },
  emailText: {
    fontSize: 12,
    color: '#555',
    marginTop: 3,
  },
  languageSelector: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  languageText: {
    fontSize: 12,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  icon: {
    marginHorizontal: 8,
  },
  loginText: {
    fontSize: 14,
    color: '#FF3B30',
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  catalogButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
  },
  catalogButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  searchBar: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    height: 36,
    justifyContent: 'center',
  },
  searchInput: {
    padding: 8,
  },
  geographyButton: {
    padding: 5,
  },
  searchButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 5,
    marginLeft: 5,
  },
  titleContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginLeft: 10,
  },
  subcategoriesSection: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
  },
  subcategoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mainCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mainCategoryCard: {
    width: '48%',
    height: 150,
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
  },
  mainCategoryName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subcategoryCard: {
    width: '22%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    margin: '1.5%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  subcategoryIconContainer: {
    backgroundColor: '#fff',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  subcategoryName: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  productsSection: {
    backgroundColor: '#fff',
    padding: 10,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  productImage: {
    width: '100%',
    height: 120,
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    height: 30,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 3,
  },
  productMinOrder: {
    fontSize: 12,
    color: '#888',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#888',
  },
  activeLanguage: {
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  languageSeparator: {
    marginHorizontal: 3,
    color: '#999',
  }
});

export default CategoryPage;