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
import { changeLanguage } from '../../utils/language';
import styles from './ProductDetailPageDesign'
import ReviewsSection from '../../components/ReviewsSection';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { LanguageContext } from '../../context/languages/LanguageContext';

// Import the Header component
import Header from '../../components/Header';

// Product type definition
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  minOrder: number;
  image: any;
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
  const { t } = useTranslation();
  
  // Create refs for scrolling to sections
  const flatListRef = useRef<FlatList>(null);
  const sectionRefs = useRef({
    description: null,
    characteristics: null,
    reviews: null
  });
  
  // Get product data from navigation params
  const { product, breadcrumbPath } = route.params || { 
    product: {
      id: 'beef_shank',
      name: 'Beef Shank',
      price: 228.65,
      minOrder: 50,
      image: require('../../assets/images/placeholder.png')
    },
    breadcrumbPath: ['product_catalog', 'meat_products', 'tibia', 'beef_shank']
  };
  
  
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
    navigation.navigate('Home', { 
      locale: route.params.locale || 'en',
      categoryId: 'catalog',
      categoryPath: ['product_catalog'],
      categoryName: t('productDetail.productCatalog')
    } as any);
  };
  
  // Handle search
  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Implement search functionality
  };

  // Update the breadcrumb generation function
  const generateBreadcrumbItems = () => {
    const locale = route.params.locale || 'en';
    
    // Start with catalog
    const items = [
      {
        id: 'catalog',
        label: t('productDetail.productCatalog'),
        onPress: () => navigation.navigate('Home', { 
          categoryId: 'catalog',
          categoryPath: ['product_catalog'],
          categoryName: t('productDetail.productCatalog'),
          locale: locale
        })
      }
    ];
  
    // Build breadcrumbs from breadcrumbPath
    let currentPath = 'product_catalog';
    let pathSegments = ['product_catalog'];
    
    const pathItems = breadcrumbPath.slice(1, -1); // Skip the first and last items
    pathItems.forEach((path) => {
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
          locale
        })
      });
    });
  
    // Add the current product as the last item
    items.push({
      id: 'current-product',
      label: product.name,
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
    { type: SECTION_TYPES.OTHER_PRODUCTS, id: 'other_products' },
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
    console.log("uopa");
    setActiveTab('description');
    scrollToSection(5); // Index of description section
  };

  const scrollToCharacteristics = () => {
    setActiveTab('characteristics');
    scrollToSection(6); // Index of characteristics section
  };
    // Add this with your other scroll functions
  const scrollToReviews = () => {
    setActiveTab('reviews');
    scrollToSection(7); // Index of reviews section
  };
    
  // Render different sections based on type
  const renderSection = ({ item }) => {
    switch (item.type) {
      case SECTION_TYPES.BREADCRUMB:
        return <BreadcrumbNavigation items={generateBreadcrumbItems()} />;
      
      case SECTION_TYPES.TITLE:
        return (
          <View style={styles.titleContainer}>
            <Text style={styles.productTitle}>{product.name}</Text>
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
              onPress={() => scrollToReviews()}
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
              
              <TouchableOpacity style={styles.orderButton}>
                <Text style={styles.orderButtonText}>{t('productDetail.toOrder')}</Text>
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
        
      case SECTION_TYPES.OTHER_PRODUCTS:
        return (
          <View style={styles.otherProductsSection}>
            <Text style={styles.otherProductsTitle}>{t('productDetail.otherProducts')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailContainer}>
              {[1, 2, 3, 4, 5].map((item) => (
                <View key={item} style={styles.thumbnailWrapper}>
                  <Image
                    source={require('../../assets/images/placeholder.png')}
                    style={styles.thumbnail}
                  />
                </View>
              ))}
            </ScrollView>
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
              {product.description || t('productDetail.defaultDescription')}
            </Text>
          </View>
        );
        
      case SECTION_TYPES.CHARACTERISTICS:
        const characteristicsData = [
          { name: t('productDetail.characteristics.manufacturerArticle'), value: '2 сорт' },
          { name: t('productDetail.characteristics.weight'), value: '' },
          { name: t('productDetail.characteristics.productType'), value: t('productDetail.characteristics.soyMeat') },
          { name: t('productDetail.characteristics.supplyUnit'), value: '0 кг' },
          { name: t('productDetail.characteristics.countryOfOrigin'), value: t('productDetail.characteristics.belarus') }
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
      {/* Replace the custom header with the Header component */}
      <Header onCatalogPress={handleCatalogPress} />

      <FlatList
        ref={flatListRef}
        data={sections}
        keyExtractor={item => item.id}
        renderItem={renderSection}
        style={{ height: Dimensions.get('window').height - 100 }} // Fixed height
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