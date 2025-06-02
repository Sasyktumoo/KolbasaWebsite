import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  SafeAreaView,
  Alert,
  Dimensions,
  Platform,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BreadcrumbNavigation from '../../components/BreadcrumbNavigation';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import styles from './ProductDetailPageDesign'
import ReviewsSection from '../../components/ReviewsSection';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import { useLanguage } from '../../context/languages/useLanguage';
import { useCart } from '../../context/cart/CartContext';

// Product type definition for navigation
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  minOrder: number;
  image: any;
}

// Firebase product type definition
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

type ProductDetailScreenProps = {
  route: RouteProp<RootStackParamList, 'ProductDetailPage'>;
};

// Define section types for FlatList
const SECTION_TYPES = {
  BREADCRUMB: 'breadcrumb',
  TITLE: 'title',
  TABS: 'tabs',
  MAIN: 'main',
  OTHER_PRODUCTS: 'otherProducts',
  DESCRIPTION: 'description',
  CHARACTERISTICS: 'characteristics',
  REVIEWS: 'reviews'
};

const ProductDetailScreen = ({ route }: ProductDetailScreenProps) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [quantity, setQuantity] = useState(50);
  const [activeTab, setActiveTab] = useState('description');
  const { t, currentLanguage } = useLanguage();
  const { addItem } = useCart();
  
  // Create refs for scrolling to sections
  const flatListRef = useRef<FlatList>(null);
  const sectionRefs = useRef({
    description: null,
    characteristics: null,
    reviews: null
  });
  
  // Get product data from navigation params
  const { product, breadcrumbPath, originalProduct } = route.params || { 
    product: {
      id: 'default_product',
      name: 'Default Product',
      price: 100,
      minOrder: 50,
      image: require('../../assets/images/placeholder.png')
    },
    breadcrumbPath: ['product_catalog', 'default_product']
  };
  
  // Get the Firebase product data if it exists
  const firebaseProduct = originalProduct as FirebaseProduct | undefined;
  
  const pricePerKg = product.price;
  
  const decreaseQuantity = () => {
    if (quantity > product.minOrder) setQuantity(quantity - 1);
  };
  
  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  const totalPrice = (pricePerKg * quantity).toFixed(2);
  
  // Handler for catalog button press
  const handleCatalogPress = () => {
    navigation.navigate('CategoryPage', { 
      categoryId: 'catalog',
      categoryPath: ['product_catalog'],
      categoryName: t('productDetail.productCatalog'),
      locale: currentLanguage
    });
  };

  // Add a function to handle adding to cart
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: firebaseProduct?.translations?.[currentLanguage]?.name || product.name,
      price: pricePerKg,
      quantity: quantity,
      imageUrl: firebaseProduct?.imageUrls?.[0],
      weight: {
        value: firebaseProduct?.netWeight?.value || 0,
        unit: firebaseProduct?.netWeight?.unit || 'g'
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

  // Generate breadcrumb items
  const generateBreadcrumbItems = () => {
    // Start with catalog
    const items = [
      {
        id: 'catalog',
        label: t('productDetail.productCatalog'),
        onPress: () => navigation.navigate('Home', { 
          locale: currentLanguage
        })
      }
    ];

    // Add the current product as the last item with translated name
    items.push({
      id: 'current-product',
      label: firebaseProduct?.translations?.[currentLanguage]?.name || product.name,
      onPress: () => {} // No action for current product
    });

    return items;
  };
  
  // Prepare data for FlatList - create sections
  const sections = [
    { type: SECTION_TYPES.BREADCRUMB, id: 'breadcrumb' },
    { type: SECTION_TYPES.TITLE, id: 'title' },
    { type: SECTION_TYPES.TABS, id: 'tabs' },
    { type: SECTION_TYPES.MAIN, id: 'main' },
    { type: SECTION_TYPES.DESCRIPTION, id: 'description' },
    { type: SECTION_TYPES.CHARACTERISTICS, id: 'characteristics' },
    { type: SECTION_TYPES.REVIEWS, id: 'reviews' }
  ];
  
  // Scroll to section functions
  const scrollToSection = (sectionIndex) => {
    flatListRef.current?.scrollToIndex({
      animated: true,
      index: sectionIndex,
      viewOffset: 100
    });
  };

  const scrollToDescription = () => {
    setActiveTab('description');
    scrollToSection(4); // Index of description section
  };

  const scrollToCharacteristics = () => {
    setActiveTab('characteristics');
    scrollToSection(5); // Index of characteristics section
  };

  const scrollToReviews = () => {
    setActiveTab('reviews');
    scrollToSection(6); // Index of reviews section
  };
    
  // Render different sections based on type
  const renderSection = ({ item }) => {
    switch (item.type) {
      case SECTION_TYPES.BREADCRUMB:
        return <BreadcrumbNavigation items={generateBreadcrumbItems()} />;
      
      case SECTION_TYPES.TITLE:
        return (
          <View style={styles.titleContainer}>
            <Text style={styles.productTitle}>
              {firebaseProduct?.translations?.[currentLanguage]?.name || product.name}
            </Text>
            <Text style={styles.productDescription}>
              {t('productDetail.toOrderBulk')}
              <Text style={styles.highlightText}> {t('productDetail.write')} </Text> 
              {t('productDetail.or')}
              <Text style={styles.highlightText}> {t('productDetail.orderCall')} </Text> 
              {t('productDetail.or')}
              <Text style={styles.highlightText}> {t('productDetail.call')} </Text>
            </Text>
          </View>
        );
      
      case SECTION_TYPES.TABS:
        return (
          <View style={styles.tabNavigation}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'description' && styles.activeTab]}
              onPress={scrollToDescription}
            >
              <Text style={[styles.tabText, activeTab === 'description' && styles.activeTabText]}>
                {t('productDetail.tabs.description')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'characteristics' && styles.activeTab]}
              onPress={scrollToCharacteristics}
            >
              <Text style={[styles.tabText, activeTab === 'characteristics' && styles.activeTabText]}>
                {t('productDetail.tabs.characteristics')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
              onPress={scrollToReviews}
            >
              <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
                {t('productDetail.tabs.reviews')}
              </Text>
            </TouchableOpacity>
          </View>
        );
      
      case SECTION_TYPES.MAIN:
        return (
          <View style={styles.mainProductSection}>
            {/* Product Image */}
            <View style={styles.productImageContainer}>
              <Image 
                source={product.image} 
                style={styles.productImage}
                resizeMode="contain"
              />
            </View>
            
            {/* Purchase Panel */}
            <View style={styles.purchasePanel}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t('productDetail.pricePerKg')}:</Text>
                <Text style={styles.pricePerKg}>{pricePerKg}₽</Text>
              </View>
              
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  {t('productDetail.priceDisclaimer')}
                  <Text style={styles.highlightText}> {t('productDetail.contactSupplier')}</Text>
                </Text>
              </View>
              
              <Text style={styles.minOrderText}>
                {t('productDetail.minOrder')}: {product.minOrder} {t('productDetail.kg')}
              </Text>
              
              {/* Quantity Selector */}
              <View style={styles.quantitySelector}>
                <TouchableOpacity style={styles.quantityButton} onPress={decreaseQuantity}>
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.quantityInput}
                  value={quantity.toString()}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const value = parseInt(text) || product.minOrder;
                    setQuantity(value < product.minOrder ? product.minOrder : value);
                  }}
                />
                <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t('productDetail.totalPrice')}:</Text>
                <Text style={styles.totalPrice}>{totalPrice}₽</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.orderButton}
                onPress={handleAddToCart}
              >
                <Text style={styles.orderButtonText}>{t('cart.addToCart')}</Text>
              </TouchableOpacity>
            </View>
            
            {/* Supplier Card */}
            <View style={styles.supplierCard}>
              <Text style={styles.supplierName}>Vyacheslav Nikolaevich Tyulenev</Text>
              <View style={styles.supplierBadge}>
                <Text style={styles.supplierBadgeText}>{t('productDetail.producer')}</Text>
              </View>
              <TouchableOpacity style={styles.writeToSupplierButton}>
                <Ionicons name="mail-outline" size={18} color="#FF3B30" />
                <Text style={styles.writeToSupplierText}>{t('productDetail.writeToSupplier')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.phoneButton}>
                <Ionicons name="call-outline" size={18} color="#FF3B30" />
                <Text style={styles.phoneButtonText}>{t('productDetail.showPhoneNumber')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.phoneButton}>
                <Ionicons name="call-outline" size={18} color="#FF3B30" />
                <Text style={styles.phoneButtonText}>{t('productDetail.requestCallback')}</Text>
              </TouchableOpacity>

              {/* Delivery Address Button */}
              <TouchableOpacity style={styles.deliveryAddressButton}>
                <Ionicons name="location-outline" size={18} color="#FF3B30" />
                <Text style={styles.deliveryAddressText}>{t('productDetail.enterDeliveryAddress')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
        
      case SECTION_TYPES.DESCRIPTION:
        return (
          <View 
            style={styles.detailSection}
            onLayout={(event) => {
              sectionRefs.current.description = event.nativeEvent.layout.y;
            }}
          >
            <Text style={styles.detailSectionTitle}>{t('productDetail.tabs.description')}</Text>
            <Text style={styles.detailText}>
              {firebaseProduct?.translations?.[currentLanguage]?.meatContentDescription || 
               product.description || 
               t('productDetail.defaultDescription')}
            </Text>
          </View>
        );
        
      case SECTION_TYPES.CHARACTERISTICS:
        // Build characteristics data from the Firebase product
        const characteristicsData = firebaseProduct ? [
          { 
            name: t('productDetail.characteristics.productType'), 
            value: firebaseProduct.translations?.[currentLanguage]?.meatType || firebaseProduct.meatType 
          },
          { 
            name: t('productDetail.characteristics.weight'), 
            value: `${firebaseProduct.netWeight?.value || 0} ${firebaseProduct.netWeight?.unit || 'g'}` 
          },
          { 
            name: 'Packaging', 
            value: firebaseProduct.translations?.[currentLanguage]?.packaging || firebaseProduct.packaging 
          },
          { 
            name: 'Processing Type', 
            value: firebaseProduct.translations?.[currentLanguage]?.processingType?.join(', ') || 
                  firebaseProduct.processingType?.join(', ') || 'N/A'
          },
          { 
            name: 'Storage Temperature', 
            value: `${firebaseProduct.storageTemperature?.min || 0}°C to ${firebaseProduct.storageTemperature?.max || 0}°C` 
          },
          { 
            name: 'Shelf Life', 
            value: firebaseProduct.shelfLife ? 
                  `${firebaseProduct.shelfLife.value} ${firebaseProduct.shelfLife.unit}` : 
                  'N/A' 
          }
        ] : [
          // Default fallback values if no Firebase product
          { name: t('productDetail.characteristics.manufacturerArticle'), value: '-' },
          { name: t('productDetail.characteristics.weight'), value: '-' },
          { name: t('productDetail.characteristics.productType'), value: '-' },
          { name: t('productDetail.characteristics.supplyUnit'), value: '-' },
          { name: t('productDetail.characteristics.countryOfOrigin'), value: '-' }
        ];
        
        return (
          <View 
            style={styles.detailSection} 
            onLayout={(event) => {
              sectionRefs.current.characteristics = event.nativeEvent.layout.y;
            }}
          >
            <Text style={styles.detailSectionTitle}>{t('productDetail.tabs.characteristics')}</Text>
            <FlatList
              data={characteristicsData}
              keyExtractor={(item, index) => `characteristic-${index}`}
              renderItem={({ item }) => (
                <View style={styles.characteristic}>
                  <Text style={styles.characteristicName}>{item.name}</Text>
                  <Text style={styles.characteristicValue}>{item.value}</Text>
                </View>
              )}
              scrollEnabled={false} // Disable scrolling within nested FlatList
            />
          </View>
        );
      case SECTION_TYPES.REVIEWS:
        return (
          <View
            style={styles.detailSection}
            onLayout={(event) => {
              sectionRefs.current.reviews = event.nativeEvent.layout.y;
            }}
          >
            <Text style={styles.detailSectionTitle}>{t('productDetail.tabs.reviews')}</Text>
            <ReviewsSection productId={product.id} />
          </View>
        );      
      default:
        return null;
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header onCatalogPress={handleCatalogPress} />

      <FlatList
        ref={flatListRef}
        data={sections}
        keyExtractor={item => item.id}
        renderItem={renderSection}

        contentContainerStyle={{ paddingBottom: 120 }} // Bottom padding
        showsVerticalScrollIndicator={true}
        onScrollToIndexFailed={info => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ 
              index: info.index, 
              animated: true 
            });
          });
        }}
      />
    </SafeAreaView>
  );
};

export default ProductDetailScreen;