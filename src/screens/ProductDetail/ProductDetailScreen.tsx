import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList,
  SafeAreaView,
  Linking,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BreadcrumbNavigation from '../../components/BreadcrumbNavigation';
import Header from '../../components/Header/Header';
import styles from './ProductDetailPageDesign';
import { useLanguage } from '../../context/languages/useLanguage';
import { useCart } from '../../context/cart/CartContext';
import { useAlert } from '../../context/AlertContext';
import { resolveImage } from '../../utils/storage';
import { PRICE_PER_KG } from '../../utils/constants';

// Import the refactored components
import {
  PhonePopup,
  CallbackRequestForm,
  WriteOptionsModal,
  EmailFormModal,
} from './ProductDetailModals';
import {
  DescriptionSection,
  CharacteristicsSection,
  ReviewsSectionWrapper,
} from './ProductDetailSections';
import ProductDetailMain from './ProductDetailMain';
import {
  Product,
  FirebaseProduct,
  ProductDetailScreenProps,
  SECTION_TYPES,
} from './ProductDetailTypes';
import { RootStackParamList } from '../../navigation/AppNavigator';

const ProductDetailScreen = ({ route }: ProductDetailScreenProps) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  // Change default quantity from 50 to 1
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const { t, currentLanguage } = useLanguage();
  const { addItem } = useCart();
  const { alert } = useAlert();
  
  // Add state to track current image index
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  
  // Add states for write to supplier functionality
  const [showWriteOptions, setShowWriteOptions] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  
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
      minOrder: 1, // Changed from 50 to 1
      image: {} 
    },
    breadcrumbPath: ['product_catalog', 'default_product']
  };
  
  // Get the Firebase product data if it exists
  const firebaseProduct = originalProduct as FirebaseProduct | undefined;
  
  // Handler for catalog button press
  const handleCatalogPress = () => {
    navigation.navigate('CategoryPage', { 
      categoryId: 'catalog',
      categoryPath: ['product_catalog'],
      categoryName: t('productDetail.productCatalog'),
      locale: currentLanguage
    });
  };

  // Update the handleAddToCart function

  const handleAddToCart = () => {
    // Use the global constant instead of hardcoded value
    // const pricePerKg = 10; <- Remove this line
    
    addItem({
      id: product.id,
      name: firebaseProduct?.translations?.[currentLanguage]?.name || product.name,
      price: PRICE_PER_KG, // Store base price per kg
      quantity: quantity,
      imageUrl: resolveImage(firebaseProduct?.imageUrls?.[0]),
      weight: {
        value: firebaseProduct?.netWeight?.value || 0,
        unit: firebaseProduct?.netWeight?.unit || 'g'
      }
    });
    
    // Show alert
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
  
  // Handle write to supplier
  const handleWriteToSupplier = () => {
    setShowWriteOptions(true);
  };
  
  // Handle WhatsApp option
  const handleWhatsAppChat = () => {
    // Close the options modal
    setShowWriteOptions(false);
    
    // Create WhatsApp URL
    const supplierPhoneNumber = "+34652346651"; // Number without spaces for WhatsApp link
    const whatsappUrl = `https://wa.me/${supplierPhoneNumber}`;
    
    // Open WhatsApp in a new tab/window (for web)
    if (Platform.OS === 'web') {
      window.open(whatsappUrl, '_blank');
    } else {
      // For mobile, we can use Linking
      Linking.openURL(whatsappUrl);
    }
  };
  
  // Handle Email option
  const handleEmailOption = () => {
    setShowWriteOptions(false);
    setShowEmailForm(true);
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

  const scrollToReviews = () => {
    setActiveTab('reviews');
    scrollToSection(6); // Index of reviews section
  };
  
  // Add this alongside the other scroll functions
  const scrollToCharacteristics = () => {
    scrollToSection(5); // Index of characteristics section
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
              style={styles.tab}
              onPress={scrollToDescription}
            >
              <Text style={styles.tabText}>
                {t('productDetail.tabs.description')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tab}
              onPress={scrollToCharacteristics}
            >
              <Text style={styles.tabText}>
                {t('productDetail.tabs.characteristics')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tab}
              onPress={scrollToReviews}
            >
              <Text style={styles.tabText}>
                {t('productDetail.tabs.reviews')}
              </Text>
            </TouchableOpacity>
          </View>
        );
      
      case SECTION_TYPES.MAIN:
        return (
          <ProductDetailMain
            product={product}
            firebaseProduct={firebaseProduct}
            quantity={quantity}
            setQuantity={setQuantity}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
            onAddToCart={handleAddToCart}
            onShowPhone={() => setShowPhonePopup(true)}
            onRequestCallback={() => setShowCallbackForm(true)}
            onWriteSupplier={handleWriteToSupplier}
          />
        );
        
      case SECTION_TYPES.DESCRIPTION:
        return (
          <DescriptionSection
            product={product}
            firebaseProduct={firebaseProduct}
            currentLanguage={currentLanguage}
          />
        );
        
      case SECTION_TYPES.CHARACTERISTICS:
        return (
          <CharacteristicsSection
            product={product}
            firebaseProduct={firebaseProduct}
          />
        );
        
      case SECTION_TYPES.REVIEWS:
        return (
          <ReviewsSectionWrapper
            productId={product.id}
          />
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
        contentContainerStyle={{ paddingBottom: 120 }}
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
      
      {/* Modals */}
      <PhonePopup 
        visible={showPhonePopup}
        onClose={() => setShowPhonePopup(false)}
      />
      
      <CallbackRequestForm 
        visible={showCallbackForm}
        onClose={() => setShowCallbackForm(false)}
        productId={product.id}
        productName={firebaseProduct?.translations?.[currentLanguage]?.name || product.name}
      />
      
      <WriteOptionsModal
        visible={showWriteOptions}
        onClose={() => setShowWriteOptions(false)}
        onSelectEmail={handleEmailOption}
        onSelectWhatsApp={handleWhatsAppChat}
      />
      
      <EmailFormModal
        visible={showEmailForm}
        onClose={() => setShowEmailForm(false)}
        productId={product.id}
        productName={firebaseProduct?.translations?.[currentLanguage]?.name || product.name}
      />
    </SafeAreaView>
  );
};

export default ProductDetailScreen;