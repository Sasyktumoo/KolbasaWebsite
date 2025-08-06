import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Dimensions,
  TextInput
} from 'react-native';
import BreadcrumbNavigation from '../components/BreadcrumbNavigation';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList as BaseRootStackParamList } from '../navigation/AppNavigator';
import { collection, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/languages/useLanguage';
import { useCart } from '../context/cart/CartContext';
import { useAlert } from '../context/AlertContext'; // Add this import
import Ionicons from 'react-native-vector-icons/Ionicons';
import { resolveImage } from '../utils/storage';

// Extend the RootStackParamList to ensure Home accepts the same params as CategoryPage
type RootStackParamList = BaseRootStackParamList & {
  Home: { 
    locale: string;
    searchQuery?: string; // Add search query parameter to Home route too
  };
  CategoryPage: {
    categoryId: string;
    categoryPath: string[];
    categoryName: string;
    locale: string;
    searchQuery?: string; // Add search query parameter
  };
  ProductDetailPage: {
    product: any;
    breadcrumbPath: string[];
    locale: string;
    originalProduct: FirebaseProduct;
  };
};

// Type for our product data from Firebase
interface FirebaseProduct {
  id?: string;
  name: string;
  packaging: string;
  netWeight: {
    value: number;
    unit: string;
    approximate: boolean;
  };
  storageTemperature: {
    min: number;
    max: number;
    unit: string;
  };
  processingType: string[];
  meatType: string;
  meatContent: {
    value: number;
    unit: string;
    description: string;
  };
  shelfLife: {
    value: number;
    unit: string;
  } | null;
  imageUrls?: string[];
  translations: {
    en: {
      name: string;
      packaging: string;
      meatType: string;
      meatContentDescription: string;
      processingType: string[];
    };
  };
}

interface CategoryPageProps {
  route: RouteProp<RootStackParamList, 'CategoryPage'> | RouteProp<RootStackParamList, 'Home'>;
}

// Add this function to translate weight units
export const translateWeightUnit = (unit: string, language: string): string => {
  if (!unit) return '';
  
  // Map of Russian units to their translations in different languages
  const unitTranslations = {
    'г': {
      'en': 'g',
      'es': 'g',
      'ru': 'г',
      'uk': 'г'     
      // Add more languages as needed
    },
    'кг': {
      'en': 'kg',
      'es': 'kg',
      'ru': 'кг',
      'uk': 'кг' 
    },
    'шт.': {
      'en': 'kg',
      'es': 'kg',
      'ru': 'кг',
      'uk': 'кг' 
    }
  };
  
  // Return the translated unit or the original if no translation exists
  return unitTranslations[unit]?.[language] || unit;
};

const CategoryPage = ({ route }: CategoryPageProps) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { t, currentLanguage } = useLanguage();
  const { addItem } = useCart();
  const { alert } = useAlert(); // Add this line
  
  // State for Firebase products
  const [products, setProducts] = useState<FirebaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract search query from route params
  const searchQuery = route.params?.searchQuery || '';
  const isSearchMode = searchQuery.length > 0;
  
  // State for filtered products
  const [filteredProducts, setFilteredProducts] = useState<FirebaseProduct[]>([]);
  
  // Fetch products from Firebase
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const foodItemsRef = collection(FIREBASE_DB, 'foodItems');
      const querySnapshot = await getDocs(foodItemsRef);

      const fetchedProducts: FirebaseProduct[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseProduct;
        fetchedProducts.push({
          ...data,
          id: doc.id,
        });
      });

      // Simply set products; do NOT filter here
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data load
  useEffect(() => {
    fetchProducts();
  }, []);
  

  // Track previous language to only clear when language actually changes
  const prevLanguageRef = useRef(currentLanguage);

  // Modified: Only clear search when language actually changes, not on initial mount
  useEffect(() => {
    if (isSearchMode && prevLanguageRef.current !== currentLanguage) {
      // Only clear search when language actually changes (not on initial render)
      navigation.setParams({ searchQuery: '' });
    }
    // Update ref with current language for next comparison
    prevLanguageRef.current = currentLanguage;
  }, [currentLanguage]);

  // Filter products when search query or language changes
  useEffect(() => {
    // Skip if no products are loaded yet
    if (products.length === 0) return;
    
    // Get search query from route params
    const queryFromParams = route.params?.searchQuery || '';
    console.log("Processing search query:", queryFromParams);
    
    if (!queryFromParams) {
      // No search query, show all products
      setFilteredProducts(products);
      return;
    }
    
    // Apply search filtering
    const filtered = products.filter(product => {
      const productName = (product.translations?.[currentLanguage]?.name || product.name || '').toLowerCase();
      return productName.includes(queryFromParams.toLowerCase());
    });
    
    console.log(`Filtered products: ${filtered.length} of ${products.length}`);
    setFilteredProducts(filtered);
    
  }, [route.params?.searchQuery, products, currentLanguage]);

  // Function to clear search filter
  const clearSearchFilter = () => {
    // Navigate to the same category page but without search parameters
    navigation.setParams({ searchQuery: '' });
  };

  // Generate breadcrumb items with search if applicable
  const generateBreadcrumbItems = () => {
    const items = [
      {
        id: 'catalog',
        label: t('productDetail.productCatalog'),
        onPress: () => navigation.navigate('Home', { 
          locale: route.params?.locale || 'en'
        })
      }
    ];
    
    // Add search item if in search mode
    if (isSearchMode) {
      items.push({
        id: 'search',
        label: `${t('search.results')}: ${searchQuery}`,
        onPress: () => {} // No action for current item
      });
    }
    
    return items;
  };

  const handleProductPress = (product: FirebaseProduct) => {
    // Create a product object compatible with ProductDetailPage
    const detailProduct = {
      id: product.id || 'unknown',
      name: product.translations?.[currentLanguage]?.name || product.name,
      description: product.translations?.[currentLanguage]?.meatContentDescription || '',
      price: product.meatContent?.value || 0,
      minOrder: 1,
      image: product.imageUrls && product.imageUrls.length > 0 
        ? { uri: resolveImage(product.imageUrls[0]) } 
        : { uri: 'https://via.placeholder.com/150?text=No+Image' }
    };
    
    navigation.navigate('ProductDetailPage', { 
      product: detailProduct,
      breadcrumbPath: ['product_catalog', product.id || 'unknown'],
      locale: currentLanguage,
      originalProduct: product
    });
  };

  // Create a separate component for product items
  const ProductCard = ({ item, onPress, onAddToCart, currentLanguage, t }) => {
    // Use translations based on current language
    const name = item.translations?.[currentLanguage]?.name || item.name;
    const description = item.translations?.[currentLanguage]?.meatContentDescription || '';
    const meatType = item.translations?.[currentLanguage]?.meatType || item.meatType;
    
    const [quantity, setQuantity] = useState(1);
    
    const decreaseQuantity = () => {
      if (quantity > 1) {
        setQuantity(quantity - 1);
      }
    };
    
    const increaseQuantity = () => {
      setQuantity(quantity + 1);
    };
    
    const handleAddToCart = (e) => {
      e.stopPropagation();
      onAddToCart(item, quantity);
    };
    
    return (
      <View style={styles.productCard}>
        {/* Product details area (clickable) */}
        <TouchableOpacity 
          style={styles.productDetails}
          onPress={() => onPress(item)}
        >
          {item.imageUrls && item.imageUrls.length > 0 ? (
            <Image 
              source={{ uri: item.imageUrls[0] }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.productImage, styles.placeholderContainer]}>
              <Ionicons name="image-outline" size={50} color="#cccccc" />
            </View>
          )}
          <Text style={styles.productName} numberOfLines={2}>{name}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {description}
          </Text>
          <Text style={styles.productInfoText}>
            {t('productDetail.characteristics.productType')}: {meatType}
          </Text>
          <Text style={styles.productInfoText}>
            {t('productDetail.characteristics.weight')}: {item.netWeight?.value || 0} {translateWeightUnit(item.netWeight?.unit, currentLanguage)}
          </Text>
        </TouchableOpacity>

        {/* Quantity controls (non-clickable for navigation) */}
        <View style={styles.quantityContainer}>
          <View style={styles.quantitySelector}>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={decreaseQuantity}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            
            <TextInput
              style={styles.quantityInput}
              value={quantity.toString()}
              keyboardType="numeric"
              onChangeText={(text) => {
                const value = parseInt(text);
                if (!isNaN(value) && value >= 1) {
                  setQuantity(value);
                } else if (text === '') {
                  setQuantity(1);
                }
              }}
              selectTextOnFocus={true}
            />
            
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={increaseQuantity}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Text style={styles.addToCartButtonText}>{t('cart.addToCart')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleAddToCart = (item, quantity) => {
    const name = item.translations?.[currentLanguage]?.name || item.name;
    
    addItem({
      id: item.id || `product-${Date.now()}`,
      name: name,
      price: item.meatContent?.value || 0,
      quantity: quantity,
      imageUrl: item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : undefined,
      weight: {
        value: item.netWeight?.value || 0,
        unit: item.netWeight?.unit || 'g'
      }
    });
    
    // Replace Alert.alert with custom alert
    alert(
      t('cart.addedToCartTitle'),
      t('cart.addedToCartMessage'),
      [
        { 
          text: t('cart.continueShopping'), 
          style: 'cancel' 
        },
        { 
          text: t('cart.viewCart'), 
          onPress: () => navigation.navigate('Cart')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: '#f9f9f9',
    }}>
      
      <BreadcrumbNavigation items={generateBreadcrumbItems()} />
      
      <View style={styles.titleContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.categoryTitle}>
            {isSearchMode 
              ? `${t('search.results')}: "${searchQuery}"`
              : t('productDetail.productCatalog')}
          </Text>
          
          {/* Add Clear Filter button when in search mode */}
          {isSearchMode && (
            <TouchableOpacity 
              style={styles.clearFilterButton}
              onPress={clearSearchFilter}
            >
              <Text style={styles.clearFilterText}>{t('search.clearFilter')}</Text>
              <Ionicons name="close-circle" size={16} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : isSearchMode && filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>{t('search.noResults', { query: searchQuery })}</Text>
        </View>
      ) : filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts} // Use filtered products instead of all products
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              onPress={handleProductPress}
              onAddToCart={handleAddToCart}
              currentLanguage={currentLanguage}
              t={t}
            />
          )}           
          keyExtractor={(item) => item.id || ''}
          numColumns={3}        
          contentContainerStyle={styles.productsGrid}
          columnWrapperStyle={styles.productRow}
          showsVerticalScrollIndicator={true}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>No products found.</Text>
        </View>
      )}
      
    </SafeAreaView>
  );
};

