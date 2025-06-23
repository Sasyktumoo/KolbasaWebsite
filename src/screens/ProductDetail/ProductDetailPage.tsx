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
  ActivityIndicator,
  Linking,
  TouchableWithoutFeedback
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
  
  // Add new states for write to supplier functionality
  const [showWriteOptions, setShowWriteOptions] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [emailSenderName, setEmailSenderName] = useState('');
  const [emailSenderEmail, setEmailSenderEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  
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
                  source={{ uri: firebaseProduct.imageUrls[currentImageIndex] }}
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
              <TouchableOpacity 
                style={styles.writeToSupplierButton}
                onPress={handleWriteToSupplier} // Update with the new handler
              >
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
            name: t('productDetail.characteristics.packaging'), 
            value: firebaseProduct.translations?.[currentLanguage]?.packaging || firebaseProduct.packaging 
          },
          { 
            name: t('productDetail.characteristics.processingType'), 
            value: firebaseProduct.translations?.[currentLanguage]?.processingType?.join(', ') || 
                  firebaseProduct.processingType?.join(', ') || 'N/A'
          },
          { 
            name: t('productDetail.characteristics.storageTemperature'), 
            value: `${firebaseProduct.storageTemperature?.min || 0}°C to ${firebaseProduct.storageTemperature?.max || 0}°C` 
          },
          { 
            name: t('productDetail.characteristics.shelfLife'), 
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
    const phoneNumber = "+34 652 34 66 51";

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{t('productDetail.phoneNumber')}</Text>
          <Text style={styles.modalPhoneNumber}>{phoneNumber}</Text>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Callback Request Form component
  const CallbackRequestForm = ({ visible, onClose }) => {
    // Add refs for maintaining focus
    const phoneInputRef = useRef(null);
    const commentsInputRef = useRef(null);
    
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
          type: 'callback' as const,
          product: {
            id: product.id,
            name: firebaseProduct?.translations?.[currentLanguage]?.name || product.name,
          },
          customer: {
            name: 'Customer', // We don't collect name for callbacks
            email: 'supplier@example.com', // Send to supplier email
            phone: callbackPhone,
          },
          comments: callbackComments,
          language: currentLanguage // Add the language parameter
        };
        
        // Save to Firestore
        const db = getFirestore();
        await addDoc(collection(db, 'callbackRequests'), callbackRequest);
        
        // Send email notification if on web platform
        if (Platform.OS === 'web') {
          try {
            await emailService.initialize();
            
            // Send callback request email with language parameter
            await emailService.sendCallbackRequest(callbackRequest);
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('productDetail.requestCallbackTitle')}</Text>
          
          <Text style={styles.formLabel}>{t('productDetail.phoneNumberLabel')}*</Text>
          <TextInput
            ref={phoneInputRef}
            style={styles.formInput}
            value={callbackPhone}
            onChangeText={setCallbackPhone}
            placeholder="+7 (___) ___-____"
            keyboardType="phone-pad"
            autoFocus={true}
          />
          
          <Text style={styles.formLabel}>{t('productDetail.commentsLabel')}</Text>
          <TextInput
            ref={commentsInputRef}
            style={styles.formTextArea}
            value={callbackComments}
            onChangeText={setCallbackComments}
            placeholder={t('productDetail.commentsPlaceholder')}
            multiline={true}
            numberOfLines={4}
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              disabled={sendingCallbackRequest}
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.submitButton, { opacity: sendingCallbackRequest ? 0.7 : 1 }]} 
              onPress={handleSubmitCallback}
              disabled={sendingCallbackRequest}
            >
              {sendingCallbackRequest ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.modalButtonText}>{t('common.submit')}</Text>
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
  
  // Constants
  const supplierPhoneNumber = "+34652346651"; // Number without spaces for WhatsApp link
  const displayPhoneNumber = "+34 652 346 651"; // Formatted for display
  
  // Handle write to supplier button click
  const handleWriteToSupplier = () => {
    setShowWriteOptions(true);
  };
  
  // Handle WhatsApp option
  const handleWhatsAppChat = () => {
    // Close the options modal
    setShowWriteOptions(false);
    
    // Create WhatsApp URL
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
  
  // Handle sending email
  const handleSendEmail = async () => {
    // Validate form
    if (!emailSenderName.trim() || !emailSenderEmail.trim() || !emailMessage.trim()) {
      alert(
        t('productDetail.invalidFormTitle') || 'Incomplete Form',
        t('productDetail.invalidFormMessage') || 'Please fill in all required fields.',
        [{ text: t('common.ok') || 'OK', style: 'default' }]
      );
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailSenderEmail)) {
      alert(
        t('productDetail.invalidEmailTitle') || 'Invalid Email',
        t('productDetail.invalidEmailMessage') || 'Please enter a valid email address.',
        [{ text: t('common.ok') || 'OK', style: 'default' }]
      );
      return;
    }
    
    setSendingEmail(true);
    
    try {
      // Create email data
      const messageData = {
        type: 'message' as const,
        sender: {
          name: emailSenderName,
          email: emailSenderEmail,
        },
        supplier: {
          email: 'sasyktumoo@gmail.com',
          phoneNumber: displayPhoneNumber,
        },
        product: {
          id: product.id,
          name: firebaseProduct?.translations?.[currentLanguage]?.name || product.name,
        },
        message: emailMessage,
        language: currentLanguage // Add the language parameter
      };
      
      // Save to Firestore
      const db = getFirestore();
      await addDoc(collection(db, 'supplierMessages'), {
        ...messageData,
        sentAt: new Date().toISOString(),
      });
      
      // Send email notification if on web platform
      if (Platform.OS === 'web') {
        try {
          await emailService.initialize();
          
          // Send email using EmailService with language parameter
          await emailService.sendSupplierMessage(messageData);
        } catch (emailError) {
          console.error("Failed to send supplier message email:", emailError);
          // Don't show error to user as the message was still saved to Firestore
        }
      }
      
      // Show success message and close form
      alert(
        t('productDetail.messageSentTitle') || 'Message Sent',
        t('productDetail.messageSentMessage') || 'Your message has been sent to the supplier. They will contact you soon.',
        [{ text: t('common.ok') || 'OK', onPress: () => setShowEmailForm(false) }]
      );
      
      // Reset form
      setEmailSenderName('');
      setEmailSenderEmail('');
      setEmailMessage('');
      
    } catch (error) {
      console.error('Error sending message to supplier:', error);
      alert(
        t('productDetail.messageErrorTitle') || 'Message Failed',
        t('productDetail.messageErrorMessage') || 'We encountered an error sending your message. Please try again later.',
        [{ text: t('common.ok') || 'OK', style: 'default' }]
      );
    } finally {
      setSendingEmail(false);
    }
  };
  
  // Write Options Modal component
  const WriteOptionsModal = ({ visible, onClose }) => {
    if (!visible) return null;
    
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('productDetail.contactOptionsTitle') || 'Contact Options'}</Text>
          
          <TouchableOpacity style={styles.emailButton} onPress={handleEmailOption}>
            <Ionicons name="mail-outline" size={20} color="white" style={styles.iconMargin} />
            <Text style={styles.iconButtonText}>{t('productDetail.sendEmail') || 'Send Email'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.whatsAppButton} onPress={handleWhatsAppChat}>
            <Ionicons name="logo-whatsapp" size={20} color="white" style={styles.iconMargin} />
            <Text style={styles.iconButtonText}>{t('productDetail.whatsAppChat') || 'WhatsApp Chat'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>{t('common.cancel') || 'Cancel'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Email Form Modal component
  const EmailFormModal = ({ visible, onClose }) => {
    // Add refs for maintaining focus
    const nameInputRef = useRef(null);
    const emailInputRef = useRef(null);
    const messageInputRef = useRef(null);
    
    if (!visible) return null;
    
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.largeModalContent}>
          <Text style={styles.modalTitle}>{t('productDetail.writeToSupplier')}</Text>
          
          <Text style={styles.formLabel}>{t('productDetail.yourNameLabel') || 'Your Name'}*</Text>
          <TextInput
            ref={nameInputRef}
            style={styles.formInput}
            value={emailSenderName}
            onChangeText={setEmailSenderName}
            placeholder={t('productDetail.yourNamePlaceholder') || 'Enter your name'}
          />
          
          <Text style={styles.formLabel}>{t('productDetail.yourEmailLabel') || 'Your Email'}*</Text>
          <TextInput
            ref={emailInputRef}
            style={styles.formInput}
            value={emailSenderEmail}
            onChangeText={setEmailSenderEmail}
            placeholder={t('productDetail.yourEmailPlaceholder') || 'Enter your email'}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Text style={styles.formLabel}>{t('productDetail.messageLabel') || 'Message'}*</Text>
          <TextInput
            ref={messageInputRef}
            style={styles.largeTextArea}
            value={emailMessage}
            onChangeText={setEmailMessage}
            placeholder={t('productDetail.messagePlaceholder') || 'Enter your message'}
            multiline={true}
            numberOfLines={6}
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              disabled={sendingEmail}
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel') || 'Cancel'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.submitButton, { opacity: sendingEmail ? 0.7 : 1 }]} 
              onPress={handleSendEmail}
              disabled={sendingEmail}
            >
              {sendingEmail ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.modalButtonText}>{t('common.send') || 'Send'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
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
      
      {/* Add Write Options Modal */}
      <WriteOptionsModal
        visible={showWriteOptions}
        onClose={() => setShowWriteOptions(false)}
      />
      
      {/* Add Email Form Modal */}
      <EmailFormModal
        visible={showEmailForm}
        onClose={() => setShowEmailForm(false)}
      />
    </SafeAreaView>
  );
};

export default ProductDetailScreen;