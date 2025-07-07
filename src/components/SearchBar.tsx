import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

const SearchBar = ({ 
  onSearch = () => {}, 
  placeholder = "Find" 
}: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <TextInput 
          style={styles.searchInput}
          placeholder={placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
      </View>
      
      <TouchableOpacity style={styles.geographyButton}>
        <Text>Search Geography</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.searchButton}
        onPress={handleSearch}
      >
        <Ionicons name="search" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchBar: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 5,
    marginLeft: 5,
  },
});

export default SearchBar;