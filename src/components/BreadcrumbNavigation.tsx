import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity 
} from 'react-native';

interface BreadcrumbItem {
  id: string;
  label: string;
  onPress: () => void;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
}

const BreadcrumbNavigation = ({ items }: BreadcrumbNavigationProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.breadcrumbsContent}>
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 && (
              <Text style={styles.separator}>{'>'}</Text>
            )}
            <TouchableOpacity 
              onPress={item.onPress}
              style={[
                styles.breadcrumbItem,
                index === items.length - 1 && styles.currentBreadcrumb
              ]}
            >
              <Text 
                style={[
                  styles.breadcrumbText, 
                  index === items.length - 1 && styles.currentBreadcrumbText
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e7e7e7',
  },
  breadcrumbsContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  breadcrumbItem: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  breadcrumbText: {
    fontSize: 12,
    color: '#666',
  },
  currentBreadcrumb: {
    backgroundColor: '#f5f5f5',
    borderRadius: 3,
  },
  currentBreadcrumbText: {
    fontWeight: '500',
    color: '#333',
  },
  separator: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 4,
  },
});

export default BreadcrumbNavigation;