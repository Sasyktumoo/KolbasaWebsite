import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import TextPagesLayout from '../components/TestPagesLayout';

const PremiumProgramScreen = () => {
  return (
    <TextPagesLayout>
        <View style={styles.content}>
          <Text style={styles.title}>Премиальная программа</Text>
          
          <Text style={styles.paragraph}>
            Мы предлагаем всем покупателям стать партнерами по продвижению услуг нашей компании и получать за это скидки на покупки. Что для этого требуется?
          </Text>
          
          <Text style={styles.listItem}>1. Необходимо зарегистрироваться на сайте (см. кнопку "Регистрация" слева вверху страницы).</Text>
          
          <Text style={styles.listItem}>2. После регистрации нажать на кнопку "Участвовать в премиальной программе".</Text>
          
          <Text style={styles.listItem}>3. После этого снова войти в свой личный кабинет.</Text>
          
          <Text style={styles.listItem}>
            4. Справа вы увидите кнопку "Реферальный код". Нажав на нее, Вы увидите ссылку на главную страницу нашего сайта, привязанную в Вашей учетной записи. Скопируйте ее и распространяйте среди своих друзей и знакомых. Каждый, кто зашел на сайт по этой ссылке и зарегистрировался в магазине, становится Вашим рефералом, то есть покупателем, приносящим Вам дополнительный доход.
          </Text>
          
          <Text style={styles.listItem}>
            5. В настоящее время ставка партнерского вознаграждения составляет 1% от суммы покупок реферала без учета стоимости доставки. Эти бонусные баллы накапливаются на Вашем счете и могут быть использованы на покупки в нашем магазине.
          </Text>
          
          <Text style={styles.listItem}>
            6. Чтобы использовать бонусные балы на покупки в магазине, надо при оформлении заказа отметить галочкой пункт "Использовать бонусные баллы". В этом случае сумма оплаты за заказ автоматически уменьшится на сумму списанных баллов.
          </Text>
          
          <Text style={styles.conclusion}>
            Удачных покупок!
          </Text>
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
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 15,
    paddingLeft: 15,
  },
  conclusion: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
    textAlign: 'center',
  }
});

export default PremiumProgramScreen;