import React, { Dispatch, SetStateAction } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, FirebaseProduct } from './ProductDetailTypes';
import styles from './ProductDetailPageDesign';
import { useLanguage } from '../../context/languages/useLanguage';
import { resolveImage } from '../../utils/storage';

type Props = {
  product: Product;
  firebaseProduct?: FirebaseProduct;
  quantity: number;
  setQuantity: (v: number) => void;
  currentImageIndex: number;
  setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>>;
  onAddToCart: () => void;
  onShowPhone: () => void;
  onRequestCallback: () => void;
  onWriteSupplier: () => void;
};

export default function ProductDetailMain({
  product,
  firebaseProduct,
  quantity,
  setQuantity,
  currentImageIndex,
  setCurrentImageIndex,
  onAddToCart,
  onShowPhone,
  onRequestCallback,
  onWriteSupplier,
}: Props) {
  const { t, currentLanguage } = useLanguage();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;
  
  // Fixed price of 10€ per kg
  const pricePerKg = 10;
  
  // Calculate product weight in kg
  const getWeightInKg = () => {
    if (!firebaseProduct?.netWeight) return 1; // Default weight if missing
    
    const { value, unit } = firebaseProduct.netWeight;
    
    // Convert to kg based on unit
    switch(unit.toLowerCase()) {
      case 'kg':
      case 'кг':
        return value;
      case 'g':
      case 'г':
        return value / 1000;
      default:
        return value; // If unknown unit, just use the value
    }
  };
  
  // Calculate weight per piece in kg
  const weightPerPieceInKg = getWeightInKg();
  
  // Calculate total weight for ordered quantity
  const totalWeightInKg = weightPerPieceInKg * quantity;
  
  // Calculate total price based on weight
  const totalPrice = (pricePerKg * totalWeightInKg).toFixed(2);
  
  // Get translated weight unit
  const getTranslatedUnit = (unit: string) => {
    if (!unit) return '';
    
    const unitMap = {
      'г': { 'en': 'g', 'es': 'g', 'ru': 'г' },
      'кг': { 'en': 'kg', 'es': 'kg', 'ru': 'кг' },
      'шт': { 'en': 'pcs', 'es': 'pzs', 'ru': 'шт' }
    };
    
    return unitMap[unit]?.[currentLanguage] || unit;
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const nextImage = () => {
    if (firebaseProduct?.imageUrls && firebaseProduct.imageUrls.length > 0) {
      setCurrentImageIndex((prevIndex: number) => 
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
  
  // Responsive styles for small screens
  const responsiveStyles = {
    mainProductSection: {
      flexDirection: isSmallScreen ? 'column' as const : 'row' as const,
      flexWrap: isSmallScreen ? 'nowrap' as const : 'wrap' as const,
    },
    productImageContainer: {
      width: isSmallScreen ? '100%' as const  : '40%' as const ,
    },
    purchasePanel: {
      width: isSmallScreen ? '100%' as const  : '35%' as const ,
      marginBottom: isSmallScreen ? 10 : 0,
    },
    supplierCard: {
      width: isSmallScreen ? '100%' as const  : '20%' as const ,
    },
    pricePerKg: {
      fontSize: isSmallScreen ? 14 : 28,
    },
    totalPrice: {
      fontSize: isSmallScreen ? 12 : 24,
    },
  };
  
  return (
    <View style={[styles.mainProductSection, responsiveStyles.mainProductSection]}>
      {/* Product Image */}
      <View style={[styles.productImageContainer, responsiveStyles.productImageContainer]}>
        {/* Use resolveImage here */}
        {firebaseProduct?.imageUrls && firebaseProduct.imageUrls.length > 0 ? (
          <Image
            source={{ uri: resolveImage(firebaseProduct.imageUrls[currentImageIndex]) }}
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
      <View style={[styles.purchasePanel, responsiveStyles.purchasePanel]}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>{t('productDetail.pricePerKg')}:</Text>
          <Text style={[styles.pricePerKg, responsiveStyles.pricePerKg]}>{pricePerKg}€</Text>
        </View>
        
     
        
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
              const value = parseInt(text);
              if (!isNaN(value) && value >= 1) {
                setQuantity(value);
              } else if (text === '') {
                setQuantity(1);
              }
            }}
            selectTextOnFocus={true}
          />
          <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        
        {/* Display total weight in kg */}
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>{t('productDetail.totalWeight')}:</Text>
          <Text style={[styles.totalPrice, responsiveStyles.totalPrice]}>
            {totalWeightInKg.toFixed(2)} {getTranslatedUnit('кг')}
          </Text>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>{t('productDetail.totalPrice')}:</Text>
          <Text style={[styles.totalPrice, responsiveStyles.totalPrice]}>{totalPrice}€</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.orderButton}
          onPress={onAddToCart}
        >
          <Text style={styles.orderButtonText}>{t('cart.addToCart')}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Supplier Card */}
      <View style={[styles.supplierCard, responsiveStyles.supplierCard]}>
        <Text style={styles.supplierName}>Vyacheslav Nikolaevich Tyulenev</Text>
        <View style={styles.supplierBadge}>
          <Text style={styles.supplierBadgeText}>{t('productDetail.producer')}</Text>
        </View>
        
        {/* Write to supplier button */}
        <TouchableOpacity 
          style={styles.writeToSupplierButton}
          onPress={onWriteSupplier}
        >
          <Ionicons name="mail-outline" size={18} color="#FF3B30" />
          <Text style={styles.writeToSupplierText}>{t('productDetail.writeToSupplier')}</Text>
        </TouchableOpacity>
        
        {/* Show phone number */}
        <TouchableOpacity 
          style={styles.phoneButton}
          onPress={onShowPhone}
        >
          <Ionicons name="call-outline" size={18} color="#FF3B30" />
          <Text style={styles.phoneButtonText}>{t('productDetail.showPhoneNumber')}</Text>
        </TouchableOpacity>
        
        {/* Request callback */}
        <TouchableOpacity 
          style={styles.phoneButton}
          onPress={onRequestCallback}
        >
          <Ionicons name="call-outline" size={18} color="#FF3B30" />
          <Text style={styles.phoneButtonText}>{t('productDetail.requestCallback')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}