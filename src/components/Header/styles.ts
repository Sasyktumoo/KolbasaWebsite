import { StyleSheet, Dimensions } from 'react-native';

export const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 10,
  },
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 20,
  },
  headerMainMobile: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoContainer: {
    alignSelf: 'flex-start',
    paddingLeft: 0,
    marginLeft: 0,
  },
  logoContainerMobile: {
    marginBottom: 10,
  },
  logoImage: {
    paddingTop: 10,
    height: Dimensions.get('window').width * 0.1,
    width: Dimensions.get('window').width * 0.14
  },
  logoImageMobile: {
    height: Dimensions.get('window').width * 0.08,
    width: Dimensions.get('window').width * 0.12
  },
  rightSection: {
    alignItems: 'flex-end',
    zIndex: 30,
    width: Dimensions.get('window').width <= 768 ? '100%' : 'auto',
  },
  headerIconsMobile: {
    marginLeft: 0,
    justifyContent: 'flex-end',
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  headerCompanyInfo: {
    alignItems: 'flex-end',
    marginRight: 10
  },
  navigationControls: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    zIndex: 40,
  },
  navigationControlsMobile: {
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    paddingRight: 0,
  },
  websiteTitle: {
    fontSize: 55,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  websiteTitleMobile: {
    fontSize: 24,
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
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    zIndex: 50,
    paddingRight: 0,
  },
  icon: {
    marginHorizontal: 8,
  },
  loginText: {
    fontSize: 14,
    color: '#FF3B30',
  },
  catalogButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    marginRight: 15,
  },
  catalogButtonMobile: {
    width: '30%',
    marginBottom: 10,
  },
  catalogButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainerMobile: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 10,
  },
  searchBar: {
    width: 180,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    height: 36,
    justifyContent: 'center',
  },
  searchBarMobile: {
    width: '80%',
  },
  searchInput: {
    padding: 8,
  },
  searchButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 5,
    marginLeft: 5,
  },
  // Language selector styles
  languageSelector: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 6,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageText: {
    fontSize: 12,
    paddingHorizontal: 3,
    marginLeft: 3,
  },
  languageSelectorContainer: {
    position: 'relative',
    zIndex: 1500,
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: 30,
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
    zIndex: 2000,
  },
  langDropdown: {
    position: 'absolute',
    right: 0,
    minWidth: 120,
    top: 35,
    zIndex: 2000,
    elevation: 8,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  activeLanguageItem: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  activeLanguageText: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  cartBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeWide: {
    minWidth: 28,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  // NavBar styles
  navOptionsBar: {
    marginTop: 10,
    backgroundColor: '#fff',
    zIndex: 5,
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
  navOptionMobile: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginHorizontal: 3,
  },
  navOptionText: {
    fontSize: 14,
    color: '#333',
  },
  navOptionTextMobile: {
    fontSize: 12,
  },
  // New mobile layout styles
  mobileHeaderContainer: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  mobileCompanyInfo: {
    alignItems: 'flex-start',
    marginBottom: 10,
    width: '100%',
  },
  mobileWebsiteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  mobilePhoneNumber: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
  },
  mobileEmailText: {
    fontSize: 10,
    color: '#555',
  },
  mobileFirstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  mobileCatalogButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 5,
    width: '25%',
  },
  mobileSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '75%',
  },
  mobileSearchInput: {
    flex: 1,
    padding: 6,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    height: 34,
  },
  mobileSearchButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 5,
    marginLeft: 5,
    height: 34,
    justifyContent: 'center',
  },
  mobileSecondRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',

  },
});