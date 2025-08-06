import React from 'react';
import { View, Dimensions } from 'react-native';
import HeaderTop from './HeaderTop';
import NavBar from './NavBar';
import { styles } from './styles';

export interface HeaderProps {
  onCatalogPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCatalogPress }) => {
  const isWideScreen = Dimensions.get('window').width > 768;

  return (
    <View
      style={[
        styles.header,
        // Apply horizontal padding that matches the Stack.Navigator's cardStyle
        isWideScreen && {
          paddingHorizontal: Dimensions.get('window').width * 0.2,
        },
      ]}
    >
      <HeaderTop onCatalogPress={onCatalogPress} />
      <NavBar />
    </View>
  );
};

export default Header;