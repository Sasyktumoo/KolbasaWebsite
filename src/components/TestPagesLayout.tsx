import React from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView,
  ScrollView,
  Platform,
  Dimensions
} from 'react-native';


interface LayoutProps {
  children: React.ReactNode;
  activeCategory?: string;
}

// Get the window height for proper scrolling
const windowHeight = Dimensions.get('window').height;

const TextPagesLayout = ({ children, activeCategory }: LayoutProps) => {
  // Check if children directly contain ScrollView
  const hasScrollView = React.Children.toArray(children).some(
    child => React.isValidElement(child) && child.type === ScrollView
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header removed from here */}
      <View style={styles.contentContainer}>
        
        {/* Main content area */}
        <View style={styles.mainContent}>
          {hasScrollView ? (
            // If children already include a ScrollView, render directly to avoid nesting
            console.log('Rendering existing ScrollView'),
            children
          ) : (
            // Otherwise wrap in our own ScrollView
            console.log('Wrapping children in ScrollView'),
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.innerContent}>
                {children}
                {/* Add extra padding at the bottom */}
                <View style={styles.bottomPadding} />
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#fff',
    // Increase height for more content visibility
    height: windowHeight - (Platform.OS === 'web' ? 60 : 100), // Adjust for header height
    overflow: 'hidden', // Keep this to prevent content from spilling outside
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 50, // Add bottom padding for scroll area
  },
  innerContent: {
    padding: 15,
    width: '100%',
  },
  // Add generous bottom padding to ensure all content is visible
  bottomPadding: {
    height: 150, // Extra space at bottom (increased from original)
  }
});

export default TextPagesLayout;