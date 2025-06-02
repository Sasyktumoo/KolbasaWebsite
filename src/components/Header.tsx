import React, { useState, useRef, useContext, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Platform,
  ScrollView,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { useUser } from '../context/UserContext';
import { LanguageContext } from '../context/languages/LanguageContext';
import { useTranslation } from 'react-i18next';
import SearchBar from './SearchBar';
import { useLanguage } from '../context/languages/useLanguage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useCart } from '../context/cart/CartContext';


interface HeaderProps {
  onCatalogPress?: () => void;
}

const Header = ({ onCatalogPress }: HeaderProps) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [dropdownAnimation] = useState(new Animated.Value(0));
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useUser();
  const { translate, changeLanguage, currentLanguage } = useLanguage();
  const { getTotalItems } = useCart();
  
  const toggleDropdown = () => {
    if (isDropdownVisible) {
      // Close dropdown with animation
      Animated.timing(dropdownAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start(() => setIsDropdownVisible(false));
    } else {
      // Open dropdown with animation
      setIsDropdownVisible(true);
      Animated.timing(dropdownAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  };
  
  // Toggle between English and Russian
  const toggleLanguageHandler = () => {
    // Get the current language directly from context to avoid closure issues
    const newLanguage = currentLanguage === 'en' ? 'ru' : 'en';
    console.log(`Toggle: current=${currentLanguage}, new=${newLanguage}`);
    changeLanguage(newLanguage);
  };

  // Debug whenever currentLanguage changes
  useEffect(() => {
    console.log('Header language updated:', currentLanguage);
  }, [currentLanguage]);
  
  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Implement search functionality here
  };

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

  const handleLanguageChange = (lang: string) => {
    changeLanguage(lang);
  };

  const handleSearchSubmit = () => {
    console.log('Search query:', searchQuery);
    // Implement search functionality
  };

  // Navigation options with translated text
  const navigationOptions = [
    { id: 'about', name: translate('navigation.aboutUs'), route: 'AboutUs' },
    { id: 'order', name: translate('navigation.orderProducts'), route: 'OrderProducts' },
    { id: 'delivery', name: translate('navigation.productDelivery'), route: 'ProductDelivery' },
    { id: 'payment', name: translate('navigation.orderPayment'), route: 'OrderPayment' },
    { id: 'faq', name: translate('navigation.faq'), route: 'FAQ' },
    { id: 'premium', name: translate('navigation.premiumProgram'), route: 'PremiumProgram' },
    { id: 'news', name: translate('navigation.news'), route: 'News' },
    { id: 'feedback', name: translate('navigation.feedback'), route: 'Feedback' },
    { id: 'dummy', name: "dummy", route: 'Dummy' }
  ];
  
  // Helper function to get language display text
  const getLanguageDisplay = () => {
    console.log('Rendering language display with:', currentLanguage);
    return currentLanguage === 'en' ? 'En | $' : 'Ru | ₽';
  };
  
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => navigation.navigate('Home', { locale: currentLanguage })}>
          <Text style={styles.logoText}>{translate('header.storeName')}</Text>
        </TouchableOpacity>

        <View style={styles.headerCompanyInfo}>
          <Text style={styles.phoneNumber}>{translate('header.phoneNumber')}</Text>
          <Text style={styles.emailText}>{translate('header.email')}</Text>
          
          {/* Language selector */}
          <View style={styles.languageSelector}>
            <TouchableOpacity onPress={() => handleLanguageChange('en')}>
              <Text style={[styles.languageText, currentLanguage === 'en' && styles.activeLanguage]}>EN</Text>
            </TouchableOpacity>
            <Text style={styles.languageSeparator}>|</Text>
            <TouchableOpacity onPress={() => handleLanguageChange('ru')}>
              <Text style={[styles.languageText, currentLanguage === 'ru' && styles.activeLanguage]}>RU</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.icon}>
            <Ionicons name="heart-outline" size={24} color="#333" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.icon}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="cart-outline" size={24} color="#333" />
            {getTotalItems() > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {user ? (
            // User is logged in - show profile and logout options
            <TouchableOpacity 
              style={styles.icon}
              onPress={toggleDropdown}
            >
              <Ionicons name="person-circle-outline" size={24} color="#FF3B30" />
              
              {isDropdownVisible && (
                <Animated.View 
                  style={[
                    styles.dropdown,
                    {
                      opacity: dropdownAnimation,
                      transform: [{
                        translateY: dropdownAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10, 0]
                        })
                      }]
                    }
                  ]}
                >
                  <TouchableOpacity 
                    style={styles.dropdownItem}
                    onPress={() => {
                      toggleDropdown();
                      navigation.navigate('Profile');
                    }}
                  >
                    <Text style={styles.dropdownText}>{translate('auth.profile')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.dropdownItem}
                    onPress={() => {
                      toggleDropdown();
                      handleLogout();
                    }}
                  >
                    <Text style={styles.dropdownText}>{translate('auth.logout')}</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </TouchableOpacity>
          ) : (
            // User is not logged in - show login/register button
            <TouchableOpacity 
              style={styles.icon}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>{translate('auth.loginRegister')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.navigationBar}>
        <TouchableOpacity style={styles.catalogButton} onPress={handleCatalogPress}>
          <Text style={styles.catalogButtonText}>{translate('navigation.catalog')}</Text>
        </TouchableOpacity>
        
        <View style={styles.searchBar}>
          <TextInput 
            style={styles.searchInput}
            placeholder={translate('search.placeholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
          />
        </View>
        
        <TouchableOpacity style={styles.geographyButton}>
          <Ionicons name="location-outline" size={24} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchSubmit}>
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* New navigation options bar */}
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.navOptionsBar}
        contentContainerStyle={styles.navOptionsContainer}
      >
        {navigationOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.navOption}
            onPress={() => navigation.navigate(option.route as never)}
          >
            <Text style={styles.navOptionText}>{option.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 10, // Ensure dropdown appears above other elements
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  headerCompanyInfo: {
    alignItems: 'flex-end',
    flex: 1,
  },
  phoneNumber: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 3,
    color: '#555',
  },
  emailText: {
    fontSize: 12,
    color: '#555',
    marginTop: 3,
  },
  languageSelector: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
    flexDirection: 'row',
  },
  languageText: {
    fontSize: 12,
    paddingHorizontal: 3,
  },
  activeLanguage: {
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  languageSeparator: {
    marginHorizontal: 3,
    color: '#999',
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  icon: {
    marginHorizontal: 8,
  },
  loginText: {
    fontSize: 14,
    color: '#FF3B30',
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  catalogButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
  },
  catalogButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  searchBar: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    height: 36,
    justifyContent: 'center',
  },
  searchInput: {
    padding: 8,
  },
  geographyButton: {
    padding: 5,
  },
  searchButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 5,
    marginLeft: 5,
  },
  // Existing styles...
  navOptionsBar: {
    marginTop: 10,
    backgroundColor: '#',
  },
  navOptionsContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  navOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  navOptionText: {
    fontSize: 14,
    color: '#333',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: 30,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 5,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 100,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  cartBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Header;