// Update styles to include new elements
const styles = StyleSheet.create({
  flatList: {
    flex: 1,  // Add this
    width: '100%',
  },
  container: {
    flex: 1,  // Add this
    backgroundColor: '#f9f9f9',
    flexDirection: 'column',
  },
  mainContent: {
    flex: 1,  // Add this
    backgroundColor: '#fff',
  },
  titleContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffeded',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffcaca',
  },
  clearFilterText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  loadingContainer: {
    flex: 1,  // Add this
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,  // Add this
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,  // Add this
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#888',
  },
  productsGrid: {
    padding: 10,
    paddingBottom: 100,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    height: 388, // Keep the height
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  productDetails: {
    flex: 1, // Take up available space
  },
  productImage: {
    width: '100%',
    height: 140,
    marginBottom: 10,
    borderRadius: 4,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    height: 48, // Increased from 40px to 48px to fit two lines properly
    overflow: 'hidden', // Hide overflow text
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    height: 32, // Keep existing fixed height
    overflow: 'hidden', // Hide overflow text
  },
  productInfoText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 3,
  },
  quantityContainer: {
    marginTop: 'auto', // Push to bottom of flex container
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    backgroundColor: '#f0f0f0',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 8,
  },
  addToCartButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Add or modify styles for TextInput
  quantityInput: {
    width: 60,
    height: 28,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 8,
  },
});

export default CategoryPage;