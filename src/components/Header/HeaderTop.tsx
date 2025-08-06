import React, { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { navigate } from '../../navigation/AppNavigator';
import { useLanguage } from '../../context/languages/useLanguage';
import { MobileHeaderLayout, DesktopHeaderLayout } from './HeaderTopLayouts';

interface HeaderTopProps {
  onCatalogPress?: () => void;
}

const HeaderTop: React.FC<HeaderTopProps> = ({ onCatalogPress }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { translate, currentLanguage } = useLanguage();
  const isMobile = Dimensions.get('window').width <= 768;
  
  // Reset search query when language changes
  useEffect(() => {
    setSearchQuery('');
  }, [currentLanguage]);

  const handleCatalogPress = () => {
    if (onCatalogPress) {
      onCatalogPress();
    } else {
      // Direct navigation to the CategoryPage instead of Home
      navigate('CategoryPage', { 
        categoryId: 'undefined',
        categoryPath: ['product_catalog'],
        categoryName: 'All Categories',
        locale: currentLanguage
      });
    }
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) {
      return; // Don't search with empty query
    }
    
    console.log('Searching for:', searchQuery);
    
    // Navigate to CategoryPage with search query parameter
    navigate('CategoryPage', { 
      categoryId: 'search',
      categoryPath: ['product_catalog', 'search'],
      categoryName: `${translate('search.results')}: ${searchQuery}`,
      locale: currentLanguage,
      searchQuery: searchQuery.trim().toLowerCase() // Pass search query as param
    });
    
    // Clear search field after searching
    setSearchQuery('');
  };

  return isMobile ? (
    <MobileHeaderLayout
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      handleCatalogPress={handleCatalogPress}
      handleSearchSubmit={handleSearchSubmit}
      translate={translate}
      currentLanguage={currentLanguage}
      isMobile={true}
    />
  ) : (
    <DesktopHeaderLayout
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      handleCatalogPress={handleCatalogPress}
      handleSearchSubmit={handleSearchSubmit}
      translate={translate}
      currentLanguage={currentLanguage}
      isMobile={false}
    />
  );
};

export default HeaderTop;