import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BreadcrumbNavigation from '../components/BreadcrumbNavigation';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define navigation param types
type RootStackParamList = {
  CategoryPage: {
    categoryId: string;
    categoryPath: string[];
    categoryName: string;
  };
  ProductDetailPage: {
    product: any; // Replace with proper product type if available
    breadcrumbPath: string[];
  };
};

export default function ProductDetailScreen({ route }) {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [quantity, setQuantity] = useState(50);
  const [activeTab, setActiveTab] = useState('description');
  
  // Get product data from navigation params
  const { product, breadcrumbPath } = route.params || { 
    product: {
      name: 'Beef Shank',
      price: 228.65,
      minOrder: 50,
      image: require('../assets/images/placeholder.png')
    },
    breadcrumbPath: ['product_catalog', 'food_products', 'meat', 'beef', 'beef-shank']
  };
  
  const pricePerKg = product.price;
  
  const decreaseQuantity = () => {
    if (quantity > product.minOrder) setQuantity(quantity - 1);
  };
  
  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  const totalPrice = (pricePerKg * quantity).toFixed(2);
  
  // Generate breadcrumb items based on the path
  const generateBreadcrumbItems = () => {
    // Start with catalog
    const items = [
      {
        id: 'catalog',
        label: 'Product Catalog',
        onPress: () => navigation.navigate('CategoryPage', { 
          categoryId: 'catalog',
          categoryPath: ['product_catalog'],
          categoryName: 'Product Catalog'
        })
      }
    ];

    // Build breadcrumbs from breadcrumbPath
    let currentPath = '';
    const pathItems = breadcrumbPath.slice(1, -1); // Skip the first and last items
    pathItems.forEach((path, index) => {
      if (index === 0) {
        currentPath = path;
      } else {
        currentPath = `${currentPath}/${path}`;
      }
      
      items.push({
        id: path,
        label: path.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        onPress: () => navigation.navigate('CategoryPage', {
          categoryId: path,
          categoryPath: ['product_catalog', ...(currentPath.split('/'))],
          categoryName: path.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        })
      });
    });

    // Add the current product as the last item
    items.push({
      id: 'current-product',
      label: product.name,
      onPress: () => {} // No action for current product
    });

    return items;
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {/* Right-aligned company info */}
            <View style={styles.headerCompanyInfo}>
              <Text style={styles.logoText}>B2B.TRADE</Text>
              <Text style={styles.phoneNumber}>+7 (999) 123-45-67</Text>
              <Text style={styles.emailText}>info@b2b.trade</Text>
            </View>
            
            <View style={styles.headerIcons}>
              <Ionicons name="notifications-outline" size={24} color="black" style={styles.icon} />
              <Ionicons name="cart-outline" size={24} color="black" style={styles.icon} />
              <Text style={styles.loginText}>Login / Register</Text>
            </View>
          </View>
                    
          <View style={styles.navigationBar}>
            <TouchableOpacity 
              style={styles.catalogButton}
              onPress={() => navigation.navigate('CategoryPage', { 
                categoryId: 'catalog',
                categoryPath: ['product_catalog'],
                categoryName: 'Product Catalog'
              })}
            >
              <Text style={styles.catalogButtonText}>Catalog</Text>
            </TouchableOpacity>
            <View style={styles.searchBar}>
              <TextInput 
                style={styles.searchInput}
                placeholder="Find"
              />
            </View>
            <TouchableOpacity style={styles.geographyButton}>
              <Text>Search Geography</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchButton}>
              <Ionicons name="search" size={20} color="white" />
            </TouchableOpacity>
            {/* Language selector */}
            <View style={styles.languageSelector}>
              <Text style={styles.languageText}>Ru | Р</Text>
            </View>
          </View>
        </View>
        
        {/* Dynamic Breadcrumbs */}
        <BreadcrumbNavigation items={generateBreadcrumbItems()} />
        
        {/* Product Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.productDescription}>
            To order in bulk from the supplier, 
            <Text style={styles.highlightText}> write </Text> 
            or 
            <Text style={styles.highlightText}> order a call </Text> 
            or 
            <Text style={styles.highlightText}> call </Text>
          </Text>
        </View>
        
        {/* Rest of the component remains unchanged */}
        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'description' && styles.activeTab]}
            onPress={() => setActiveTab('description')}
          >
            <Text style={[styles.tabText, activeTab === 'description' && styles.activeTabText]}>Description</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'characteristics' && styles.activeTab]}
            onPress={() => setActiveTab('characteristics')}
          >
            <Text style={[styles.tabText, activeTab === 'characteristics' && styles.activeTabText]}>Characteristics</Text>
          </TouchableOpacity>
        </View>
        
        {/* Main Product Section */}
        <View style={styles.mainProductSection}>
          {/* Product Image */}
          <View style={styles.productImageContainer}>
            <Image 
              source={product.image} 
              style={styles.productImage}
              resizeMode="contain"
            />
          </View>
          
          {/* Purchase Panel */}
          <View style={styles.purchasePanel}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Price per kg:</Text>
              <Text style={styles.pricePerKg}>{pricePerKg}₽</Text>
            </View>
            
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Prices may vary due to currency volatility. For exact pricing, please 
                <Text style={styles.highlightText}> contact the supplier.</Text>
              </Text>
            </View>
            
            <Text style={styles.minOrderText}>Min. order: {product.minOrder} kg</Text>
            
            {/* Quantity Selector */}
            <View style={styles.quantitySelector}>
              <TouchableOpacity style={styles.quantityButton} onPress={decreaseQuantity}>
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.quantityInput}
                value={quantity.toString()}
                keyboardType="numeric"
                onChangeText={(text) => {
                  const value = parseInt(text) || product.minOrder;
                  setQuantity(value < product.minOrder ? product.minOrder : value);
                }}
              />
              <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Total price:</Text>
              <Text style={styles.totalPrice}>{totalPrice}₽</Text>
            </View>
            
            <TouchableOpacity style={styles.orderButton}>
              <Text style={styles.orderButtonText}>To order</Text>
            </TouchableOpacity>
          </View>
          
          {/* Supplier Card */}
          <View style={styles.supplierCard}>
            <Text style={styles.supplierName}>Vyacheslav Nikolaevich Tyulenev</Text>
            <View style={styles.supplierBadge}>
              <Text style={styles.supplierBadgeText}>Producer</Text>
            </View>
            <TouchableOpacity style={styles.writeToSupplierButton}>
              <Ionicons name="mail-outline" size={18} color="#FF3B30" />
              <Text style={styles.writeToSupplierText}>Write to supplier</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.phoneButton}>
              <Ionicons name="call-outline" size={18} color="#FF3B30" />
              <Text style={styles.phoneButtonText}>Show phone number</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Other Products */}
        <View style={styles.otherProductsSection}>
          <Text style={styles.otherProductsTitle}>Other products from this supplier</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailContainer}>
            {[1, 2, 3, 4, 5].map((item) => (
              <View key={item} style={styles.thumbnailWrapper}>
                <Image
                  source={require('../assets/images/placeholder.png')}
                  style={styles.thumbnail}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Your existing styles remain the same
const styles = StyleSheet.create({
  // Your existing styles
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  headerCompanyInfo: {
    alignItems: 'flex-end',  // Right align all content
    flex: 1,
  },
  phoneNumber: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 3,
    color: '#555',
  },
  emailText: {
    fontSize: 12,
    color: '#555',
    marginTop: 3,
  },
  languageSelector: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  languageText: {
    fontSize: 12,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  icon: {
    marginHorizontal: 8,
  },
  loginText: {
    fontSize: 14,
    color: '#FF3B30',
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  catalogButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
  },
  catalogButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  breadcrumbs: {
    padding: 10,
  },
  breadcrumbsText: {
    fontSize: 12,
    color: '#666',
  },
  titleContainer: {
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 5,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  highlightText: {
    color: '#FF3B30',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    padding: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF3B30',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  mainProductSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  productImageContainer: {
    width: '40%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 5,
    padding: 5,
    marginBottom: 10,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  purchasePanel: {
    width: '35%',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: '#888',
    marginRight: 8,
  },
  pricePerKg: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  minOrderText: {
    fontSize: 14,
    marginBottom: 10,
    color: '#888',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityInput: {
    width: 60,
    height: 36,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    textAlign: 'center',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  orderButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  orderButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  supplierCard: {
    width: '20%',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  supplierName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  supplierBadge: {
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  supplierBadgeText: {
    fontSize: 12,
    color: '#666',
  },
  writeToSupplierButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
    width: '100%',
    justifyContent: 'center',
  },
  writeToSupplierText: {
    color: '#FF3B30',
    marginLeft: 5,
    fontSize: 12,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 5,
    padding: 8,
    width: '100%',
    justifyContent: 'center',
  },
  phoneButtonText: {
    color: '#FF3B30',
    marginLeft: 5,
    fontSize: 12,
  },
  otherProductsSection: {
    padding: 10,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  otherProductsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  thumbnailContainer: {
    flexDirection: 'row',
  },
  thumbnailWrapper: {
    width: 120,
    height: 120,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 5,
    margin: 5,
    padding: 5,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});