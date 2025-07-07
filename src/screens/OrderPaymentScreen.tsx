import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import TextPagesLayout from '../components/TestPagesLayout';

const OrderPaymentScreen = () => {
  return (
    <TextPagesLayout>
        <View style={styles.content}>
          <Text style={styles.title}>Оплата заказов</Text>
          
          <Text style={styles.sectionTitle}>1. В нашем магазине возможны следующие способы оплаты:</Text>
          
          <View style={styles.listItem}>
            <Text style={styles.paragraph}>- наличный расчет по факту доставки,</Text>
          </View>
          
          <View style={styles.listItem}>
            <Text style={styles.paragraph}>- оплата банковской картой по факту доставки с помощью мобильного терминала,</Text>
          </View>
          
          <View style={styles.listItem}>
            <Text style={styles.paragraph}>- онлайн-оплата банковской картой при заказе*,</Text>
          </View>
          
          <View style={styles.listItem}>
            <Text style={styles.paragraph}>- безналичный расчет для юридических лиц (от 1 тыс. рублей единовременно),</Text>
          </View>
          
          <View style={styles.listItem}>
            <Text style={styles.paragraph}>- платежная система Яндекс Деньги,</Text>
          </View>
          
          <View style={styles.listItem}>
            <Text style={styles.paragraph}>- платежная система WebMoney (до 15 тыс. рублей единовременно),</Text>
          </View>
          
          <Text style={styles.paragraph}>
            При выборе способа оплаты "наличный расчет" или "оплата банковской картой по факту доставки" предоплата заказа не требуется. В остальных случаях заказ принимается в работу только после поступления денежных средств на наш счет.
          </Text>
          
          <Text style={styles.sectionTitle}>2.</Text>
          <Text style={styles.paragraph}>
            В случае, если покупатель предварительно оплатил заказ безналичным способом ил через иные платежные системы, упомянутые в п. 1, а потом отменил свой заказ, то возврат денежных средств производится в 15-дневный срок за вычетом комиссии банка или платежных систем. При этом, для отмены заказа покупателю необходимо уведомить магазин письмом по электронной почте не позднее даты, предшествующей доставке.
          </Text>
          
          <Text style={styles.paragraph}>
            При отмене заказа по вине магазина возврат предварительно перечисленных денежных средств производится без комиссии.
          </Text>
          
          <Text style={styles.noteHeading}>*</Text>
          <Text style={styles.paragraph}>
            При оплате заказа банковской картой, обработка платежа (включая ввод номера карты) происходит на защищенной странице процессинговой системы, которая прошла международную сертификацию. Это значит, что Ваши конфиденциальные данные (реквизиты карты, регистрационные данные и др.) не поступают в интернет-магазин, их обработка полностью защищена и никто, в том числе наш интернет-магазин, не может получить персональные и банковские данные клиента. При работе с карточными данными применяется
            стандарт защиты информации, разработанный международными платёжными системами Visa и Masterсard-Payment Card Industry Data Security Standard (PCI DSS), что обеспечивает безопасную обработку реквизитов Банковской карты Держателя. Применяемая технология передачи данных гарантирует безопасность по сделкам с Банковскими картами путем использования протоколов Secure Sockets Layer (SSL), Verifiedby Visa, Secure Code, и
            закрытых банковских сетей, имеющих высшую степень защиты.
          </Text>
          
          <Text style={styles.boldParagraph}>
            Уважаемые Клиенты, информируем Вас о том, что при запросе возврата денежных средств при отказе от покупки, возврат производится исключительно на ту же банковскую карту, с которой была произведена оплата.
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  noteHeading: {
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

export default OrderPaymentScreen;