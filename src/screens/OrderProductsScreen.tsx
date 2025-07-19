import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import TextPagesLayout from '../components/TestPagesLayout';
import { useLanguage } from '../context/languages/useLanguage';

const OrderProductsScreen = () => {
  const { t } = useLanguage();
  
  return (
    <TextPagesLayout>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('orderProducts.title')}</Text>
          
          <Text style={styles.paragraph}>
            {t('orderProducts.introduction')}
          </Text>
          
          <Text style={styles.paragraph}>
            {t('orderProducts.cartProcess')}
          </Text>
          
          <Text style={styles.paragraph}>
            {t('orderProducts.checkoutProcess')}
          </Text>
          
          <Text style={styles.paragraph}>
            {t('orderProducts.afterOrder')}
          </Text>
          
          <Text style={styles.boldParagraph}>
            {t('orderProducts.contactImportance')}
          </Text>
          
          <Text style={styles.paragraph}>
            {t('orderProducts.orderMethods')}
          </Text>
          
          <Text style={styles.paragraph}>
            {t('orderProducts.holidays')}
          </Text>
        </View>
      </ScrollView>
    </TextPagesLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 25,
    maxWidth: 800,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 20,
  },
  boldParagraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    fontWeight: 'bold',
    marginBottom: 20,
  }
});

export default OrderProductsScreen;