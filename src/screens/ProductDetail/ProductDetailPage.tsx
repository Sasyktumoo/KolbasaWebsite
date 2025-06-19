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
  Dimensions,
  Platform,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BreadcrumbNavigation from '../../components/BreadcrumbNavigation';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import styles from './ProductDetailPageDesign'
import ReviewsSection from '../../components/ReviewsSection';
import Header from '../../components/Header';
import { useLanguage } from '../../context/languages/useLanguage';
import { useCart } from '../../context/cart/CartContext';
import { useAlert } from '../../context/AlertContext'; // Add this import
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import emailService from '../../services/EmailService';

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
  const { alert } = useAlert(); // Add this line
  // Add state to track current image index
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackComments, setCallbackComments] = useState('');
  const [sendingCallbackRequest, setSendingCallbackRequest] = useState(false);
  
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
      image: {}
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
  const nextImage = () => {
    if (firebaseProduct?.imageUrls && firebaseProduct.imageUrls.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === firebaseProduct.imageUrls.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (firebaseProduct?.imageUrls && firebaseProduct.imageUrls.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? firebaseProduct.imageUrls.length - 1 : prevIndex - 1
      );
    }
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
          <View style={styles.mainProductSection}>
            {/* Product Image */}
            <View style={styles.productImageContainer}>
              {/* Display current image from imageUrls if available */}
              {firebaseProduct?.imageUrls && firebaseProduct.imageUrls.length > 0 ? (
                <Image
                  source={{ uri: firebaseProduct.imageUrls[0] }}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.productImage, styles.placeholderContainer]}>
                  <Ionicons name="image-outline" size={80} color="#cccccc" />
                </View>
              )}
              
              {/* Image navigation controls - only show if multiple images exist */}
              {firebaseProduct?.imageUrls && firebaseProduct.imageUrls.length > 1 && (
                <View style={styles.imageNavigation}>
                  <TouchableOpacity 
                    style={styles.imageNavButton}
                    onPress={prevImage}
                  >
                    <Ionicons name="chevron-back" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                  
                  <View style={styles.imageDots}>
                    {firebaseProduct.imageUrls.map((_, index) => (
                      <View 
                        key={`dot-${index}`} 
                        style={[
                          styles.imageDot, 
                          currentImageIndex === index && styles.activeImageDot
                        ]} 
                      />
                    ))}
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.imageNavButton}
                    onPress={nextImage}
                  >
                    <Ionicons name="chevron-forward" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              )}
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
              
              {/* Keep the write to supplier button */}
              <TouchableOpacity style={styles.writeToSupplierButton}>
                <Ionicons name="mail-outline" size={18} color="#FF3B30" />
                <Text style={styles.writeToSupplierText}>{t('productDetail.writeToSupplier')}</Text>
              </TouchableOpacity>
              
              {/* Show phone number - now opens popup */}
              <TouchableOpacity 
                style={styles.phoneButton}
                onPress={() => setShowPhonePopup(true)}
              >
                <Ionicons name="call-outline" size={18} color="#FF3B30" />
                <Text style={styles.phoneButtonText}>{t('productDetail.showPhoneNumber')}</Text>
              </TouchableOpacity>
              
              {/* Request callback - now triggers callback request */}
              <TouchableOpacity 
                style={styles.phoneButton}
                onPress={handleRequestCallback}
              >
                <Ionicons name="call-outline" size={18} color="#FF3B30" />
                <Text style={styles.phoneButtonText}>{t('productDetail.requestCallback')}</Text>
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
  
  // Phone popup component
  const PhonePopup = ({ visible, onClose }) => {
    if (!visible) return null;
    
    // Sample phone number - you can replace with actual data from supplier
    const phoneNumber = "+34 652 346 651";
    
    return (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 10,
          padding: 20,
          width: '80%',
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 15,
          }}>{t('productDetail.phoneNumber')}</Text>
          
          <Text style={{
            fontSize: 22,
            fontWeight: 'bold',
            marginBottom: 20,
            color: '#FF3B30',
          }}>{phoneNumber}</Text>
          
          <TouchableOpacity 
            style={{
              backgroundColor: '#FF3B30',
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 5,
            }} 
            onPress={onClose}
          >
            <Text style={{
              color: 'white',
              fontWeight: 'bold',
            }}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Callback Request Form component
  const CallbackRequestForm = ({ visible, onClose }) => {
    if (!visible) return null;
    
    const handleSubmitCallback = async () => {
      // Validate phone number
      if (!callbackPhone.trim()) {
        alert(
          t('productDetail.invalidPhoneTitle') || 'Invalid Phone',
          t('productDetail.invalidPhoneMessage') || 'Please enter a valid phone number.',
          [{ text: t('common.ok') || 'OK', style: 'default' }]
        );
        return;
      }
      
      setSendingCallbackRequest(true);
      
      try {
        // Create callback request data
        const callbackRequest = {
          productId: product.id,
          productName: firebaseProduct?.translations?.[currentLanguage]?.name || product.name,
          phone: callbackPhone,
          comments: callbackComments,
          requestedAt: new Date().toISOString(),
        };
        
        // Save to Firestore
        const db = getFirestore();
        await addDoc(collection(db, 'callbackRequests'), callbackRequest);
        
        // Send email notification if on web platform
        if (Platform.OS === 'web') {
          try {
            await emailService.initialize();
            
            // Prepare callback email data
            const callbackEmailData = {
              type: 'callback' as 'callback', // Use type assertion to ensure it's the literal type
              customer: {
                name: 'Customer', // We don't collect name for callbacks
                email: 'sasyktumoo@gmail.com', // Send to supplier email
                phone: callbackPhone,
              },
              product: {
                id: product.id,
                name: firebaseProduct?.translations?.[currentLanguage]?.name || product.name,
              },
              comments: callbackComments,
            };
            
            // Send callback request email
            await emailService.sendCallbackRequest(callbackEmailData);
          } catch (emailError) {
            console.error("Failed to send callback request email:", emailError);
            // Don't show error to user as the request was still saved
          }
        }
        
        // Show success message and close form
        alert(
          t('productDetail.callbackRequestTitle') || 'Request Callback',
          t('productDetail.callbackRequestMessage') || 'Your callback request has been sent to the supplier. They will contact you shortly.',
          [{ text: t('common.ok') || 'OK', onPress: onClose }]
        );
        
        // Reset form
        setCallbackPhone('');
        setCallbackComments('');
        
      } catch (error) {
        console.error('Error submitting callback request:', error);
        alert(
          t('productDetail.callbackErrorTitle') || 'Request Failed',
          t('productDetail.callbackErrorMessage') || 'We encountered an error sending your request. Please try again later.',
          [{ text: t('common.ok') || 'OK', style: 'default' }]
        );
      } finally {
        setSendingCallbackRequest(false);
      }
    };
    
    return (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 10,
          padding: 20,
          width: '80%',
          maxWidth: 400,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'center',
          }}>{t('productDetail.requestCallbackTitle')}</Text>
          
          <Text style={{
            fontSize: 14,
            marginBottom: 5,
          }}>{t('productDetail.phoneNumberLabel')}*</Text>
          
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 5,
              padding: 10,
              marginBottom: 15,
              fontSize: 16,
            }}
            value={callbackPhone}
            onChangeText={setCallbackPhone}
            placeholder="+7 (___) ___-____"
            keyboardType="phone-pad"
          />
          
          <Text style={{
            fontSize: 14,
            marginBottom: 5,
          }}>{t('productDetail.commentsLabel')}</Text>
          
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 5,
              padding: 10,
              marginBottom: 20,
              fontSize: 16,
              height: 100,
              textAlignVertical: 'top',
            }}
            value={callbackComments}
            onChangeText={setCallbackComments}
            placeholder={t('productDetail.commentsPlaceholder')}
            multiline={true}
            numberOfLines={4}
          />
          
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
            <TouchableOpacity 
              style={{
                backgroundColor: '#f2f2f2',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 5,
                flex: 1,
                marginRight: 10,
                alignItems: 'center',
              }} 
              onPress={onClose}
              disabled={sendingCallbackRequest}
            >
              <Text style={{
                color: '#333',
                fontWeight: 'bold',
              }}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{
                backgroundColor: '#FF3B30',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 5,
                flex: 1,
                alignItems: 'center',
                opacity: sendingCallbackRequest ? 0.7 : 1,
              }} 
              onPress={handleSubmitCallback}
              disabled={sendingCallbackRequest}
            >
              {sendingCallbackRequest ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={{
                  color: 'white',
                  fontWeight: 'bold',
                }}>{t('common.submit')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  
  // Handler for request callback button
  const handleRequestCallback = () => {
    setShowCallbackForm(true);
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
      
      {/* Add Phone Popup */}
      <PhonePopup 
        visible={showPhonePopup}
        onClose={() => setShowPhonePopup(false)}
      />
      
      {/* Add Callback Request Form */}
      <CallbackRequestForm 
        visible={showCallbackForm}
        onClose={() => setShowCallbackForm(false)}
      />
    </SafeAreaView>
  );
};

export default ProductDetailScreen;