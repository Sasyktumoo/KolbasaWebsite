import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useUser } from '../../context/UserContext';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/languages/useLanguage';
import { useAlert } from '../../context/AlertContext';
import { 
  updateEmail, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  User,
  sendEmailVerification,
  verifyBeforeUpdateEmail,
  applyActionCode,
} from 'firebase/auth';

const ProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useUser();
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const { translate, currentLanguage } = useLanguage();
  const { alert } = useAlert();
  const [loading, setLoading] = useState(false);
  
  // State for modals
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  
  // State for form fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // Form errors
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // State for email verification flow
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [emailChangeInProgress, setEmailChangeInProgress] = useState(false);
  const [pendingNewEmail, setPendingNewEmail] = useState('');

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
  
  // Reset form fields and errors
  const resetForms = () => {
    setCurrentPassword('');
    setNewEmail('');
    setNewPassword('');
    setConfirmNewPassword('');
    setErrors({});
  };
  
  // Reauthenticate user before sensitive operations
  const reauthenticateUser = async (currentUser: User, password: string) => {
    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email!,
        password
      );
      await reauthenticateWithCredential(currentUser, credential);
      return true;
    } catch (error: any) {
      console.error('Reauthentication error:', error);
      
      if (error.code === 'auth/wrong-password') {
        setErrors({
          currentPassword: translate('profile.errorWrongPassword')
        });
      } else {
        setErrors({
          currentPassword: translate('profile.errorReauthentication')
        });
      }
      return false;
    }
  };
  
  // Handle email change
  const handleChangeEmail = async () => {
    if (!user) return;
    
    // Validate form
    const newErrors: {[key: string]: string} = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = translate('profile.errorRequiredPassword');
    }
    
    if (!newEmail) {
      newErrors.newEmail = translate('profile.errorRequiredEmail');
    } else if (!/\S+@\S+\.\S+/.test(newEmail)) {
      newErrors.newEmail = translate('profile.errorInvalidEmail');
    } else if (newEmail === user.email) {
      newErrors.newEmail = translate('profile.errorSameEmail');
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      // Step 1: Reauthenticate user first
      const reauthSuccess = await reauthenticateUser(user, currentPassword);
      
      if (!reauthSuccess) {
        setLoading(false);
        return;
      }
      
      // Step 2: Send verification email
      if (FIREBASE_AUTH.currentUser) {
        await verifyBeforeUpdateEmail(FIREBASE_AUTH.currentUser, newEmail);
        
        // Update the state to show verification UI
        setEmailVerificationSent(true);
        setPendingNewEmail(newEmail);
        setEmailChangeInProgress(true);
        resetForms(); // Clear the form
      }
      
    } catch (error: any) {
      console.error('Email update error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setErrors({
          newEmail: translate('profile.errorEmailInUse')
        });
      } else if (error.code === 'auth/requires-recent-login') {
        alert(
          translate('profile.recentLoginRequired'),
          translate('profile.pleaseRelogin'),
          [{ text: translate('common.ok'), onPress: handleLogout }]
        );
      } else {
        setErrors({
          general: translate('profile.errorEmailChange')
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle verification code resend
  const handleResendVerification = async () => {
    if (!user || !pendingNewEmail) return;
    
    setLoading(true);
    try {
      if (FIREBASE_AUTH.currentUser) {
        await verifyBeforeUpdateEmail(FIREBASE_AUTH.currentUser, pendingNewEmail);
        
        alert(
          translate('profile.verificationResent'),
          translate('profile.verificationEmailResent')
        );
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      setVerificationError(translate('profile.errorResendingVerification'));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle cancel email change
  const handleCancelEmailChange = () => {
    setEmailVerificationSent(false);
    setEmailChangeInProgress(false);
    setPendingNewEmail('');
    setVerificationCode('');
    setVerificationError('');
  };
  
  // Handle password change
  const handleChangePassword = async () => {
    if (!user) return;
    
    // Validate form
    const newErrors: {[key: string]: string} = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = translate('profile.errorRequiredPassword');
    }
    
    if (!newPassword) {
      newErrors.newPassword = translate('profile.errorRequiredNewPassword');
    } else if (newPassword.length < 6) {
      newErrors.newPassword = translate('profile.errorPasswordTooShort');
    }
    
    if (!confirmNewPassword) {
      newErrors.confirmNewPassword = translate('profile.errorRequiredConfirmPassword');
    } else if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = translate('profile.errorPasswordsDoNotMatch');
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      // Reauthenticate user first
      const reauthSuccess = await reauthenticateUser(user, currentPassword);
      
      if (!reauthSuccess) {
        setLoading(false);
        return;
      }
      
      // Update password
      await updatePassword(user, newPassword);
      
      // Replace custom alert with our global one
      alert(
        translate('profile.success'),
        translate('profile.passwordChangeSuccess'),
        [{ 
          text: translate('common.ok'),
          onPress: () => {
            setPasswordModalVisible(false);
            resetForms();
          }
        }]
      );
    } catch (error: any) {
      console.error('Password update error:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        alert(
          translate('profile.recentLoginRequired'),
          translate('profile.pleaseRelogin'),
          [{ text: translate('common.ok'), onPress: handleLogout }]
        );
      } else {
        setErrors({
          general: error.message
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Remove Header component here */}
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.profileIcon}>
            <Ionicons name="person" size={50} color="#FF3B30" />
          </View>
          <Text style={styles.userName}>{user?.displayName || translate('profile.defaultUserName')}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        
        <View style={styles.profileActions}>
          {/* Profile & Settings Accordion */}
          <TouchableOpacity style={styles.accordionHeader} onPress={toggleSettings}>
            <View style={styles.accordionTitleContainer}>
              <Ionicons name="settings-outline" size={24} color="#333" style={styles.actionIcon} />
              <Text style={styles.actionText}>{translate('profile.profileSettings')}</Text>
            </View>
            <Ionicons 
              name={settingsExpanded ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#333" 
            />
          </TouchableOpacity>
          
          {settingsExpanded && (
            <View style={styles.accordionContent}>
              {/* Show email change status if in progress */}
              {emailChangeInProgress && (
                <View style={styles.verificationStatus}>
                  <Ionicons name="mail-outline" size={20} color="#FF3B30" />
                  <Text style={styles.verificationText}>
                    {translate('profile.emailVerificationPending')}
                  </Text>
                  <TouchableOpacity onPress={handleResendVerification}>
                    <Text style={styles.resendLink}>
                      {translate('profile.resendVerification')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCancelEmailChange}>
                    <Text style={styles.cancelLink}>
                      {translate('profile.cancel')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.settingItem} 
                onPress={() => {
                  resetForms();
                  setEmailModalVisible(true);
                }}
                disabled={emailChangeInProgress}
              >
                <Text style={[
                  styles.settingText, 
                  emailChangeInProgress && styles.disabledText
                ]}>
                  {translate('profile.changeEmail')}
                </Text>
              </TouchableOpacity>
              <View style={styles.separator} />
              
              <TouchableOpacity 
                style={styles.settingItem} 
                onPress={() => {
                  resetForms();
                  setPasswordModalVisible(true);
                }}
              >
                <Text style={styles.settingText}>{translate('profile.changePassword')}</Text>
              </TouchableOpacity>
              <View style={styles.separator} />
            </View>
          )}
          
          {/* Order History */}
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => navigation.navigate('OrderHistory')}
          >
            <Ionicons name="cart-outline" size={24} color="#333" style={styles.actionIcon} />
            <Text style={styles.actionText}>{translate('profile.orderHistory')}</Text>
          </TouchableOpacity>
          
          {/* Address Book */}
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => navigation.navigate('AddressBook')}
          >
            <Ionicons name="location-outline" size={24} color="#333" style={styles.actionIcon} />
            <Text style={styles.actionText}>{translate('profile.addressBook')}</Text>
          </TouchableOpacity>
          
          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" style={styles.actionIcon} />
            <Text style={styles.logoutText}>{translate('profile.logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Change Email Modal */}
      <Modal
        visible={emailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEmailModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {emailVerificationSent 
                  ? translate('profile.verifyYourEmail') 
                  : translate('profile.changeEmail')}
              </Text>
              <TouchableOpacity onPress={() => {
                setEmailModalVisible(false);
                if (emailVerificationSent) {
                  setEmailVerificationSent(false);
                }
              }}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}
              
              {!emailVerificationSent ? (
                // Email change form
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>{translate('profile.currentPassword')}</Text>
                    <TextInput
                      style={[styles.input, errors.currentPassword ? styles.inputError : null]}
                      secureTextEntry
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      placeholder={translate('profile.enterCurrentPassword')}
                    />
                    {errors.currentPassword && (
                      <Text style={styles.errorText}>{errors.currentPassword}</Text>
                    )}
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>{translate('profile.newEmail')}</Text>
                    <TextInput
                      style={[styles.input, errors.newEmail ? styles.inputError : null]}
                      keyboardType="email-address"
                      value={newEmail}
                      onChangeText={setNewEmail}
                      placeholder={translate('profile.enterNewEmail')}
                      autoCapitalize="none"
                    />
                    {errors.newEmail && (
                      <Text style={styles.errorText}>{errors.newEmail}</Text>
                    )}
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.saveButton, loading ? styles.disabledButton : null]}
                    onPress={handleChangeEmail}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>{translate('profile.updateEmail')}</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                // Verification sent screen
                <View style={styles.verificationContainer}>
                  <Ionicons name="mail-outline" size={50} color="#FF3B30" style={styles.verificationIcon} />
                  
                  <Text style={styles.verificationTitle}>
                    {translate('profile.checkYourEmail')}
                  </Text>
                  
                  <Text style={styles.verificationInstructions}>
                    {`${translate('profile.verificationEmailSentTo')} ${pendingNewEmail}`}
                  </Text>
                  
                  <Text style={styles.verificationNote}>
                    {translate('profile.clickLinkInEmail')}
                  </Text>
                  
                  {verificationError && (
                    <Text style={styles.errorText}>{verificationError}</Text>
                  )}
                  
                  <View style={styles.verificationActions}>
                    <TouchableOpacity 
                      style={styles.resendButton}
                      onPress={handleResendVerification}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FF3B30" size="small" />
                      ) : (
                        <Text style={styles.resendButtonText}>
                          {translate('profile.resendEmail')}
                        </Text>
                      )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.doneButton}
                      onPress={() => {
                        setEmailModalVisible(false);
                        setEmailVerificationSent(false);
                      }}
                    >
                      <Text style={styles.doneButtonText}>
                        {translate('profile.done')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{translate('profile.changePassword')}</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>{translate('profile.currentPassword')}</Text>
                <TextInput
                  style={[styles.input, errors.currentPassword ? styles.inputError : null]}
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder={translate('profile.enterCurrentPassword')}
                />
                {errors.currentPassword && (
                  <Text style={styles.errorText}>{errors.currentPassword}</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>{translate('profile.newPassword')}</Text>
                <TextInput
                  style={[styles.input, errors.newPassword ? styles.inputError : null]}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder={translate('profile.enterNewPassword')}
                />
                {errors.newPassword && (
                  <Text style={styles.errorText}>{errors.newPassword}</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>{translate('profile.confirmNewPassword')}</Text>
                <TextInput
                  style={[styles.input, errors.confirmNewPassword ? styles.inputError : null]}
                  secureTextEntry
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  placeholder={translate('profile.confirmPassword')}
                />
                {errors.confirmNewPassword && (
                  <Text style={styles.errorText}>{errors.confirmNewPassword}</Text>
                )}
              </View>
              
              <TouchableOpacity 
                style={[styles.saveButton, loading ? styles.disabledButton : null]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.buttonText}>{translate('profile.updatePassword')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

// Add these styles to the existing StyleSheet
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
  
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
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
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // New styles for verification flow
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
    marginHorizontal: 15,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  verificationText: {
    color: '#555',
    fontSize: 12,
    marginLeft: 5,
    marginRight: 10,
  },
  resendLink: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '500',
    marginRight: 10,
  },
  cancelLink: {
    color: '#555',
    fontSize: 12,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  disabledText: {
    color: '#aaa',
  },
  verificationContainer: {
    alignItems: 'center',
    padding: 10,
  },
  verificationIcon: {
    marginBottom: 15,
  },
  verificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  verificationInstructions: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 15,
  },
  verificationNote: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
  },
  verificationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  resendButton: {
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 4,
    padding: 10,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  doneButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 4,
    padding: 10,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ProfileScreen;