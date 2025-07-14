import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Dimensions,
} from 'react-native';
// Import shared styles
import layouts from '../../designs/layouts';
import components from '../../designs/components';
import colors from '../../designs/colors';

// Get screen width for responsive design
const windowWidth = Dimensions.get('window').width;
const isSmallScreen = windowWidth < 768;

const styles = StyleSheet.create({
  // Use shared styles from layouts and components
  safeArea: layouts.safeArea,
  container: layouts.container,
  scrollView: layouts.scrollView,
  scrollViewContent: layouts.scrollViewContent,
  
  // Tab navigation
  tabNavigation: components.tabBar,
  tab: components.tab,
  activeTab: components.activeTab,
  tabText: components.tabText,
  activeTabText: components.activeTabText,
  
  // Characteristics
  characteristic: components.characteristic,
  
  // Layout helpers
  row: layouts.row,
  center: layouts.center,
  spaceBetween: layouts.spaceBetween,
  
  // Product styles
  productImage: components.productImage,
  
  // Section styles
  section: layouts.section,
  sectionTitle: layouts.sectionTitle,
  divider: layouts.divider,
  
  // Keep existing custom styles
  header: {
    backgroundColor: colors.background.main,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
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
    color: colors.text.secondary,
  },
  emailText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 3,
  },
  languageSelector: {
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
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
  loginText: {
    fontSize: 14,
    color: colors.primary,
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  catalogButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
  },
  catalogButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  searchBar: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
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
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 5,
    marginLeft: 5,
  },
  breadcrumbs: {
    padding: 10,
  },
  breadcrumbsText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  titleContainer: {
    padding: 10,
    backgroundColor: colors.background.main,
    marginBottom: 5,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  highlightText: {
    color: colors.primary,
  },
  
  mainProductSection: {
    flexDirection: isSmallScreen ? 'column' : 'row',
    flexWrap: isSmallScreen ? 'nowrap' : 'wrap',
    padding: 10,
    backgroundColor: colors.background.main,
    justifyContent: 'space-between',
  },
  productImageContainer: {
    width: isSmallScreen ? '100%' : '40%',
    aspectRatio: 1,
    backgroundColor: colors.background.main,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 5,
    padding: 5,
    marginBottom: 10,
    position: 'relative',
  },
  imageNavigation: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  imageNavButton: {
    backgroundColor: colors.background.main,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border.light,
    marginHorizontal: 3,
  },
  activeImageDot: {
    backgroundColor: colors.primary,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  purchasePanel: {
    width: isSmallScreen ? '100%' : '35%',
    padding: 10,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: isSmallScreen ? 10 : 0,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.text.light,
    marginRight: 8,
  },
  pricePerKg: {
    fontSize: isSmallScreen ? 14 : 28,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: colors.background.tertiary,
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  minOrderText: {
    fontSize: 14,
    marginBottom: 10,
    color: colors.text.light,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityInput: {
    width: 60,
    height: 36,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.light,
    textAlign: 'center',
  },
  totalPrice: {
    fontSize: isSmallScreen ? 12 : 24,
    fontWeight: 'bold',
  },
  orderButton: {
    ...components.buttonPrimary,
    marginTop: 10,
  },
  orderButtonText: components.buttonText,
  supplierCard: {
    width: isSmallScreen ? '100%' : '20%',
    padding: 10,
    backgroundColor: colors.background.main,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  supplierName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  supplierBadge: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 15,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  supplierBadgeText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  writeToSupplierButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
    width: '100%',
    justifyContent: 'center',
  },
  writeToSupplierText: {
    color: colors.primary,
    marginLeft: 5,
    fontSize: 12,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
    width: '100%',
    justifyContent: 'center',
  },
  phoneButtonText: {
    color: colors.primary,
    marginLeft: 5,
    fontSize: 12,
  },
  otherProductsSection: {
    padding: 10,
    backgroundColor: colors.background.main,
    marginTop: 10,
  },
  otherProductsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  thumbnailContainer: {
    flexDirection: 'row',
  },
  thumbnailWrapper: {
    width: 120,
    height: 120,
    backgroundColor: colors.background.main,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 5,
    margin: 5,
    padding: 5,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  activeLanguage: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  languageSeparator: {
    marginHorizontal: 3,
    color: colors.text.lighter,
  },
  deliveryAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 5,
    padding: 8,
    width: '100%',
    justifyContent: 'center',
    marginTop: 10,
  },
  deliveryAddressText: {
    color: colors.primary,
    marginLeft: 5,
    fontSize: 12,
  },
  
  // Detail section styles
  detailSection: {
    padding: 15,
    backgroundColor: colors.background.main,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  detailSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 15,
  },
  detailText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.secondary,
  },
  characteristicName: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
  },
  characteristicValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  largeModalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalPhoneNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FF3B30',
  },
  modalButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  formLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  formTextArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  largeTextArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  whatsAppButton: {
    backgroundColor: '#25D366', // WhatsApp green
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  iconMargin: {
    marginRight: 10,
  },
  weightInfo: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 10,
  },
});

export default styles;