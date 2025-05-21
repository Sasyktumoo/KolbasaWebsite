import { StyleSheet, Dimensions } from 'react-native';
import colors from './colors';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const layouts = StyleSheet.create({
  // Screen and container layouts
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  contentContainer: {
    padding: 25,
    maxWidth: 800,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  
  // Flexbox helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Page sections
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.text.primary,
  },
  
  // Dividers
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: 25,
  },
  
  // Padding and margin
  padding: {
    padding: 15,
  },
  paddingVertical: {
    paddingVertical: 15,
  },
  paddingHorizontal: {
    paddingHorizontal: 15,
  },
  margin: {
    margin: 15,
  },
});

export default layouts;