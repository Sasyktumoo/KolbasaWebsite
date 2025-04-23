import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { useUser } from '../context/UserContext';

interface HeaderProps {
  onCatalogPress?: () => void;
}

const Header = ({ onCatalogPress }: HeaderProps) => {
  const { user } = useUser();
  const navigation = useNavigation();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownAnimation = useRef(new Animated.Value(0)).current;
  
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
  
  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };
  
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerCompanyInfo}>
          <Text style={styles.logoText}>Магазин Колбасы</Text>
          <Text style={styles.phoneNumber}>+7 (999) 123-45-67</Text>
          <Text style={styles.emailText}>info@b2b.trade</Text>
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
                    <Text style={styles.dropdownItemText}>My Profile</Text>
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
                    <Text style={styles.dropdownItemText}>My Orders</Text>
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
                    <Text style={styles.dropdownItemText}>Settings</Text>
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
                    <Text style={[styles.dropdownItemText, styles.logoutText]}>Log Out</Text>
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
              <Text style={styles.loginText}>Login / Register</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
                
      <View style={styles.navigationBar}>
        <TouchableOpacity 
          style={styles.catalogButton}
          onPress={onCatalogPress}
        >
          <Text style={styles.catalogButtonText}>Catalog</Text>
        </TouchableOpacity>
        
        <View style={styles.searchBar}>
          <TextInput 
            style={styles.searchInput}
            placeholder="Find"
          />
        </View>
        
        <TouchableOpacity style={styles.geographyButton}>
          <Text>Search Geography</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
        
        <View style={styles.languageSelector}>
          <Text style={styles.languageText}>Ru | Р</Text>
        </View>
      </View>
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
});

export default Header;