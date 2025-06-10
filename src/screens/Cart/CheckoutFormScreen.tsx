import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { useLanguage } from '../../context/languages/useLanguage';
import { useUser } from '../../context/UserContext';
import { collection, getDocs, query, where, getFirestore, addDoc } from 'firebase/firestore';

// Address type definition (same as in AddressBookScreen)
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

const CheckoutFormScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { t, currentLanguage } = useLanguage();
  const { user } = useUser();
  const db = getFirestore();
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  
  // Address management
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // New address form
  const [addressFormVisible, setAddressFormVisible] = useState(false);
  const [fullName, setFullName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Load addresses and pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      fetchAddresses();
      setEmail(user.email || '');
      setName(user.displayName || '');
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
      
      // Pre-select default address if available
      const defaultAddress = fetchedAddresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
        setPhone(defaultAddress.phoneNumber);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Validate main checkout form
  const validateCheckoutForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) newErrors.name = t('checkout.errorName');
    if (!email.trim()) newErrors.email = t('checkout.errorEmail');
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('checkout.errorInvalidEmail');
    if (!phone.trim()) newErrors.phone = t('checkout.errorPhone');
    if (!selectedAddress) newErrors.address = t('checkout.errorAddress');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate address form
  const validateAddressForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!fullName.trim()) errors.fullName = t('addressBook.errorFullName');
    if (!streetAddress.trim()) errors.streetAddress = t('addressBook.errorStreetAddress');
    if (!city.trim()) errors.city = t('addressBook.errorCity');
    if (!state.trim()) errors.state = t('addressBook.errorState');
    if (!postalCode.trim()) errors.postalCode = t('addressBook.errorPostalCode');
    if (!country.trim()) errors.country = t('addressBook.errorCountry');
    if (!phoneNumber.trim()) errors.phoneNumber = t('addressBook.errorPhoneNumber');
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Save new address
  const saveNewAddress = async () => {
    if (!validateAddressForm()) return;
    if (!user) return;
    
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
        isDefault: addresses.length === 0 // Set as default if it's the first address
      };
      
      const docRef = await addDoc(collection(db, 'addresses'), addressData);
      const newAddress = { ...addressData, id: docRef.id };
      
      // Update addresses list
      setAddresses([...addresses, newAddress as Address]);
      
      // Select the new address
      setSelectedAddress(newAddress as Address);
      setPhone(phoneNumber);
      
      // Reset form and close modal
      resetAddressForm();
      setAddressFormVisible(false);
      
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Reset address form fields
  const resetAddressForm = () => {
    setFullName('');
    setStreetAddress('');
    setApartment('');
    setCity('');
    setState('');
    setPostalCode('');
    setCountry('');
    setPhoneNumber('');
    setFormErrors({});
  };
  
  // Handle continue to review
  const handleContinueToReview = () => {
    if (!validateCheckoutForm()) return;
    
    // Navigate to review screen with all form data
    navigation.navigate('OrderReview', {
      customerInfo: {
        name,
        email,
        phone,
        message,
        address: selectedAddress
      }
    });
  };
  
  // Render each address item in the selection modal
  const renderAddressItem = ({ item }: { item: Address }) => (
    <TouchableOpacity 
      style={[
        styles.addressItem,
        selectedAddress?.id === item.id && styles.selectedAddressItem
      ]}
      onPress={() => {
        setSelectedAddress(item);
        setAddressModalVisible(false);
        setPhone(item.phoneNumber);
      }}
    >
      {item.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultBadgeText}>{t('addressBook.default')}</Text>
        </View>
      )}
      
      <Text style={styles.addressName}>{item.fullName}</Text>
      <Text style={styles.addressText}>{item.streetAddress}</Text>
      {item.apartment ? <Text style={styles.addressText}>{item.apartment}</Text> : null}
      <Text style={styles.addressText}>
        {item.city}, {item.state} {item.postalCode}
      </Text>
      <Text style={styles.addressText}>{item.country}</Text>
      <Text style={styles.addressPhone}>{item.phoneNumber}</Text>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <Header onCatalogPress={() => navigation.navigate('Home', { locale: currentLanguage })} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.title}>{t('checkout.title')}</Text>
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>{t('checkout.contactInfo')}</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('checkout.name')} *</Text>
                <TextInput
                  style={[styles.input, errors.name ? styles.inputError : null]}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('checkout.namePlaceholder')}
                />
                {errors.name ? (
                  <Text style={styles.errorText}>{errors.name}</Text>
                ) : null}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('checkout.email')} *</Text>
                <TextInput
                  style={[styles.input, errors.email ? styles.inputError : null]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('checkout.emailPlaceholder')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('checkout.phone')} *</Text>
                <TextInput
                  style={[styles.input, errors.phone ? styles.inputError : null]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={t('checkout.phonePlaceholder')}
                  keyboardType="phone-pad"
                />
                {errors.phone ? (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                ) : null}
              </View>
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>{t('checkout.deliveryAddress')}</Text>
              
              <TouchableOpacity 
                style={[
                  styles.addressSelector,
                  errors.address ? styles.inputError : null
                ]}
                onPress={() => setAddressModalVisible(true)}
              >
                {selectedAddress ? (
                  <View style={styles.selectedAddressContainer}>
                    <Text style={styles.selectedAddressName}>{selectedAddress.fullName}</Text>
                    <Text style={styles.selectedAddressDetails}>
                      {selectedAddress.streetAddress}
                      {selectedAddress.apartment ? `, ${selectedAddress.apartment}` : ''}
                    </Text>
                    <Text style={styles.selectedAddressDetails}>
                      {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}
                    </Text>
                    <Text style={styles.selectedAddressDetails}>{selectedAddress.country}</Text>
                  </View>
                ) : (
                  <Text style={styles.addressSelectorText}>
                    {t('checkout.selectAddress')}
                  </Text>
                )}
                <Ionicons name="chevron-down" size={20} color="#777" />
              </TouchableOpacity>
              
              {errors.address ? (
                <Text style={styles.errorText}>{errors.address}</Text>
              ) : null}
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>{t('checkout.additionalInfo')}</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('checkout.orderNotes')}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={message}
                  onChangeText={setMessage}
                  placeholder={t('checkout.orderNotesPlaceholder')}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={handleContinueToReview}
            >
              <Text style={styles.continueButtonText}>{t('checkout.continueToReview')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Address Selection Modal */}
      <Modal
        visible={addressModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('checkout.selectAddress')}</Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {loading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#FF3B30" />
              </View>
            ) : (
              <View style={styles.modalBody}>
                {addresses.length > 0 ? (
                  <FlatList
                    data={addresses}
                    renderItem={renderAddressItem}
                    keyExtractor={(item) => item.id || Math.random().toString()}
                    contentContainerStyle={styles.addressList}
                  />
                ) : (
                  <View style={styles.emptyAddressContainer}>
                    <Text style={styles.emptyAddressText}>
                      {t('checkout.noAddresses')}
                    </Text>
                  </View>
                )}
                
                <TouchableOpacity 
                  style={styles.addAddressButton}
                  onPress={() => {
                    setAddressModalVisible(false);
                    setAddressFormVisible(true);
                  }}
                >
                  <Ionicons name="add" size={20} color="white" />
                  <Text style={styles.addAddressButtonText}>{t('checkout.addNewAddress')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
      
      {/* New Address Form Modal */}
      <Modal
        visible={addressFormVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddressFormVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('addressBook.addAddress')}</Text>
              <TouchableOpacity onPress={() => setAddressFormVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formScrollView}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('addressBook.fullName')} *</Text>
                <TextInput
                  style={[styles.input, formErrors.fullName ? styles.inputError : null]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={t('addressBook.fullNamePlaceholder')}
                />
                {formErrors.fullName ? (
                  <Text style={styles.errorText}>{formErrors.fullName}</Text>
                ) : null}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('addressBook.streetAddress')} *</Text>
                <TextInput
                  style={[styles.input, formErrors.streetAddress ? styles.inputError : null]}
                  value={streetAddress}
                  onChangeText={setStreetAddress}
                  placeholder={t('addressBook.streetAddressPlaceholder')}
                />
                {formErrors.streetAddress ? (
                  <Text style={styles.errorText}>{formErrors.streetAddress}</Text>
                ) : null}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('addressBook.apartment')}</Text>
                <TextInput
                  style={styles.input}
                  value={apartment}
                  onChangeText={setApartment}
                  placeholder={t('addressBook.apartmentPlaceholder')}
                />
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>{t('addressBook.city')} *</Text>
                  <TextInput
                    style={[styles.input, formErrors.city ? styles.inputError : null]}
                    value={city}
                    onChangeText={setCity}
                    placeholder={t('addressBook.cityPlaceholder')}
                  />
                  {formErrors.city ? (
                    <Text style={styles.errorText}>{formErrors.city}</Text>
                  ) : null}
                </View>
                
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>{t('addressBook.state')} *</Text>
                  <TextInput
                    style={[styles.input, formErrors.state ? styles.inputError : null]}
                    value={state}
                    onChangeText={setState}
                    placeholder={t('addressBook.statePlaceholder')}
                  />
                  {formErrors.state ? (
                    <Text style={styles.errorText}>{formErrors.state}</Text>
                  ) : null}
                </View>
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>{t('addressBook.postalCode')} *</Text>
                  <TextInput
                    style={[styles.input, formErrors.postalCode ? styles.inputError : null]}
                    value={postalCode}
                    onChangeText={setPostalCode}
                    placeholder={t('addressBook.postalCodePlaceholder')}
                    keyboardType="number-pad"
                  />
                  {formErrors.postalCode ? (
                    <Text style={styles.errorText}>{formErrors.postalCode}</Text>
                  ) : null}
                </View>
                
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>{t('addressBook.country')} *</Text>
                  <TextInput
                    style={[styles.input, formErrors.country ? styles.inputError : null]}
                    value={country}
                    onChangeText={setCountry}
                    placeholder={t('addressBook.countryPlaceholder')}
                  />
                  {formErrors.country ? (
                    <Text style={styles.errorText}>{formErrors.country}</Text>
                  ) : null}
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('addressBook.phoneNumber')} *</Text>
                <TextInput
                  style={[styles.input, formErrors.phoneNumber ? styles.inputError : null]}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder={t('addressBook.phoneNumberPlaceholder')}
                  keyboardType="phone-pad"
                />
                {formErrors.phoneNumber ? (
                  <Text style={styles.errorText}>{formErrors.phoneNumber}</Text>
                ) : null}
              </View>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={saveNewAddress}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>{t('addressBook.save')}</Text>
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
  keyboardAvoidView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
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
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addressSelector: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressSelectorText: {
    color: '#999',
    fontSize: 14,
  },
  selectedAddressContainer: {
    flex: 1,
  },
  selectedAddressName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  selectedAddressDetails: {
    fontSize: 13,
    color: '#555',
    marginBottom: 1,
  },
  continueButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  modalBody: {
    padding: 15,
  },
  loaderContainer: {
    padding: 30,
    alignItems: 'center',
  },
  addressList: {
    paddingBottom: 10,
  },
  addressItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedAddressItem: {
    borderColor: '#FF3B30',
    backgroundColor: '#fff5f5',
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
  addressName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addressText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 13,
    color: '#555',
    marginTop: 5,
  },
  emptyAddressContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyAddressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  addAddressButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAddressButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  formScrollView: {
    padding: 15,
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

export default CheckoutFormScreen;