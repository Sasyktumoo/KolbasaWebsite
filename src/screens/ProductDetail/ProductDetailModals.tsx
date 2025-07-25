import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './ProductDetailPageDesign';
import { useLanguage } from '../../context/languages/useLanguage';
import { useAlert } from '../../context/AlertContext';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import emailService from '../../services/EmailService';
import { CallbackRequestType, SupplierMessageType } from './ProductDetailTypes';

// Create a dedicated overlay style
const overlayStyle = StyleSheet.create({
  fullScreenOverlay: {
    position: 'absolute', // 'absolute' works on both platforms
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: Platform.OS === 'web' ? '100vw' as unknown as number : '100%', // Use viewport width on web
    height: Platform.OS === 'web' ? '100vh' as unknown as number : '100%', // Use viewport height on web
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    // Reset any margins/paddings that might be inherited
    margin: 0,
    padding: 0,
    // On web, ensure it's fixed to the viewport
    ...(Platform.OS === 'web' ? {
      position: 'fixed' as any, // Cast as any to avoid TypeScript error
    } : {})
  }
});

// Phone popup component
type PhonePopupProps = {
  visible: boolean;
  onClose: () => void;
};

export const PhonePopup = ({ visible, onClose }: PhonePopupProps) => {
  const { t } = useLanguage();
  if (!visible) return null;
  
  // Sample phone number - you can replace with actual data from supplier
  const phoneNumber = "+34 652 34 66 51";

  return (
    <View style={overlayStyle.fullScreenOverlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{t('productDetail.phoneNumber')}</Text>
        <Text style={styles.modalPhoneNumber}>{phoneNumber}</Text>
        <TouchableOpacity style={styles.modalButton} onPress={onClose}>
          <Text style={styles.modalButtonText}>{t('common.close')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Callback Request Form component
type CallbackRequestFormProps = {
  visible: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
};

export const CallbackRequestForm = ({ 
  visible, 
  onClose,
  productId,
  productName
}: CallbackRequestFormProps) => {
  const { t, currentLanguage } = useLanguage();
  const { alert } = useAlert();
  // Change default to +34 instead of empty string
  const [callbackPhone, setCallbackPhone] = useState('+34');
  const [callbackComments, setCallbackComments] = useState('');
  const [sendingCallbackRequest, setSendingCallbackRequest] = useState(false);
  // Add state for country code dropdown
  const [showCountryCodeDropdown, setShowCountryCodeDropdown] = useState(false);
  
  // Add list of common country codes
  const countryCodes = [
    { label: '🇪🇸 Spain (+34)', value: '+34' },
    { label: '🇷🇺 Russia (+7)', value: '+7' },
    { label: '🇺🇦 Ukraine (+380)', value: '+380' },
    { label: '🇺🇸 USA (+1)', value: '+1' },
    { label: '🇬🇧 UK (+44)', value: '+44' },
    { label: '🇩🇪 Germany (+49)', value: '+49' },
    { label: '🇫🇷 France (+33)', value: '+33' },
    { label: '🇮🇹 Italy (+39)', value: '+39' },
    { label: '🇵🇹 Portugal (+351)', value: '+351' },
    { label: '🇨🇿 Czech Republic (+420)', value: '+420' },
    { label: '🇵🇱 Poland (+48)', value: '+48' },
    { label: '🇸🇰 Slovakia (+421)', value: '+421' },
    { label: '🇧🇬 Bulgaria (+359)', value: '+359' },
    { label: '🇷🇴 Romania (+40)', value: '+40' },
    { label: '🇭🇺 Hungary (+36)', value: '+36' },
    { label: '🇳🇱 Netherlands (+31)', value: '+31' },
    { label: '🇧🇪 Belgium (+32)', value: '+32' },
    { label: '🇨🇭 Switzerland (+41)', value: '+41' },
    { label: '🇦🇹 Austria (+43)', value: '+43' },
    { label: '🇮🇪 Ireland (+353)', value: '+353' },
    { label: '🇬🇷 Greece (+30)', value: '+30' },
    { label: '🇹🇷 Türkiye (+90)', value: '+90' },
    { label: '🇮🇱 Israel (+972)', value: '+972' },
    { label: '🇦🇿 Azerbaijan (+994)', value: '+994' },
    { label: '🇦🇲 Armenia (+374)', value: '+374' },
    { label: '🇬🇪 Georgia (+995)', value: '+995' },
    { label: '🇧🇾 Belarus (+375)', value: '+375' },
    { label: '🇱🇻 Latvia (+371)', value: '+371' },
    { label: '🇱🇹 Lithuania (+370)', value: '+370' },
    { label: '🇪🇪 Estonia (+372)', value: '+372' },
    { label: '🇩🇰 Denmark (+45)', value: '+45' },
    { label: '🇳🇴 Norway (+47)', value: '+47' },
    { label: '🇸🇪 Sweden (+46)', value: '+46' },
    { label: '🇫🇮 Finland (+358)', value: '+358' },
    { label: '🇮🇸 Iceland (+354)', value: '+354' },
    { label: '🇷🇸 Serbia (+381)', value: '+381' },
    { label: '🇭🇷 Croatia (+385)', value: '+385' },
    { label: '🇸🇮 Slovenia (+386)', value: '+386' },
    { label: '🇧🇦 Bosnia & Herzegovina (+387)', value: '+387' },
    { label: '🇲🇪 Montenegro (+382)', value: '+382' },
    { label: '🇲🇰 North Macedonia (+389)', value: '+389' },
    { label: '🇽🇰 Kosovo (+383)', value: '+383' },
  ];
  
  // Add refs for maintaining focus
  const phoneInputRef = useRef(null);
  const commentsInputRef = useRef(null);
  
  if (!visible) return null;
  
  // Function to select country code
  const selectCountryCode = (code) => {
    // Extract just the numbers after the + and replace the beginning of the phone number
    const currentNumberPart = callbackPhone.replace(/^\+\d+/, '');
    setCallbackPhone(`${code}${currentNumberPart}`);
    setShowCountryCodeDropdown(false);
  };
  
  const handleSubmitCallback = async () => {
    // Validate phone number
    if (!callbackPhone.trim()) {
      alert(
        t('productDetail.invalidPhoneTitle') || 'Invalid Phone',
        t('productDetail.invalidPhoneMessage') || 'Please enter a valid phone number.',
        [{ text: t('common.ok') || 'OK', style: 'default' }]
      );
      return;
    }
    
    setSendingCallbackRequest(true);
    
    try {
      // Create callback request data
      const callbackRequest: CallbackRequestType = {
        type: 'callback',
        product: {
          id: productId,
          name: productName,
        },
        customer: {
          name: 'Customer', // We don't collect name for callbacks
          email: 'supplier@example.com', // Send to supplier email
          phone: callbackPhone,
        },
        comments: callbackComments,
        language: currentLanguage // Add the language parameter
      };
      
      // Save to Firestore
      const db = getFirestore();
      await addDoc(collection(db, 'callbackRequests'), callbackRequest);
      
      // Send email notification if on web platform
      if (Platform.OS === 'web') {
        try {
          await emailService.initialize();
          
          // Send callback request email with language parameter
          await emailService.sendCallbackRequest(callbackRequest);
        } catch (emailError) {
          console.error("Failed to send callback request email:", emailError);
          // Don't show error to user as the request was still saved
        }
      }
      
      // Show success message and close form
      alert(
        t('productDetail.callbackRequestTitle') || 'Request Callback',
        t('productDetail.callbackRequestMessage') || 'Your callback request has been sent to the supplier. They will contact you shortly.',
        [{ text: t('common.ok') || 'OK', onPress: onClose }]
      );
      
      // Reset form
      setCallbackPhone('+34');
      setCallbackComments('');
      
    } catch (error) {
      console.error('Error submitting callback request:', error);
      alert(
        t('productDetail.callbackErrorTitle') || 'Request Failed',
        t('productDetail.callbackErrorMessage') || 'We encountered an error sending your request. Please try again later.',
        [{ text: t('common.ok') || 'OK', style: 'default' }]
      );
    } finally {
      setSendingCallbackRequest(false);
    }
  };
  
  return (
    <View style={overlayStyle.fullScreenOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{t('productDetail.requestCallbackTitle')}</Text>
        
        <Text style={styles.formLabel}>{t('productDetail.phoneNumberLabel')}*</Text>
        
        {/* Replace the single input with a phone input container */}
        <View style={styles.phoneInputContainer}>
          {/* Country code selector */}
          <TouchableOpacity 
            style={styles.countryCodeSelector} 
            onPress={() => setShowCountryCodeDropdown(!showCountryCodeDropdown)}
          >
            <Text>{callbackPhone.match(/^\+\d+/)?.[0] || '+34'}</Text>
            <Ionicons name="chevron-down" size={16} color="#666" style={{ marginLeft: 5 }} />
          </TouchableOpacity>
          
          {/* Phone number input */}
          <TextInput
            ref={phoneInputRef}
            style={styles.phoneInput}
            value={callbackPhone.replace(/^\+\d+/, '')}
            onChangeText={(text) => {
              const countryCode = callbackPhone.match(/^\+\d+/)?.[0] || '+34';
              setCallbackPhone(`${countryCode}${text}`);
            }}
            placeholder={t('productDetail.enterPhonePlaceholder') || "Enter your phone number"}
            keyboardType="phone-pad"
            autoFocus={true}
          />
        </View>
        
        {/* Country code dropdown */}
        {showCountryCodeDropdown && (
          <View style={styles.countryDropdown}>
            <ScrollView style={{ maxHeight: 200 }}>
              {countryCodes.map((country, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.countryOption}
                  onPress={() => selectCountryCode(country.value)}
                >
                  <Text>{country.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        <Text style={styles.formLabel}>{t('productDetail.commentsLabel')}</Text>
        <TextInput
          ref={commentsInputRef}
          style={styles.formTextArea}
          value={callbackComments}
          onChangeText={setCallbackComments}
          placeholder={t('productDetail.commentsPlaceholder')}
          multiline={true}
          numberOfLines={4}
        />
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={onClose}
            disabled={sendingCallbackRequest}
          >
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.submitButton, { opacity: sendingCallbackRequest ? 0.7 : 1 }]} 
            onPress={handleSubmitCallback}
            disabled={sendingCallbackRequest}
          >
            {sendingCallbackRequest ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.modalButtonText}>{t('common.submit')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Write Options Modal component
type WriteOptionsModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectEmail: () => void;
  onSelectWhatsApp: () => void;
};

export const WriteOptionsModal = ({ 
  visible, 
  onClose,
  onSelectEmail,
  onSelectWhatsApp
}: WriteOptionsModalProps) => {
  const { t } = useLanguage();
  
  if (!visible) return null;
  
  return (
    <View style={overlayStyle.fullScreenOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{t('productDetail.contactOptionsTitle') || 'Contact Options'}</Text>
        
        <TouchableOpacity style={styles.emailButton} onPress={onSelectEmail}>
          <Ionicons name="mail-outline" size={20} color="white" style={styles.iconMargin} />
          <Text style={styles.iconButtonText}>{t('productDetail.sendEmail') || 'Send Email'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.whatsAppButton} onPress={onSelectWhatsApp}>
          <Ionicons name="logo-whatsapp" size={20} color="white" style={styles.iconMargin} />
          <Text style={styles.iconButtonText}>{t('productDetail.whatsAppChat') || 'WhatsApp Chat'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>{t('common.cancel') || 'Cancel'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Email Form Modal component
type EmailFormModalProps = {
  visible: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
};

export const EmailFormModal = ({ 
  visible, 
  onClose,
  productId,
  productName
}: EmailFormModalProps) => {
  const { t, currentLanguage } = useLanguage();
  const { alert } = useAlert();
  const [emailSenderName, setEmailSenderName] = useState('');
  const [emailSenderEmail, setEmailSenderEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Add refs for maintaining focus
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const messageInputRef = useRef(null);
  
  if (!visible) return null;
  
  // Constants
  const displayPhoneNumber = "+34 652 346 651"; // Formatted for display
  
  const handleSendEmail = async () => {
    // Validate form
    if (!emailSenderName.trim() || !emailSenderEmail.trim() || !emailMessage.trim()) {
      alert(
        t('productDetail.invalidFormTitle') || 'Incomplete Form',
        t('productDetail.invalidFormMessage') || 'Please fill in all required fields.',
        [{ text: t('common.ok') || 'OK', style: 'default' }]
      );
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailSenderEmail)) {
      alert(
        t('productDetail.invalidEmailTitle') || 'Invalid Email',
        t('productDetail.invalidEmailMessage') || 'Please enter a valid email address.',
        [{ text: t('common.ok') || 'OK', style: 'default' }]
      );
      return;
    }
    
    setSendingEmail(true);
    
    try {
      // Create email data
      const messageData: SupplierMessageType = {
        type: 'message',
        sender: {
          name: emailSenderName,
          email: emailSenderEmail,
        },
        supplier: {
          email: 'post@ulus.cz',
          phoneNumber: displayPhoneNumber,
        },
        product: {
          id: productId,
          name: productName,
        },
        message: emailMessage,
        language: currentLanguage // Add the language parameter
      };
      
      // Save to Firestore
      const db = getFirestore();
      await addDoc(collection(db, 'supplierMessages'), {
        ...messageData,
        sentAt: new Date().toISOString(),
      });
      
      // Send email notification if on web platform
      if (Platform.OS === 'web') {
        try {
          await emailService.initialize();
          
          // Send email using EmailService with language parameter
          await emailService.sendSupplierMessage(messageData);
        } catch (emailError) {
          console.error("Failed to send supplier message email:", emailError);
          // Don't show error to user as the message was still saved to Firestore
        }
      }
      
      // Show success message and close form
      alert(
        t('productDetail.messageSentTitle') || 'Message Sent',
        t('productDetail.messageSentMessage') || 'Your message has been sent to the supplier. They will contact you soon.',
        [{ text: t('common.ok') || 'OK', onPress: onClose }]
      );
      
      // Reset form
      setEmailSenderName('');
      setEmailSenderEmail('');
      setEmailMessage('');
      
    } catch (error) {
      console.error('Error sending message to supplier:', error);
      alert(
        t('productDetail.messageErrorTitle') || 'Message Failed',
        t('productDetail.messageErrorMessage') || 'We encountered an error sending your message. Please try again later.',
        [{ text: t('common.ok') || 'OK', style: 'default' }]
      );
    } finally {
      setSendingEmail(false);
    }
  };
  
  return (
    <View style={overlayStyle.fullScreenOverlay}>
      <View style={styles.largeModalContent}>
        <Text style={styles.modalTitle}>{t('productDetail.writeToSupplier')}</Text>
        
        <Text style={styles.formLabel}>{t('productDetail.yourNameLabel') || 'Your Name'}*</Text>
        <TextInput
          ref={nameInputRef}
          style={styles.formInput}
          value={emailSenderName}
          onChangeText={setEmailSenderName}
          placeholder={t('productDetail.yourNamePlaceholder') || 'Enter your name'}
        />
        
        <Text style={styles.formLabel}>{t('productDetail.yourEmailLabel') || 'Your Email'}*</Text>
        <TextInput
          ref={emailInputRef}
          style={styles.formInput}
          value={emailSenderEmail}
          onChangeText={setEmailSenderEmail}
          placeholder={t('productDetail.yourEmailPlaceholder') || 'Enter your email'}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Text style={styles.formLabel}>{t('productDetail.messageLabel') || 'Message'}*</Text>
        <TextInput
          ref={messageInputRef}
          style={styles.largeTextArea}
          value={emailMessage}
          onChangeText={setEmailMessage}
          placeholder={t('productDetail.messagePlaceholder') || 'Enter your message'}
          multiline={true}
          numberOfLines={6}
        />
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={onClose}
            disabled={sendingEmail}
          >
            <Text style={styles.cancelButtonText}>{t('common.cancel') || 'Cancel'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.submitButton, { opacity: sendingEmail ? 0.7 : 1 }]} 
            onPress={handleSendEmail}
            disabled={sendingEmail}
          >
            {sendingEmail ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.modalButtonText}>{t('common.send') || 'Send'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};