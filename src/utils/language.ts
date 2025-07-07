import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

/**
 * Changes the application language while preserving current navigation state
 * @param navigation The navigation object from useNavigation hook
 * @param route The current route
 * @param newLocale The new locale to switch to (e.g., 'en', 'ru')
 */
export const changeLanguage = (
  navigation: StackNavigationProp<RootStackParamList>,
  route: {name: keyof RootStackParamList, params: any},
  newLocale: string
) => {
  // Create a copy of current params but with updated locale
  const currentParams = { ...route.params, locale: newLocale };
  
  // Navigate to the same screen with updated locale parameter
  navigation.navigate(route.name, currentParams);
};