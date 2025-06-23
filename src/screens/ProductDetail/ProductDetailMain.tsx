import React, { Dispatch, SetStateAction } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, FirebaseProduct } from './ProductDetailTypes';
import styles from './ProductDetailPageDesign';
import { useLanguage } from '../../context/languages/useLanguage';

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
  const { t } = useLanguage();
  const pricePerKg = product.price;
  const totalPrice = (pricePerKg * quantity).toFixed(2);

  const decreaseQuantity = () => {
    if (quantity > product.minOrder) setQuantity(quantity - 1);
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
          onPress={onAddToCart}
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