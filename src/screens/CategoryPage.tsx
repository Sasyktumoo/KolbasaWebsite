import React, { useState, useEffect } from 'react';
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
  Dimensions
} from 'react-native';
import BreadcrumbNavigation from '../components/BreadcrumbNavigation';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList as BaseRootStackParamList } from '../navigation/AppNavigator';
import Header from '../components/Header';
import { collection, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/languages/useLanguage';
import { useCart } from '../context/cart/CartContext';
import { useAlert } from '../context/AlertContext'; // Add this import
import Ionicons from 'react-native-vector-icons/Ionicons';

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
      
      setProducts(fetchedProducts);
      
      // Apply search filtering immediately after products are loaded
      if (products.length > 0) {
        const queryFromParams = route.params?.searchQuery || '';
        
        if (queryFromParams) {
          const filtered = fetchedProducts.filter(product => {
            const productName = (product.translations?.[currentLanguage]?.name || product.name || '').toLowerCase();
            return productName.startsWith(queryFromParams.toLowerCase());
          });
          setFilteredProducts(filtered);
        } else {
          setFilteredProducts(fetchedProducts);
        }
      }
      
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data load
  useEffect(() => {
    fetchProducts();
  }, []);
  
  // React to changes in route params (including when coming from other screens)
  useEffect(() => {
    // Only apply filtering if we have products loaded
    if (!products.length) return;
    
    const queryFromParams = route.params?.searchQuery || '';
    
    if (!queryFromParams) {
      // No search query, show all products
      setFilteredProducts(products);
      return;
    }
    
    // Apply search filtering
    const filtered = products.filter(product => {
      const productName = (product.translations?.[currentLanguage]?.name || product.name || '').toLowerCase();
      return productName.startsWith(queryFromParams.toLowerCase());
    });
    
    setFilteredProducts(filtered);
  }, [route.params?.searchQuery, products, currentLanguage]);
  
  // Clear search results when language changes
  useEffect(() => {
    if (isSearchMode) {
      navigation.setParams({ searchQuery: '' });
    }
  }, [currentLanguage]);

  // Filter products when search query or language changes
  useEffect(() => {
    if (!products.length) return; // Skip if no products loaded yet
    
    // Get the search query from route params
    const queryFromParams = route.params?.searchQuery || '';
    
    if (!queryFromParams) {
      // No search query, show all products
      setFilteredProducts(products);
      return;
    }
    
    // Apply search filtering
    const filtered = products.filter(product => {
      const productName = (product.translations?.[currentLanguage]?.name || product.name || '').toLowerCase();
      return productName.startsWith(queryFromParams.toLowerCase());
    });
    
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
      minOrder: 50, // Default value 
      image: product.imageUrls && product.imageUrls.length > 0 
        ? { uri: product.imageUrls[0] } 
        : require('../assets/images/placeholder.png')
    };
    
    navigation.navigate('ProductDetailPage', { 
      product: detailProduct,
      breadcrumbPath: ['product_catalog', product.id || 'unknown'],
      locale: currentLanguage,
      originalProduct: product // Pass the original product data for detailed view
    });
  };

  // Create a separate component for product items
  const ProductCard = ({ item, onPress, onAddToCart, currentLanguage, t }) => {
    // Use translations based on current language
    const name = item.translations?.[currentLanguage]?.name || item.name;
    const description = item.translations?.[currentLanguage]?.meatContentDescription || '';
    const meatType = item.translations?.[currentLanguage]?.meatType || item.meatType;
    
    // Set minimum order to 50 by default
    const minOrder = 50;
    // Now hooks are at component level - correct usage
    const [quantity, setQuantity] = useState(minOrder);
    
    const decreaseQuantity = () => {
      if (quantity > minOrder) {
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
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => onPress(item)}
      >
        <Image 
          source={item.imageUrls && item.imageUrls.length > 0 
            ? { uri: item.imageUrls[0] } 
            : require('../assets/images/placeholder.png')} 
          style={styles.productImage}
          resizeMode="contain"
        />
        <Text style={styles.productName} numberOfLines={2}>{name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {description}
        </Text>
        <Text style={styles.productDetails}>
          {t('productDetail.characteristics.productType')}: {meatType}
        </Text>
        <Text style={styles.productDetails}>
          {t('productDetail.characteristics.weight')}: {item.netWeight?.value || 0} {item.netWeight?.unit || 'g'}
        </Text>
        
        {/* Min Order Text */}
        <Text style={styles.minOrderText}>
          {t('productDetail.minOrder')}: {minOrder} {t('productDetail.kg')}
        </Text>
        
        {/* Quantity Selector */}
        <View style={styles.quantityContainer}>
          <View style={styles.quantitySelector}>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={(e) => {
                e.stopPropagation();
                decreaseQuantity();
              }}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{quantity}</Text>
            
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={(e) => {
                e.stopPropagation();
                increaseQuantity();
              }}
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
      </TouchableOpacity>
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
      <Header onCatalogPress={() => {
        setLoading(true);
        fetchProducts();
      }} />
      
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
    height: 388, // Increased from 380px to 388px to accommodate taller product names
  },
  productImage: {
    width: '100%',
    height: 140,
    marginBottom: 10,
    borderRadius: 4,
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
  productDetails: {
    fontSize: 12,
    color: '#888',
    marginBottom: 3,
  },
  minOrderText: {
    fontSize: 11,
    color: '#666',
    marginTop: 5,
    marginBottom: 5,
  },
  quantityContainer: {
    marginTop: 10,
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
});

export default CategoryPage;