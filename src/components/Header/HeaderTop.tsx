import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useLanguage } from '../../context/languages/useLanguage';
import ActionIcons from './ActionsIcons';
import { styles } from './styles';

interface HeaderTopProps {
  onCatalogPress?: () => void;
}

const HeaderTop: React.FC<HeaderTopProps> = ({ onCatalogPress }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const { translate, currentLanguage } = useLanguage();
  const isMobile = Dimensions.get('window').width <= 768;
  
  // Reset search query when language changes
  useEffect(() => {
    setSearchQuery('');
  }, [currentLanguage]);

  const handleCatalogPress = () => {
    if (onCatalogPress) {
      onCatalogPress();
    } else {
      // Direct navigation to the CategoryPage instead of Home
      navigation.navigate('CategoryPage', { 
        categoryId: 'undefined',
        categoryPath: ['product_catalog'],
        categoryName: 'All Categories',
        locale: currentLanguage
      });
    }
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) {
      return; // Don't search with empty query
    }
    
    console.log('Searching for:', searchQuery);
    
    // Navigate to CategoryPage with search query parameter
    navigation.navigate('CategoryPage', { 
      categoryId: 'search',
      categoryPath: ['product_catalog', 'search'],
      categoryName: `${translate('search.results')}: ${searchQuery}`,
      locale: currentLanguage,
      searchQuery: searchQuery.trim().toLowerCase() // Pass search query as param
    });
    
    // Clear search field after searching
    setSearchQuery('');
  };

  // Mobile layout component
  const MobileHeaderLayout = () => (
    <View style={styles.mobileHeaderContainer}>
      {/* Company Info (moved to left) */}
      <View style={styles.mobileCompanyInfo}>
        <Text style={styles.mobileWebsiteTitle}>{translate('header.storeName')}</Text>
        <Text style={styles.mobilePhoneNumber}>+34 652 34 65 51</Text>
        <Text style={styles.mobileEmailText}>post@ulus.cz</Text>
      </View>

      {/* First row: Catalog and Search */}
      <View style={styles.mobileFirstRow}>
        <TouchableOpacity 
          style={styles.mobileCatalogButton} 
          onPress={handleCatalogPress}
        >
          <Text style={styles.catalogButtonText}>{translate('navigation.catalog')}</Text>
        </TouchableOpacity>
        
        <View style={styles.mobileSearchContainer}>
          <TextInput 
            style={styles.mobileSearchInput}
            placeholder={translate('search.placeholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
          />
          <TouchableOpacity style={styles.mobileSearchButton} onPress={handleSearchSubmit}>
            <Ionicons name="search" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Second row: Action Icons */}
      <View style={styles.mobileSecondRow}>
        <ActionIcons />
      </View>
    </View>
  );

  // Desktop layout
  const DesktopHeaderLayout = () => (
    <View style={styles.headerMain}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../../assets/Website_Logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      
      {/* Right section with company info and controls */}
      <View style={styles.rightSection}>
        {/* Top row with company info only */}
        <View style={styles.topRow}>
          {/* Company Info */}
          <View style={styles.headerCompanyInfo}>
            <Text style={styles.websiteTitle}>{translate('header.storeName')}</Text>
            <Text style={styles.phoneNumber}>+34 652 34 65 51</Text>
            <Text style={styles.emailText}>post@ulus.cz</Text>
          </View>
        </View>
        
        {/* Bottom row with catalog, search and user icons */}
        <View style={styles.navigationControls}>
          <TouchableOpacity 
            style={styles.catalogButton} 
            onPress={handleCatalogPress}
          >
            <Text style={styles.catalogButtonText}>{translate('navigation.catalog')}</Text>
          </TouchableOpacity>
          
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <TextInput 
                style={styles.searchInput}
                placeholder={translate('search.placeholder')}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchSubmit}
              />
            </View>
            
            <TouchableOpacity style={styles.searchButton} onPress={handleSearchSubmit}>
              <Ionicons name="search" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          {/* Action Icons Component */}
          <ActionIcons />
        </View>
      </View>
    </View>
  );

  return isMobile ? <MobileHeaderLayout /> : <DesktopHeaderLayout />;
};

export default HeaderTop;