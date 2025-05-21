import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from './LanguageContext';

/**
 * Custom hook that combines language context and translation functionality
 * @returns Object with translation function, current language and language change function
 */
export const useLanguage = () => {
  const { currentLanguage, changeLanguage } = useContext(LanguageContext);
  const { t } = useTranslation();
  
  return {
    t,                // Translation function
    translate: t,     // Alias for 't' if you prefer the more descriptive name
    currentLanguage,  // Current active language
    changeLanguage,   // Function to change language
  };
};