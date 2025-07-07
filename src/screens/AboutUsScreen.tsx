import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import TextPagesLayout from '../components/TestPagesLayout';
import { useTranslation } from 'react-i18next';

const AboutUsScreen = () => {
  const { t } = useTranslation();
  return (
    <TextPagesLayout>
        <View style={styles.content}>
        <Text style={styles.title}>{t('aboutUs.title')}</Text>
        
        <Text style={styles.paragraph}>
          {t('aboutUs.paragraph1')}
        </Text>
          
          <Text style={styles.sectionTitle}>{t('aboutUs.advantages')}</Text>
        <View style={styles.advantagesList}>
          <Text style={styles.advantageItem}>{t('aboutUs.advantage1')}</Text>
          <Text style={styles.advantageItem}>{t('aboutUs.advantage2')}</Text>
          <Text style={styles.advantageItem}>{t('aboutUs.advantage3')}</Text>
          <Text style={styles.advantageItem}>{t('aboutUs.advantage4')}</Text>
          <Text style={styles.advantageItem}>{t('aboutUs.advantage5')}</Text>
          <Text style={styles.advantageItem}>{t('aboutUs.advantage6')}</Text>
        </View>
          
          <Text style={styles.paragraph}>
            Приглашаем все предприятия общественного питания, а также частных лиц к сотрудничеству с нашей компанией. Попробуйте, а мы со своей стороны постараемся все исполнить с максимальной выгодой и комфортом для Вас.
          </Text>

          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Наши реквизиты:</Text>
          
          <View style={styles.requisitesContainer}>
            <Text style={styles.requisitesText}>ООО "Порт"</Text>
            <Text style={styles.requisitesText}>Почтовый адрес: 195067, Санкт-Петербург, пр. Непокоренных, 63, лит. К32, пом. 3</Text>
            <Text style={styles.requisitesText}>Юридический адрес: 195067, Санкт-Петербург, пр. Непокоренных, 63, лит. К32, пом. 3</Text>
            <Text style={styles.requisitesText}>ИНН 7804650386 КПП 780401001 ОГРН 1197847135067</Text>
            <Text style={styles.requisitesText}>р/с № 40702810203500018903 в филиале «Точка» ПАО «ФК Открытие»</Text>
            <Text style={styles.requisitesText}>к/с 30101810845250000999</Text>
            <Text style={styles.requisitesText}>БИК 044525999</Text>
          </View>
        </View>
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

export default AboutUsScreen;