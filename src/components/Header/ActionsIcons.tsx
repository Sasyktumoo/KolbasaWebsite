import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal
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
  
  const isMobile = Dimensions.get('window').width <= 768;
  
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
  
  // Toggle language dropdown (animation version)
  const toggleLangDropdownAnimation = () => {
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

  // Replace dropdown visibility state with modal approach
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  
  // Get position for modals (need to calculate based on icon position)
  const [userIconPosition, setUserIconPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [langIconPosition, setLangIconPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const userIconRef = React.useRef(null);
  const langIconRef = React.useRef(null);
  
  // Function to measure icon position
  const measureIcon = (ref, setPosition) => {
    if (ref.current) {
      ref.current.measure((x, y, width, height, pageX, pageY) => {
        setPosition({ x: pageX, y: pageY, width, height });
      });
    }
  };
  
  const toggleUserDropdown = () => {
    measureIcon(userIconRef, setUserIconPosition);
    setUserModalVisible(!userModalVisible);
  };
  
  const toggleLangDropdown = () => {
    measureIcon(langIconRef, setLangIconPosition);
    setLangModalVisible(!langModalVisible);
  };

  return (
    <View style={[
      styles.headerIcons,
      isMobile && styles.headerIconsMobile
    ]}>
      {/* Language selector */}
      <View style={styles.languageSelectorContainer}>
        <TouchableOpacity 
          ref={langIconRef}
          style={[styles.icon, styles.languageSelector]}
          onPress={toggleLangDropdown}
        >
          <Ionicons 
            name="globe-outline" 
            size={isMobile ? 18 : 22} 
            color="#333" 
          />
        </TouchableOpacity>
        
        {/* Language dropdown as modal */}
        <Modal
          transparent={true}
          visible={langModalVisible}
          animationType="fade"
          onRequestClose={() => setLangModalVisible(false)}
        >
          <TouchableOpacity 
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setLangModalVisible(false)}
          >
            <View 
              style={{
                position: 'absolute',
                top: langIconPosition.y + langIconPosition.height + 5,
                right: Dimensions.get('window').width - langIconPosition.x - langIconPosition.width,
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
                elevation: 8,
              }}
            >
              {/* Language options */}
              <TouchableOpacity 
                style={[styles.dropdownItem, currentLanguage === 'en' ? styles.activeLanguageItem : null]}
                onPress={() => {
                  handleLanguageChange('en');
                  setLangModalVisible(false);
                }}
              >
                <Text style={[styles.dropdownText, currentLanguage === 'en' ? styles.activeLanguageText : null]}>English</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.dropdownItem, currentLanguage === 'ru' ? styles.activeLanguageItem : null]}
                onPress={() => {
                  handleLanguageChange('ru');
                  setLangModalVisible(false);
                }}
              >
                <Text style={[styles.dropdownText, currentLanguage === 'ru' ? styles.activeLanguageText : null]}>Русский</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.dropdownItem, currentLanguage === 'es' ? styles.activeLanguageItem : null]}
                onPress={() => {
                  handleLanguageChange('es');
                  setLangModalVisible(false);
                }}
              >
                <Text style={[styles.dropdownText, currentLanguage === 'es' ? styles.activeLanguageText : null]}>Español</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.dropdownItem, currentLanguage === 'uk' ? styles.activeLanguageItem : null]}
                onPress={() => {
                  handleLanguageChange('uk');
                  setLangModalVisible(false);
                }}
              >
                <Text style={[styles.dropdownText, currentLanguage === 'uk' ? styles.activeLanguageText : null]}>Українська</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
      
      {/* Cart icon */}
      <TouchableOpacity 
        style={styles.icon}
        onPress={() => navigation.navigate('Cart')}
      >
        <Ionicons 
          name="cart-outline" 
          size={isMobile ? 20 : 24} 
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
          ref={userIconRef}
          style={styles.icon}
          onPress={toggleUserDropdown}
        >
          <Ionicons 
            name="person-circle-outline" 
            size={isMobile ? 20 : 24} 
            color="#FF3B30" 
          />
          
          {/* User dropdown as modal */}
          <Modal
            transparent={true}
            visible={userModalVisible}
            animationType="fade"
            onRequestClose={() => setUserModalVisible(false)}
          >
            <TouchableOpacity 
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={() => setUserModalVisible(false)}
            >
              <View 
                style={{
                  position: 'absolute',
                  top: userIconPosition.y + userIconPosition.height + 5,
                  right: Dimensions.get('window').width - userIconPosition.x - userIconPosition.width,
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
                  elevation: 8,
                }}
              >
                <TouchableOpacity 
                  style={styles.dropdownItem}
                  onPress={() => {
                    setUserModalVisible(false);
                    navigation.navigate('Profile');
                  }}
                >
                  <Text style={styles.dropdownText}>{translate('auth.profile')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.dropdownItem}
                  onPress={() => {
                    setUserModalVisible(false);
                    handleLogout();
                  }}
                >
                  <Text style={styles.dropdownText}>{translate('auth.logout')}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </TouchableOpacity>
      ) : (
        // User is not logged in - show login/register button
        <TouchableOpacity 
          style={styles.icon}
          onPress={() => navigation.navigate('Login')}
        >
          {isMobile ? (
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