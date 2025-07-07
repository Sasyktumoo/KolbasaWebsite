import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  Platform,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Dialog, Portal, Button, Provider as PaperProvider } from 'react-native-paper';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Header from '../../components/Header';
import { useCart } from '../../context/cart/CartContext';
import { useLanguage } from '../../context/languages/useLanguage';

const CartScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { t, currentLanguage } = useLanguage();
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getTotalItems, 
    getTotalPrice,
    getItemPrice
  } = useCart();
  
  // State for managing dialog visibility
  const [clearCartDialogVisible, setClearCartDialogVisible] = useState(false);
  const [checkoutDialogVisible, setCheckoutDialogVisible] = useState(false);
  const [emptyCartDialogVisible, setEmptyCartDialogVisible] = useState(false);
  const [successDialogVisible, setSuccessDialogVisible] = useState(false);



  const handleCheckout = () => {
    if (items.length === 0) {
      setEmptyCartDialogVisible(true);
      return;
    }
    
    // Navigate to checkout form instead of showing dialog
    navigation.navigate('CheckoutForm');
  };
  
  const handleSuccessDialogDismiss = () => {
    setSuccessDialogVisible(false);
    navigation.navigate('Home', { locale: currentLanguage });
  };

  const renderItem = ({ item }) => {
    // Use the getItemPrice function to get price based on weight
    const itemPrice = (Number(getItemPrice(item)) / item.quantity).toFixed(2);
    const totalItemPrice = getItemPrice(item);
    
    return (
      <View style={styles.cartItem}>
        {/* Replace the cart item image */}
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.productImage}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.productImage, styles.placeholderContainer]}>
            <Ionicons name="image-outline" size={40} color="#cccccc" />
          </View>
        )}
        
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.weight && (
            <Text style={styles.itemWeight}>
              {item.weight.value} {item.weight.unit}
            </Text>
          )}
          <Text style={styles.itemPrice}>{itemPrice}€</Text>
        </View>
        
        <View style={styles.quantityControls}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          
          {/* Replace the Text component with TextInput */}
          <TextInput
            style={styles.quantityInput}
            value={item.quantity.toString()}
            keyboardType="numeric"
            onChangeText={(text) => {
              const value = parseInt(text);
              // Only update if it's a valid number and at least 1
              if (!isNaN(value) && value >= 1) {
                updateQuantity(item.id, value);
              } else if (text === '') {
                // Allow empty field during editing
                // But don't update quantity yet
              }
            }}
            selectTextOnFocus={true}
          />
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => removeItem(item.id)}
        >
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <Header
          onCatalogPress={() =>
            navigation.navigate('CategoryPage', {
              categoryId: 'someId',
              categoryPath: ['somePath'],
              categoryName: 'Catalog',
              locale: 'en', // or whichever locale you need
            })
          }
        />
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t('cart.title')}</Text>
          {/* Debug text to show item count */}
          <Text style={{fontSize: 12, color: 'gray'}}>Items: {items.length}</Text>
          
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={() => {
              console.log('Clear button pressed');
              setClearCartDialogVisible(true);
            }}
          >
            <Text style={styles.clearButtonText}>{t('cart.clearCart')}</Text>
          </TouchableOpacity>
        </View>
        
        {items.length > 0 ? (
          <>
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.cartList}
            />
            
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('cart.totalItems')}:</Text>
                <Text style={styles.summaryValue}>{getTotalItems()}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('cart.totalPrice')}:</Text>
                <Text style={styles.summaryValue}>{getTotalPrice()}€</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.checkoutButton}
                onPress={handleCheckout}
              >
                <Text style={styles.checkoutButtonText}>{t('cart.checkout')}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyCartContainer}>
            <Ionicons name="cart-outline" size={80} color="#ccc" />
            <Text style={styles.emptyCartText}>{t('cart.emptyCart')}</Text>
            <TouchableOpacity 
              style={styles.continueShopping}
              onPress={() => navigation.navigate('Home', { locale: currentLanguage })}
            >
              <Text style={styles.continueShoppingText}>{t('cart.continueShopping')}</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Dialogs */}
        <Portal>
          {/* Clear Cart Dialog */}
          <Dialog
            visible={clearCartDialogVisible}
            onDismiss={() => setClearCartDialogVisible(false)}
            style={{ 
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              borderColor: '#E0E0E0',
              borderWidth: 1,
              elevation: 8,
            }}
          >
            <Dialog.Title style={{ 
              color: '#212121', 
              fontSize: 18, 
              fontWeight: '600' 
            }}>
              {t('cart.clearCartTitle') || 'Clear Cart'}
            </Dialog.Title>
            <Dialog.Content>
              <Text style={{ 
                color: '#424242', 
                fontSize: 15 
              }}>
                {t('cart.clearCartMessage') || 'Are you sure you want to remove all items from your cart?'}
              </Text>
            </Dialog.Content>
            <Dialog.Actions style={{ 
              justifyContent: 'flex-end',  // Changed from 'space-between' to 'flex-end'
              flexDirection: 'row',
              gap: 16,                     // Added 16px gap between buttons
              paddingHorizontal: 16,
              paddingBottom: 16 
            }}>
              <Button 
                mode="outlined"
                style={{
                  borderColor: '#E0E0E0',
                  borderRadius: 8,
                  borderWidth: 1,
                  paddingVertical: 5,
                  paddingHorizontal: 16,
                }}
                labelStyle={{ color: '#757575', fontSize: 16 }}
                onPress={() => setClearCartDialogVisible(false)}
              >
                {t('common.cancel') || 'Cancel'}
              </Button>
              <Button 
                mode="contained"
                style={{
                  backgroundColor: '#E53935',
                  borderRadius: 8,
                  paddingVertical: 5,
                  paddingHorizontal: 16,
                }}
                labelStyle={{ 
                  color: '#FFFFFF', 
                  fontSize: 16 
                }}
                onPress={() => {
                  console.log('Confirm pressed, calling clearCart');
                  clearCart();
                  setClearCartDialogVisible(false);
                }}
              >
                {t('common.confirm') || 'Confirm'}
              </Button>
            </Dialog.Actions>
          </Dialog>
          
          {/* Checkout Dialog */}
          <Dialog
            visible={checkoutDialogVisible}
            onDismiss={() => setCheckoutDialogVisible(false)}
            style={{ 
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              borderColor: '#E0E0E0',
              borderWidth: 1,
              elevation: 8,
            }}
          >
            <Dialog.Title style={{ color: '#212121', fontSize: 18, fontWeight: '600' }}>
              {t('cart.checkoutTitle') || 'Checkout'}
            </Dialog.Title>
            <Dialog.Content>
              <Text style={{ color: '#424242', fontSize: 15 }}>
                {t('cart.checkoutMessage') || 'Proceed to checkout?'}
              </Text>
            </Dialog.Content>
            <Dialog.Actions style={{ 
              justifyContent: 'flex-end',  // Changed from 'space-between' to 'flex-end'
              flexDirection: 'row',
              gap: 16,                     // Added 16px gap between buttons
              paddingHorizontal: 16, 
              paddingBottom: 16 
            }}>
              <Button 
                mode="outlined"
                style={{
                  borderColor: '#E0E0E0',
                  borderRadius: 8,
                  borderWidth: 1,
                  paddingVertical: 5,
                  paddingHorizontal: 16,
                }}
                labelStyle={{ color: '#757575', fontSize: 16 }}
                onPress={() => setCheckoutDialogVisible(false)}
              >
                {t('common.cancel') || 'Cancel'}
              </Button>
              <Button 
                mode="contained"
                style={{
                  backgroundColor: '#E53935',
                  borderRadius: 8,
                  paddingVertical: 5,
                  paddingHorizontal: 16,
                }}
                labelStyle={{ color: '#FFFFFF', fontSize: 16 }}
                onPress={handleCheckout}
              >
                {t('common.confirm') || 'Confirm'}
              </Button>
            </Dialog.Actions>
          </Dialog>
          
          {/* Empty Cart Dialog */}
          <Dialog
            visible={emptyCartDialogVisible}
            onDismiss={() => setEmptyCartDialogVisible(false)}
            style={{ 
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              borderColor: '#E0E0E0',
              borderWidth: 1,
              elevation: 8,
            }}
          >
            <Dialog.Title style={{ color: '#212121', fontSize: 18, fontWeight: '600' }}>
              {t('cart.emptyCartTitle') || 'Empty Cart'}
            </Dialog.Title>
            <Dialog.Content>
              <Text style={{ color: '#424242', fontSize: 15 }}>
                {t('cart.emptyCartMessage') || 'Your cart is empty. Add items to cart?'}
              </Text>
            </Dialog.Content>
            <Dialog.Actions style={{ 
              justifyContent: 'flex-end',  // Changed from 'space-between' to 'flex-end'
              flexDirection: 'row',
              gap: 16,                     // Added 16px gap between buttons
              paddingHorizontal: 16, 
              paddingBottom: 16 
            }}>
              <Button 
                mode="outlined"
                style={{
                  borderColor: '#E0E0E0',
                  borderRadius: 8,
                  borderWidth: 1,
                  paddingVertical: 5,
                  paddingHorizontal: 16,
                }}
                labelStyle={{ color: '#757575', fontSize: 16 }}
                onPress={() => setEmptyCartDialogVisible(false)}
              >
                {t('common.cancel') || 'Cancel'}
              </Button>
              <Button 
                mode="contained"
                style={{
                  backgroundColor: '#E53935',
                  borderRadius: 8,
                  paddingVertical: 5,
                  paddingHorizontal: 16,
                }}
                labelStyle={{ color: '#FFFFFF', fontSize: 16 }}
                onPress={() => {
                  setEmptyCartDialogVisible(false);
                  navigation.navigate('Home', { locale: currentLanguage });
                }}
              >
                {t('common.goToCatalog') || 'Go to Catalog'}
              </Button>
            </Dialog.Actions>
          </Dialog>
          
          {/* Success Dialog */}
          <Dialog
            visible={successDialogVisible}
            onDismiss={handleSuccessDialogDismiss}
            style={{ 
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              borderColor: '#E0E0E0',
              borderWidth: 1,
              elevation: 8,
            }}
          >
            <Dialog.Title style={{ color: '#212121', fontSize: 18, fontWeight: '600' }}>
              {t('cart.orderSuccessTitle') || 'Order Successful'}
            </Dialog.Title>
            <Dialog.Content>
              <Text style={{ color: '#424242', fontSize: 15 }}>
                {t('cart.orderSuccessMessage') || 'Your order has been placed successfully!'}
              </Text>
            </Dialog.Content>
            <Dialog.Actions style={{ justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 16 }}>
              <Button 
                mode="contained"
                style={{
                  backgroundColor: '#E53935',
                  borderRadius: 8,
                  paddingVertical: 5,
                  paddingHorizontal: 24,
                  minWidth: 120,
                }}
                labelStyle={{ color: '#FFFFFF', fontSize: 16 }}
                onPress={handleSuccessDialogDismiss}
              >
                {t('common.ok') || 'OK'}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  cartList: {
    padding: 15,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 4,
    marginRight: 15,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemWeight: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  quantityButton: {
    width: 30,
    height: 30,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityInput: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 40,
    padding: 0, // Remove default padding for cleaner look
    marginHorizontal: 10,
    width: 50,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  removeButton: {
    padding: 5,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    marginBottom: 20,
  },
  continueShopping: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;