import React from 'react';
import {
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useLanguage } from '../../context/languages/useLanguage';
import { styles } from './styles';

const NavBar: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { translate } = useLanguage();

  // Navigation options with translated text
  const navigationOptions = [
    { id: 'about', name: translate('navigation.aboutUs'), route: 'AboutUs' },
    { id: 'order', name: translate('navigation.orderProducts'), route: 'OrderProducts' },
    { id: 'delivery', name: translate('navigation.productDelivery'), route: 'ProductDelivery' },
    { id: 'payment', name: translate('navigation.orderPayment'), route: 'OrderPayment' },
    //{ id: 'dummy', name: "dummy", route: 'Dummy' }
  ];

  return (
    <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.navOptionsBar}
      contentContainerStyle={styles.navOptionsContainer}
    >
      {navigationOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.navOption,
            Dimensions.get('window').width <= 768 && styles.navOptionMobile
          ]}
          onPress={() => navigation.navigate(option.route as keyof RootStackParamList)}
        >
          <Text style={[
            styles.navOptionText,
            Dimensions.get('window').width <= 768 && styles.navOptionTextMobile
          ]}>{option.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default NavBar;