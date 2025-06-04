import React, { useState, useRef, useContext, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Platform,
  ScrollView,
  TextInput,
  Image,
  Dimensions
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
      <View style={styles.headerMain}>
        {/* Logo aligned to far left */}
        <TouchableOpacity 
          style={styles.logoContainer} 
          onPress={() => navigation.navigate('Home', { locale: currentLanguage })}
        >
          <Image 
            source={require('../../assets/Website_Logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
        {/* Right section with company info and controls */}
        <View style={styles.rightSection}>
          {/* Top row with company info only */}
          <View style={styles.topRow}>
            {/* Company Info */}
            <View style={styles.headerCompanyInfo}>
              <Text style={styles.websiteTitle}>Meat Store of Uncle Bucho</Text>
              <Text style={styles.phoneNumber}>+1 (555) 123-4567</Text>
              <Text style={styles.emailText}>info@b2b.trade</Text>
            </View>
          </View>
          
          {/* Bottom row with catalog, search and user icons */}
          <View style={styles.navigationControls}>
            <TouchableOpacity style={styles.catalogButton} onPress={handleCatalogPress}>
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
            
            {/* Cart and user icons moved here */}
            <View style={styles.headerIcons}>
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
        </View>
      </View>
      
      {/* Navigation options bar */}
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
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  logoContainer: {
    alignSelf: 'flex-start',
    paddingLeft: 0,
    marginLeft: 0,
  },
  
  logoImage: {
    paddingTop: 10,
    height: Dimensions.get('window').width * 0.1,
    width: Dimensions.get('window').width * 0.14
  },
  
  rightSection: {
    alignItems: 'flex-end',
  },
  
  topRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  
  headerCompanyInfo: {
    alignItems: 'flex-end',
    marginRight: 10
  },
  
  navigationControls: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  
  websiteTitle: {
    fontSize: 55, // Increased from 18 to 24
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
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
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15, // Added margin to separate from search
  },
  icon: {
    marginHorizontal: 8,
  },
  loginText: {
    fontSize: 14,
    color: '#FF3B30',
  },
  catalogButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    marginRight: 15,
  },
  catalogButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  searchBar: {
    width: 180,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Header;