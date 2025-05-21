import { StyleSheet } from 'react-native';
import colors from './colors';

const typography = StyleSheet.create({
  // Headings
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 20,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 15,
  },
  h3: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 15,
  },
  h4: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 10,
  },
  
  // Body text
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.primary,
    marginBottom: 20,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text.primary,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.text.secondary,
  },
  
  // Special text styles
  bold: {
    fontWeight: 'bold',
  },
  highlight: {
    color: colors.primary,
  },
  center: {
    textAlign: 'center',
  },
  right: {
    textAlign: 'right',
  },
});

export default typography;