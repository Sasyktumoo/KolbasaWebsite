import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Product, FirebaseProduct } from './ProductDetailTypes';
import styles from './ProductDetailPageDesign';
import { useLanguage } from '../../context/languages/useLanguage';
import ReviewsSection from '../../components/ReviewsSection';

// Description Section
type DescriptionSectionProps = {
  product: Product;
  firebaseProduct?: FirebaseProduct;
  currentLanguage: string;
};

export const DescriptionSection = ({ 
  product, 
  firebaseProduct, 
  currentLanguage 
}: DescriptionSectionProps) => {
  const { t } = useLanguage();
  
  return (
    <View style={styles.detailSection}>
      <Text style={styles.detailSectionTitle}>{t('productDetail.tabs.description')}</Text>
      <Text style={styles.detailText}>
        {firebaseProduct?.translations?.[currentLanguage]?.meatContentDescription || 
         product.description || 
         t('productDetail.defaultDescription')}
      </Text>
    </View>
  );
};

// Characteristics Section
type CharacteristicsSectionProps = {
  product: Product;
  firebaseProduct?: FirebaseProduct;
};

export const CharacteristicsSection = ({ 
  product, 
  firebaseProduct 
}: CharacteristicsSectionProps) => {
  // Fix: Extract currentLanguage from useLanguage hook
  const { t, currentLanguage } = useLanguage();
  
  // Build characteristics data from the Firebase product
  const characteristicsData = firebaseProduct ? [
    { 
      name: t('productDetail.characteristics.productType'), 
      // Fix: Use currentLanguage variable directly
      value: firebaseProduct.translations?.[currentLanguage]?.meatType || firebaseProduct.meatType 
    },
    { 
      name: t('productDetail.characteristics.weight'), 
      value: `${firebaseProduct.netWeight?.value || 0} ${firebaseProduct.netWeight?.unit || 'g'}` 
    },
    { 
      name: t('productDetail.characteristics.packaging'), 
      // Fix: Use currentLanguage variable directly
      value: firebaseProduct.translations?.[currentLanguage]?.packaging || firebaseProduct.packaging 
    },
    { 
      name: t('productDetail.characteristics.processingType'), 
      // Fix: Use currentLanguage variable directly
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
    <View style={styles.detailSection}>
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
};

// Reviews Section
type ReviewsSectionProps = {
  productId: string;
};

export const ReviewsSectionWrapper = ({ productId }: ReviewsSectionProps) => {
  const { t } = useLanguage();
  
  return (
    <View style={styles.detailSection}>
      <Text style={styles.detailSectionTitle}>{t('productDetail.tabs.reviews')}</Text>
      <ReviewsSection productId={productId} />
    </View>
  );
};