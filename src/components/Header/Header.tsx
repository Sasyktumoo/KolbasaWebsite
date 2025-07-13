import React from 'react';
import { View } from 'react-native';
import HeaderTop from './HeaderTop';
import NavBar from './NavBar';
import { styles } from './styles';

export interface HeaderProps {
  onCatalogPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCatalogPress }) => {
  return (
    <View style={styles.header}>
      <HeaderTop onCatalogPress={onCatalogPress} />
      <NavBar />
    </View>
  );
};

export default Header;