import { StyleSheet } from 'react-native';
import colors from './colors';

const components = StyleSheet.create({
  // Buttons
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.background.main,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextSecondary: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Cards
  card: {
    backgroundColor: colors.background.main,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingBottom: 10,
    marginBottom: 10,
  },
  
  // Form inputs
  input: {
    backgroundColor: colors.background.main,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 14,
    color: colors.text.primary,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: colors.text.secondary,
  },
  
  // Lists
  listItem: {
    paddingLeft: 15,
    marginBottom: 10,
  },
  
  // Tab navigation
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tab: {
    padding: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '500',
  },
  
  // Product-specific styles
  productCard: {
    width: '31%',
    backgroundColor: colors.background.main,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  productImage: {
    width: '100%',
    height: '100%',
    marginBottom: 8,
  },
  characteristic: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingVertical: 10,
  },
});

export default components;