import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import TextPagesLayout from '../components/TestPagesLayout';

// Get screen dimensions for better content display
const { width, height } = Dimensions.get('window');

const ProductDeliveryScreen = () => {
  return (
    <TextPagesLayout>
        <View style={styles.content}>
          <Text style={styles.title}>Доставка продуктов</Text>
          
          <Text style={styles.paragraph}>
            Доставка продуктов из нашего магазина возможна в пределах Санкт-Петербурга и Ленинградской области. Стоимость ее определяется исходя из объема заказа и удаленности пункта назначения. Принцип простой: чем больше Вы заказали, тем дешевле транспортные услуги. Как показывает наш многолетний опыт работы, обширный ассортимент позволяет покупателю легко набрать заказ на бесплатную доставку.
          </Text>
          
          <Text style={styles.sectionTitle}>1.</Text>
          <Text style={styles.paragraph}>
            Развозка заказов производится ежедневно по рабочим дням. В отдельных случаях мы можем доставить товар и в выходные дни, но в этом случае просьба указать свои пожелания заранее. При длительных праздниках режим работы устанавливается дополнительно. Время доставки обычно согласовывается с покупателями в пределах 1-2 часов желаемого диапазона, в интервале с 13 до 22 часов. Прием заказов через сайт осуществляется ежедневно и круглосуточно, по телефону - с 9 до 20 часов. Если Вы хотите получить товар в день заказа, то заявку нужно отправить до 11 часов. По сложившейся практике работы мы часто принимаем заявки на текущий день и при более позднем их поступлении. Оператор в любом случае свяжется с Вами и скорее всего мы найдем оптимальное решение.
          </Text>
          
          <Text style={styles.sectionTitle}>2.</Text>
          <Text style={styles.paragraph}>
            Стоимость доставки. При заказе на сумму до 2500 руб. стоимость доставки – 1000 рублей в пределах КАД Санкт-Петербурга, от 2500 руб. до 5000 руб. – 750 руб., от 5000 руб. до 7500 руб. – 500 руб., от 7500 руб. до 10000 руб. – 250 руб., от 10000 руб. – бесплатно. В пригороды и по области стоимость доставки оговаривается дополнительно в зависимости от удаленности от города.
          </Text>
          
          <Text style={styles.paragraph}>
            В частности, по ближайшим пригородам Санкт-Петербурга (Павловск, Пушкин, Всеволожск, Колпино, Петродворец, Красное Село, Ломоносов, Сестрорецк) стоимость доставки следующая: при заказе на сумму до 2500 руб. стоимость доставки – 2000 рублей, от 2500 руб. до 5000 руб. – 1750 руб., от 5000 руб. до 7500 руб. - 1500 руб., от 7500 руб. до 10000 руб. - 1250 руб., от 10000 руб. до 12500 руб. - 1000 руб., от 12500 руб. до 15000 руб. - 750 руб., от 15000 руб. до 17500 руб. - 500 руб., от 17500 руб. до 20000 руб. - 250 руб., от 20000 руб. – бесплатно.
          </Text>
          
          <Text style={styles.sectionTitle}>3.</Text>
          <Text style={styles.paragraph}>
            При доставке частным лицам в многоквартирные дома дополнительно оплачивается подъем грузов на этажи:
          </Text>
          
          <View style={styles.listItem}>
            <Text style={styles.paragraph}>- до лифта, при заказе весом до 25 кг - бесплатно,</Text>
          </View>
          
          <View style={styles.listItem}>
            <Text style={styles.paragraph}>- до лифта при заказе весом 25 кг и выше - 100 руб.,</Text>
          </View>
          
          <View style={styles.listItem}>
            <Text style={styles.paragraph}>- при наличии лифта подъем на этажи - бесплатно,</Text>
          </View>
          
          <View style={styles.listItem}>
            <Text style={styles.paragraph}>- при отсутствии лифта при заказе весом до 25 кг - 50 руб. за этаж,</Text>
          </View>
          
          <View style={styles.listItem}>
            <Text style={styles.paragraph}>- при отсутствии лифта при заказе весом 25 кг и выше - 100 руб. за этаж.</Text>
          </View>
          
          <Text style={styles.sectionTitle}>4.</Text>
          <Text style={styles.paragraph}>
            Самовывоз товара возможен по рабочим дням с 9 до 13 часов по адресу: пр. Непокоренных, 63, склад 32/3, тел. склада 965-55-81. Просим принять во внимание, что товары, заказанные по самовывозу, не оплаченные и не вывезенные со склада в согласованный день, могут быть сняты с резервирования и будут доступны для продажи другим покупателям.
          </Text>
          
          <Text style={styles.sectionTitle}>5.</Text>
          <Text style={styles.boldParagraph}>
            Убедительная просьба указывать корректные номера контактных телефонов и отвечать на контрольные звонки наших сотрудников. При отсутствии обратной связи Ваш заказ отправлен не будет.
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