import React, { createContext, useState, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './i18n';

// Define the TypeScript interface for your context
interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
}

// Create context with default values
export const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'en',
  changeLanguage: () => {} 
});

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');


  const changeLanguage = (language) => {
    console.log('Context: changeLanguage called with:', language);
    
    setCurrentLanguage(language);
    
    i18n.changeLanguage(language);
    
    // Save to storage (don't block UI update with await)
    AsyncStorage.setItem('userLanguage', language)
      .then(() => console.log('Language saved successfully:', language))
      .catch(error => console.error('Error saving language preference:', error));
  };

  // Debug log when language changes
  useEffect(() => {
    console.log('Context language state updated to:', currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    // Load saved language preference
    AsyncStorage.getItem('userLanguage')
      .then(savedLanguage => {
        if (savedLanguage) {
          console.log('Loaded saved language:', savedLanguage);
          setCurrentLanguage(savedLanguage);
          i18n.changeLanguage(savedLanguage);
        }
      })
      .catch(error => console.error('Error loading language:', error));
  }, []);

  const contextValue = {
    currentLanguage,
    changeLanguage
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </LanguageContext.Provider>
  );
};