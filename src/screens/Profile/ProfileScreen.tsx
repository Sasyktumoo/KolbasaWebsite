import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useUser } from '../../context/UserContext';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import Header from '../../components/Header';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useUser();
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  
  const handleLogout = async () => {
    try {
      await FIREBASE_AUTH.signOut();
      // Navigation will be handled by the auth state listener in App.tsx
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleSettings = () => {
    setSettingsExpanded(!settingsExpanded);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header onCatalogPress={() => navigation.navigate('Home', { locale: 'en' })} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.profileIcon}>
            <Ionicons name="person" size={50} color="#FF3B30" />
          </View>
          <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        
        <View style={styles.profileActions}>
          {/* Profile & Settings Accordion */}
          <TouchableOpacity style={styles.accordionHeader} onPress={toggleSettings}>
            <View style={styles.accordionTitleContainer}>
              <Ionicons name="settings-outline" size={24} color="#333" style={styles.actionIcon} />
              <Text style={styles.actionText}>Profile & Settings</Text>
            </View>
            <Ionicons 
              name={settingsExpanded ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#333" 
            />
          </TouchableOpacity>
          
          {settingsExpanded && (
            <View style={styles.accordionContent}>
              <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
                <Text style={styles.settingText}>Change Email</Text>
              </TouchableOpacity>
              <View style={styles.separator} />
              
              <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
                <Text style={styles.settingText}>Change Password</Text>
              </TouchableOpacity>
              <View style={styles.separator} />
              
              

            </View>
          )}
          
          {/* Order History */}
          <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
            <Ionicons name="cart-outline" size={24} color="#333" style={styles.actionIcon} />
            <Text style={styles.actionText}>Order History</Text>
          </TouchableOpacity>
          
          {/* Address Book */}
          <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
            <Ionicons name="location-outline" size={24} color="#333" style={styles.actionIcon} />
            <Text style={styles.actionText}>Address Book</Text>
          </TouchableOpacity>
          
          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" style={styles.actionIcon} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 30,
  },
  profileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  profileActions: {
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  accordionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accordionContent: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#e0e0e0',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  settingItem: {
    padding: 15,
    paddingLeft: 53, // To align with the parent text
  },
  settingText: {
    fontSize: 14,
    color: '#555',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 15,
  },
  actionIcon: {
    marginRight: 15,
  },
  actionText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
  },
});

export default ProfileScreen;