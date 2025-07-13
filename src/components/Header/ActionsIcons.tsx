import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import { useUser } from '../../context/UserContext';
import { useLanguage } from '../../context/languages/useLanguage';
import { useCart } from '../../context/cart/CartContext';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { styles } from './styles';

const ActionIcons: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [dropdownAnimation] = useState(new Animated.Value(0));
  const { user } = useUser();
  const { translate, changeLanguage, currentLanguage } = useLanguage();
  const { getTotalItems } = useCart();
  const [isLangDropdownVisible, setIsLangDropdownVisible] = useState(false);
  const [langDropdownAnimation] = useState(new Animated.Value(0));
  
  // Debug whenever currentLanguage changes
  useEffect(() => {
    console.log('Header language updated:', currentLanguage);
  }, [currentLanguage]);
  
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
  
  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const handleLanguageChange = (lang: string) => {
    changeLanguage(lang);
  };

  return (
    <View style={[
      styles.headerIcons,
      Dimensions.get('window').width <= 768 && styles.headerIconsMobile
    ]}>
      {/* Language selector */}
      <View style={styles.languageSelectorContainer}>
        <TouchableOpacity 
          style={[styles.icon, styles.languageSelector]}
          onPress={toggleLangDropdown}
        >
          <Ionicons 
            name="globe-outline" 
            size={Dimensions.get('window').width <= 768 ? 18 : 22} 
            color="#333" 
          />
        </TouchableOpacity>
        
        {/* Language dropdown */}
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
      
      {/* Cart icon */}
      <TouchableOpacity 
        style={styles.icon}
        onPress={() => navigation.navigate('Cart')}
      >
        <Ionicons 
          name="cart-outline" 
          size={Dimensions.get('window').width <= 768 ? 20 : 24} 
          color="#333" 
        />
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
      
      {/* User profile/login */}
      {user ? (
        // User is logged in - show profile icon
        <TouchableOpacity 
          style={styles.icon}
          onPress={toggleDropdown}
        >
          <Ionicons 
            name="person-circle-outline" 
            size={Dimensions.get('window').width <= 768 ? 20 : 24} 
            color="#FF3B30" 
          />
          
          {/* User dropdown menu */}
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
          {Dimensions.get('window').width <= 768 ? (
            <Ionicons name="log-in-outline" size={20} color="#FF3B30" />
          ) : (
            <Text style={styles.loginText}>{translate('auth.loginRegister')}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ActionIcons;