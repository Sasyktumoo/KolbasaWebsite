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
  
  // Reset search query when language changes
  useEffect(() => {
    setSearchQuery('');
  }, [currentLanguage]);
  const { getTotalItems } = useCart();
  const [isLangDropdownVisible, setIsLangDropdownVisible] = useState(false);
  const [langDropdownAnimation] = useState(new Animated.Value(0));
  
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
  
  // Toggle language dropdown
  const toggleLangDropdown = () => {
    if (isLangDropdownVisible) {
      // Close dropdown with animation
      Animated.timing(langDropdownAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start(() => setIsLangDropdownVisible(false));
    } else {
      // Open dropdown with animation
      setIsLangDropdownVisible(true);
      Animated.timing(langDropdownAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
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
    if (!searchQuery.trim()) {
      return; // Don't search with empty query
    }
    
    console.log('Searching for:', searchQuery);
    
    // Navigate to CategoryPage with search query parameter
    // The key fix is ensuring we're using a consistent parameter structure
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

  // Navigation options with translated text - Add the Image Downloader option
  const navigationOptions = [
    { id: 'about', name: translate('navigation.aboutUs'), route: 'AboutUs' },
    { id: 'order', name: translate('navigation.orderProducts'), route: 'OrderProducts' },
    { id: 'delivery', name: translate('navigation.productDelivery'), route: 'ProductDelivery' },
    { id: 'payment', name: translate('navigation.orderPayment'), route: 'OrderPayment' },
    { id: 'news', name: translate('navigation.news'), route: 'News' },
    { id: 'feedback', name: translate('navigation.feedback'), route: 'Feedback' },
    { id: 'dummy', name: "dummy", route: 'Dummy' }
  ];
  

  
  return (
    <View style={styles.header}>
      <View style={styles.headerMain}>
        {/* Logo aligned to far left */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/Website_Logo.png')}
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
              {/* Planet icon only without text */}
              <View style={styles.languageSelectorContainer}>
                <TouchableOpacity 
                  style={[styles.icon, styles.languageSelector]}
                  onPress={toggleLangDropdown}
                >
                  <Ionicons name="globe-outline" size={22} color="#333" />
                </TouchableOpacity>
                
                {isLangDropdownVisible && (
                  <Animated.View 
                    style={[
                      styles.dropdown,
                      styles.langDropdown,
                      {
                        opacity: langDropdownAnimation,
                        transform: [{
                          translateY: langDropdownAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-10, 0]
                          })
                        }]
                      }
                    ]}
                  >
                    <TouchableOpacity 
                      style={[styles.dropdownItem, currentLanguage === 'en' ? styles.activeLanguageItem : null]}
                      onPress={() => {
                        handleLanguageChange('en');
                        toggleLangDropdown();
                      }}
                    >
                      <Text style={[styles.dropdownText, currentLanguage === 'en' ? styles.activeLanguageText : null]}>English</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.dropdownItem, currentLanguage === 'ru' ? styles.activeLanguageItem : null]}
                      onPress={() => {
                        handleLanguageChange('ru');
                        toggleLangDropdown();
                      }}
                    >
                      <Text style={[styles.dropdownText, currentLanguage === 'ru' ? styles.activeLanguageText : null]}>Русский</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.dropdownItem, currentLanguage === 'es' ? styles.activeLanguageItem : null]}
                      onPress={() => {
                        handleLanguageChange('es');
                        toggleLangDropdown();
                      }}
                    >
                      <Text style={[styles.dropdownText, currentLanguage === 'es' ? styles.activeLanguageText : null]}>Español</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.dropdownItem, currentLanguage === 'uk' ? styles.activeLanguageItem : null]}
                      onPress={() => {
                        handleLanguageChange('uk');
                        toggleLangDropdown();
                      }}
                    >
                      <Text style={[styles.dropdownText, currentLanguage === 'uk' ? styles.activeLanguageText : null]}>Українська</Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.icon}
                onPress={() => navigation.navigate('Cart')}
              >
                <Ionicons name="cart-outline" size={24} color="#333" />
                {getTotalItems() > 0 && (
                  <View style={[
                    styles.cartBadge,
                    getTotalItems() > 99 && styles.cartBadgeWide
                  ]}>
                    <Text style={styles.cartBadgeText}>
                      {getTotalItems() > 99 ? '99+' : getTotalItems()}
                    </Text>
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
    zIndex: 10, // Add z-index to header
  },
  
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 20, // Higher than header
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
    zIndex: 30, // Higher than headerMain
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
    zIndex: 40, // Higher than rightSection
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
    padding: 6,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageText: {
    fontSize: 12,
    paddingHorizontal: 3,
    marginLeft: 3,
  },
  languageSelectorContainer: {
    position: 'relative',
    zIndex: 1500, // Much higher than before
  },
  langDropdown: {
    position: 'absolute',
    right: 0,
    minWidth: 120,
    top: 35,
    zIndex: 2000, // Extremely high z-index
    elevation: 8, // Increased for Android
  },
  activeLanguageItem: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  activeLanguageText: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    zIndex: 50, // Higher than navigationControls
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
    backgroundColor: '#fff',
    zIndex: 5, // Lower than everything else
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
    elevation: 8, // Increased for Android
    zIndex: 2000, // Extremely high z-index
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
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeWide: {
    minWidth: 28,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Header;