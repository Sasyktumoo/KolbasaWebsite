import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useUser } from '../../context/UserContext';
import Header from '../../components/Header/Header';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/languages/useLanguage';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, getFirestore, query, where, setDoc } from 'firebase/firestore';
import { useAlert } from '../../context/AlertContext';

// Address type definition
interface Address {
  id?: string;
  fullName: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  isDefault: boolean;
}

const AddressBookScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useUser();
  const { translate, currentLanguage } = useLanguage();
  const { alert } = useAlert();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const db = getFirestore();
  
  // Load addresses when component mounts
  useEffect(() => {
    if (user) {
      fetchAddresses();
    } else {
      setLoading(false);
      setAddresses([]);
    }
  }, [user]);
  
  // Fetch user addresses from Firestore
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      if (!user) return;
      
      const addressQuery = query(
        collection(db, 'addresses'), 
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(addressQuery);
      const fetchedAddresses: Address[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedAddresses.push({
          id: doc.id,
          fullName: data.fullName,
          streetAddress: data.streetAddress,
          apartment: data.apartment || '',
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          phoneNumber: data.phoneNumber,
          isDefault: data.isDefault || false
        });
      });
      
      setAddresses(fetchedAddresses);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      alert(translate('addressBook.error'), translate('addressBook.errorFetching'));
    } finally {
      setLoading(false);
    }
  };
  
  // Validate address form
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!fullName.trim()) errors.fullName = translate('addressBook.errorFullName');
    if (!streetAddress.trim()) errors.streetAddress = translate('addressBook.errorStreetAddress');
    if (!city.trim()) errors.city = translate('addressBook.errorCity');
    if (!state.trim()) errors.state = translate('addressBook.errorState');
    if (!postalCode.trim()) errors.postalCode = translate('addressBook.errorPostalCode');
    if (!country.trim()) errors.country = translate('addressBook.errorCountry');
    if (!phoneNumber.trim()) errors.phoneNumber = translate('addressBook.errorPhoneNumber');
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Save address to Firestore
  const saveAddress = async () => {
    if (!validateForm()) return;
    if (!user) {
      alert(translate('addressBook.error'), translate('addressBook.errorNotLoggedIn'));
      return;
    }
    
    try {
      setLoading(true);
      
      const addressData = {
        userId: user.uid,
        fullName,
        streetAddress,
        apartment,
        city,
        state,
        postalCode,
        country,
        phoneNumber,
        isDefault: currentAddress ? currentAddress.isDefault : addresses.length === 0
      };
      
      if (currentAddress && currentAddress.id) {
        // Update existing address
        await updateDoc(doc(db, 'addresses', currentAddress.id), addressData);
      } else {
        // Add new address
        await addDoc(collection(db, 'addresses'), addressData);
      }
      
      // Reset form and refresh addresses
      resetForm();
      setModalVisible(false);
      fetchAddresses();
      
    } catch (error) {
      console.error('Error saving address:', error);
      alert(translate('addressBook.error'), translate('addressBook.errorSaving'));
    } finally {
      setLoading(false);
    }
  };
  
  // Confirm deletion
  const confirmDelete = (id: string | undefined) => {
    if (!id) {
      console.error('Cannot delete address: ID is undefined');
      alert(
        translate('addressBook.error'),
        translate('addressBook.errorInvalidId')
      );
      return;
    }
    
    alert(
      translate('addressBook.deleteConfirmTitle'),
      translate('addressBook.deleteConfirmMessage'),
      [
        {
          text: translate('common.cancel'),
          style: 'cancel'
        },
        {
          text: translate('common.delete'),
          onPress: () => deleteAddress(id),
          style: 'destructive'
        }
      ]
    );
  };
  
  // Delete address
  const deleteAddress = async (id: string) => {
    try {
      setLoading(true);
      
      // Create a reference to the document
      const addressRef = doc(db, 'addresses', id);
      
      // Delete the document
      await deleteDoc(addressRef);
      
      // Log success
      console.log(`Successfully deleted address with ID: ${id}`);
      
      // Update the local state immediately for better UX
      setAddresses(addresses.filter(address => address.id !== id));
      
      // Then refresh from server
      fetchAddresses();
      
    } catch (error) {
      // Log detailed error
      console.error('Error deleting address:', error);
      
      // Show user-friendly error message
      alert(
        translate('addressBook.errorDeleting'),
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Set address as default
  const setDefaultAddress = async (id: string) => {
    try {
      setLoading(true);
      
      // First, set all addresses to non-default
      const promises = addresses.map(async (address) => {
        if (address.id && address.isDefault) {
          await updateDoc(doc(db, 'addresses', address.id), { isDefault: false });
        }
      });
      
      await Promise.all(promises);
      
      // Then set the selected address as default
      await updateDoc(doc(db, 'addresses', id), { isDefault: true });
      
      fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      alert(translate('addressBook.error'), translate('addressBook.errorSettingDefault'));
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form fields
  const resetForm = () => {
    setFullName('');
    setStreetAddress('');
    setApartment('');
    setCity('');
    setState('');
    setPostalCode('');
    setCountry('');
    setPhoneNumber('');
    setFormErrors({});
    setCurrentAddress(null);
  };
  
  // Open modal for adding a new address
  const handleAddAddress = () => {
    resetForm();
    setModalVisible(true);
  };
  
  // Open modal for editing an existing address
  const handleEditAddress = (address: Address) => {
    setCurrentAddress(address);
    setFullName(address.fullName);
    setStreetAddress(address.streetAddress);
    setApartment(address.apartment || '');
    setCity(address.city);
    setState(address.state);
    setPostalCode(address.postalCode);
    setCountry(address.country);
    setPhoneNumber(address.phoneNumber);
    setModalVisible(true);
  };
  
  // Render each address item
  const renderAddressItem = ({ item }: { item: Address }) => (
    <View style={styles.addressItem}>
      {item.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultBadgeText}>{translate('addressBook.default')}</Text>
        </View>
      )}
      
      <View style={styles.addressContent}>
        <Text style={styles.addressName}>{item.fullName}</Text>
        <Text style={styles.addressText}>{item.streetAddress}</Text>
        {item.apartment ? <Text style={styles.addressText}>{item.apartment}</Text> : null}
        <Text style={styles.addressText}>
          {item.city}, {item.state} {item.postalCode}
        </Text>
        <Text style={styles.addressText}>{item.country}</Text>
        <Text style={styles.addressPhone}>{item.phoneNumber}</Text>
      </View>
      
      <View style={styles.addressActions}>
        <TouchableOpacity 
          style={styles.addressAction}
          onPress={() => handleEditAddress(item)}
        >
          <Ionicons name="pencil" size={18} color="#555" />
        </TouchableOpacity>
        
        {!item.isDefault && (
          <TouchableOpacity 
            style={styles.addressAction}
            onPress={() => setDefaultAddress(item.id!)}
          >
            <Ionicons name="star-outline" size={18} color="#555" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.addressAction}
          onPress={() => item.id ? confirmDelete(item.id) : null}
          disabled={!item.id}
        >
          <Ionicons 
            name="trash-outline" 
            size={18} 
            color={item.id ? "#FF3B30" : "#ccc"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <Header onCatalogPress={() => navigation.navigate('Home', { locale: currentLanguage })} />
      
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>{translate('profile.addressBook')}</Text>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#FF3B30" style={styles.loader} />
        ) : (
          <>
            {addresses.length > 0 ? (
              <FlatList
                data={addresses}
                renderItem={renderAddressItem}
                keyExtractor={(item) => item.id || Math.random().toString()}
                contentContainerStyle={styles.addressList}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="location-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>{translate('addressBook.noAddresses')}</Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddAddress}
            >
              <Ionicons name="add" size={24} color="white" />
              <Text style={styles.addButtonText}>{translate('addressBook.addNew')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      
      {/* Address Form Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {currentAddress ? translate('addressBook.editAddress') : translate('addressBook.addAddress')}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formScrollView}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>{translate('addressBook.fullName')} *</Text>
                <TextInput
                  style={[styles.input, formErrors.fullName ? styles.inputError : null]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={translate('addressBook.fullNamePlaceholder')}
                />
                {formErrors.fullName ? (
                  <Text style={styles.errorText}>{formErrors.fullName}</Text>
                ) : null}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>{translate('addressBook.streetAddress')} *</Text>
                <TextInput
                  style={[styles.input, formErrors.streetAddress ? styles.inputError : null]}
                  value={streetAddress}
                  onChangeText={setStreetAddress}
                  placeholder={translate('addressBook.streetAddressPlaceholder')}
                />
                {formErrors.streetAddress ? (
                  <Text style={styles.errorText}>{formErrors.streetAddress}</Text>
                ) : null}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>{translate('addressBook.apartment')}</Text>
                <TextInput
                  style={styles.input}
                  value={apartment}
                  onChangeText={setApartment}
                  placeholder={translate('addressBook.apartmentPlaceholder')}
                />
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>{translate('addressBook.city')} *</Text>
                  <TextInput
                    style={[styles.input, formErrors.city ? styles.inputError : null]}
                    value={city}
                    onChangeText={setCity}
                    placeholder={translate('addressBook.cityPlaceholder')}
                  />
                  {formErrors.city ? (
                    <Text style={styles.errorText}>{formErrors.city}</Text>
                  ) : null}
                </View>
                
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>{translate('addressBook.state')} *</Text>
                  <TextInput
                    style={[styles.input, formErrors.state ? styles.inputError : null]}
                    value={state}
                    onChangeText={setState}
                    placeholder={translate('addressBook.statePlaceholder')}
                  />
                  {formErrors.state ? (
                    <Text style={styles.errorText}>{formErrors.state}</Text>
                  ) : null}
                </View>
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>{translate('addressBook.postalCode')} *</Text>
                  <TextInput
                    style={[styles.input, formErrors.postalCode ? styles.inputError : null]}
                    value={postalCode}
                    onChangeText={setPostalCode}
                    placeholder={translate('addressBook.postalCodePlaceholder')}
                    keyboardType="number-pad"
                  />
                  {formErrors.postalCode ? (
                    <Text style={styles.errorText}>{formErrors.postalCode}</Text>
                  ) : null}
                </View>
                
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>{translate('addressBook.country')} *</Text>
                  <TextInput
                    style={[styles.input, formErrors.country ? styles.inputError : null]}
                    value={country}
                    onChangeText={setCountry}
                    placeholder={translate('addressBook.countryPlaceholder')}
                  />
                  {formErrors.country ? (
                    <Text style={styles.errorText}>{formErrors.country}</Text>
                  ) : null}
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>{translate('addressBook.phoneNumber')} *</Text>
                <TextInput
                  style={[styles.input, formErrors.phoneNumber ? styles.inputError : null]}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder={translate('addressBook.phoneNumberPlaceholder')}
                  keyboardType="phone-pad"
                />
                {formErrors.phoneNumber ? (
                  <Text style={styles.errorText}>{formErrors.phoneNumber}</Text>
                ) : null}
              </View>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={saveAddress}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>{translate('addressBook.save')}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressList: {
    paddingBottom: 80,
  },
  addressItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  defaultBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addressContent: {
    marginBottom: 10,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addressText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
    marginTop: 10,
  },
  addressAction: {
    padding: 8,
    marginLeft: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  formScrollView: {
    padding: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 10,
    fontSize: 14,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddressBookScreen;