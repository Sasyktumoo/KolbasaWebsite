import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View,
} from 'react-native';
import TextPagesLayout from '../components/TestPagesLayout';
import { useLanguage } from '../context/languages/useLanguage';

const HomePage = () => {
  const { t } = useLanguage();
  
  return (
    <TextPagesLayout>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>{t('homepage.title')}</Text>
        
        <Text style={styles.welcomeText}>
          {t('homepage.introduction')}
        </Text>
        
        <Text style={styles.sectionTitle}>{t('homepage.advantagesTitle')}</Text>
        <View style={styles.advantagesList}>
          <Text style={styles.advantageItem}>{t('homepage.advantage1')}</Text>
          <Text style={styles.advantageItem}>{t('homepage.advantage2')}</Text>
          <Text style={styles.advantageItem}>{t('homepage.advantage3')}</Text>
          <Text style={styles.advantageItem}>{t('homepage.advantage4')}</Text>
        </View>
        
        <Text style={styles.welcomeText}>
          {t('homepage.conclusion')}
        </Text>
      </View>
    </TextPagesLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  welcomeContainer: {
    padding: 25,
    maxWidth: 800,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  advantagesList: {
    marginBottom: 20,
  },
  advantageItem: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 10,
    paddingLeft: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 25,
  },
  requisitesContainer: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3B30',
  },
  requisitesText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
    marginBottom: 8,
  }
});

export default HomePage;