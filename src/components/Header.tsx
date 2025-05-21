import React, { useState, useRef, useContext, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Platform,
  ScrollView
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
interface HeaderProps {
  onCatalogPress?: () => void;
}

const Header = ({ onCatalogPress }: HeaderProps) => {
  const { user } = useUser();
  const navigation = useNavigation();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownAnimation = useRef(new Animated.Value(0)).current;
  
  const { translate, currentLanguage, changeLanguage } = useLanguage();
  
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
  const toggleLanguage = () => {
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
        <View style={styles.headerCompanyInfo}>
          <Text style={styles.logoText}>{translate('header.storeName')}</Text>
          <Text style={styles.phoneNumber}>{translate('header.phoneNumber')}</Text>
          <Text style={styles.emailText}>{translate('header.email')}</Text>
        </View>
        
        <View style={styles.headerIcons}>
          <Ionicons name="notifications-outline" size={24} color="black" style={styles.icon} />
          <Ionicons name="cart-outline" size={24} color="black" style={styles.icon} />
          
          {user ? (
            // User is logged in, show profile button
            <View style={styles.profileContainer}>
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={toggleDropdown}
              >
                <Ionicons name="person-circle-outline" size={24} color="#FF3B30" />
                <Text style={styles.profileText}>
                  {user.displayName || user.email?.split('@')[0]}
                </Text>
                <Ionicons 
                  name={isDropdownVisible ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color="#FF3B30" 
                />
              </TouchableOpacity>
              
              {isDropdownVisible && (
                <Animated.View style={[
                  styles.dropdownMenu,
                  { 
                    opacity: dropdownAnimation,
                    transform: [{ 
                      translateY: dropdownAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-10, 0]
                      }) 
                    }] 
                  }
                ]}>
                  <TouchableOpacity 
                    style={styles.dropdownItem}
                    onPress={() => {
                      toggleDropdown();
                      // Navigate to profile page
                      console.log('Navigate to profile');
                    }}
                  >
                    <Ionicons name="person-outline" size={18} color="#333" />
                    <Text style={styles.dropdownItemText}>{translate('profile.myProfile')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.dropdownItem}
                    onPress={() => {
                      toggleDropdown();
                      // Navigate to orders
                      console.log('Navigate to orders');
                    }}
                  >
                    <Ionicons name="list-outline" size={18} color="#333" />
                    <Text style={styles.dropdownItemText}>{translate('profile.myOrders')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.dropdownItem}
                    onPress={() => {
                      toggleDropdown();
                      // Navigate to settings
                      console.log('Navigate to settings');
                    }}
                  >
                    <Ionicons name="settings-outline" size={18} color="#333" />
                    <Text style={styles.dropdownItemText}>{translate('profile.settings')}</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.dropdownDivider} />
                  
                  <TouchableOpacity 
                    style={styles.dropdownItem}
                    onPress={() => {
                      toggleDropdown();
                      handleLogout();
                    }}
                  >
                    <Ionicons name="log-out-outline" size={18} color="#FF3B30" />
                    <Text style={[styles.dropdownItemText, styles.logoutText]}>{translate('profile.logout')}</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          ) : (
            // User is not logged in, show login/register buttons
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login' as never)}
              style={styles.loginButton}
            >
              <Text style={styles.loginText}>{translate('auth.loginRegister')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
                
      <View style={styles.navigationBar}>
        <TouchableOpacity 
          style={styles.catalogButton}
          onPress={onCatalogPress}
        >
          <Text style={styles.catalogButtonText}>{translate('navigation.catalog')}</Text>
        </TouchableOpacity>
        
        {/* Search bar component */}
        <SearchBar onSearch={handleSearch} placeholder={translate('search.placeholder')} />
        
        {/* Language selector with toggle functionality */}
        <TouchableOpacity 
          style={styles.languageSelector}
          onPress={toggleLanguage}
        >
          <Text style={styles.languageText}>{getLanguageDisplay()}</Text>
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
  // Existing styles...
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
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  languageText: {
    fontSize: 12,
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
  loginButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
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
  profileContainer: {
    position: 'relative',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderRadius: 5,
  },
  profileText: {
    marginLeft: 5,
    marginRight: 3,
    color: '#FF3B30',
    fontWeight: '500',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: 180,
    zIndex: 1000,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  dropdownItemText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 4,
  },
  logoutText: {
    color: '#FF3B30',
  },
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
});

export default Header;