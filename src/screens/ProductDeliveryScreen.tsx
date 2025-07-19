import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import TextPagesLayout from '../components/TestPagesLayout';
import { useLanguage } from '../context/languages/useLanguage';

// Get screen dimensions for better content display
const { width, height } = Dimensions.get('window');

const ProductDeliveryScreen = () => {
  const { t } = useLanguage();
  
  return (
    <TextPagesLayout>
        <View style={styles.content}>
          <Text style={styles.title}>{t('productDelivery.title')}</Text>
          
          <Text style={styles.paragraph}>
            {t('productDelivery.contactSection')}
          </Text>
          
          <Text style={styles.paragraph}>
            {t('productDelivery.feesSection')}
          </Text>
          
          <Text style={styles.paragraph}>
            {t('productDelivery.stairsSection')}
          </Text>
          
          <Text style={styles.boldParagraph}>
            {t('productDelivery.phoneSection')}
          </Text>
          
          <Text style={styles.paragraph}>
            {t('productDelivery.conclusion')}
          </Text>
        </View>
    </TextPagesLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  content: {
    padding: 25,
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
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
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 20,
  },
  listItem: {
    paddingLeft: 20,
    marginBottom: 10,
  }
});

export default ProductDeliveryScreen;