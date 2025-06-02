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
  Dimensions,
  Alert
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

// Extend the RootStackParamList to ensure Home accepts the same params as CategoryPage
type RootStackParamList = BaseRootStackParamList & {
  Home: { locale: string; };
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
  
  // State for Firebase products
  const [products, setProducts] = useState<FirebaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProducts();
  }, []);

  // Generate breadcrumb items
  const generateBreadcrumbItems = () => {
    return [
      {
        id: 'catalog',
        label: t('productDetail.productCatalog'),
        onPress: () => navigation.navigate('Home', { 
          locale: route.params?.locale || 'en'
        })
      }
    ];
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

  // Update the renderProductItem function to include Add to Cart button
  const renderProductItem = ({ item }: { item: FirebaseProduct }) => {
    // Use translations based on current language
    const name = item.translations?.[currentLanguage]?.name || item.name;
    const description = item.translations?.[currentLanguage]?.meatContentDescription || '';
    const meatType = item.translations?.[currentLanguage]?.meatType || item.meatType;
    
    const handleAddToCart = () => {
      addItem({
        id: item.id || `product-${Date.now()}`,
        name: name,
        price: item.meatContent?.value || 0,
        quantity: 1,
        imageUrl: item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : undefined,
        weight: {
          value: item.netWeight?.value || 0,
          unit: item.netWeight?.unit || 'g'
        }
      });
      
      // Show confirmation
      Alert.alert(
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
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
      >
        <Image 
          source={item.imageUrls && item.imageUrls.length > 0 
            ? { uri: item.imageUrls[0] } 
            : require('../assets/images/placeholder.png')} 
          style={styles.productImage}
          resizeMode="contain"
        />
        <Text style={styles.productName}>{name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {description}
        </Text>
        <Text style={styles.productDetails}>
          {t('productDetail.characteristics.productType')}: {meatType}
        </Text>
        <Text style={styles.productDetails}>
          {t('productDetail.characteristics.weight')}: {item.netWeight?.value || 0} {item.netWeight?.unit || 'g'}
        </Text>
        
        {/* Add to Cart Button */}
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
        >
          <Text style={styles.addToCartButtonText}>{t('cart.addToCart')}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style = {{
      flex: 1,
      backgroundColor: '#f9f9f9',
    }}>
      <Header onCatalogPress={() => {
        setLoading(true);
        fetchProducts();
      }} />
      
      <BreadcrumbNavigation items={generateBreadcrumbItems()} />
      
      <View style={styles.titleContainer}>
        <Text style={styles.categoryTitle}>{t('productDetail.productCatalog')}</Text>
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
      ) : products.length > 0 ? (
        <FlatList
          data={products}
          renderItem={renderProductItem}           
          keyExtractor={(item) => item.id}
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
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    height: 32,
  },
  productDetails: {
    fontSize: 12,
    color: '#888',
    marginBottom: 3,
  },
  addToCartButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CategoryPage;