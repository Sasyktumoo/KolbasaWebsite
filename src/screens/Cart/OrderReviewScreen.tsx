import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { useLanguage } from '../../context/languages/useLanguage';
import { useCart } from '../../context/cart/CartContext';
import { useUser } from '../../context/UserContext';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAlert } from '../../context/AlertContext';
import emailService from '../../services/EmailService'; // Import the email service

const OrderReviewScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'OrderReview'>>();
  const { t, currentLanguage } = useLanguage();
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useUser();
  const { alert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // Get customer info from route params
  const { customerInfo } = route.params;
  const db = getFirestore();
  
  // Initialize email service on web platforms
  useEffect(() => {
    if (Platform.OS === 'web') {
      emailService.initialize().catch(err => 
        console.error("Failed to initialize email service:", err)
      );
    }
  }, []);

  // Handle order history management - keep only last 10 orders
  const manageOrderHistory = async (userId: string, orderData: any) => {
    try {
      if (!userId) return; // Skip if no user ID (guest checkout)
      
      // Create a summary of the order for history
      const orderSummary = {
        orderId: `order-${Date.now()}`, // Generate a timestamp-based ID
        createdAt: orderData.createdAt,
        totalAmount: orderData.totalAmount,
        itemCount: orderData.items.length,
        items: orderData.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      // Save to user's order history collection
      await addDoc(collection(db, 'userOrderHistory'), {
        userId,
        order: orderSummary,
        createdAt: serverTimestamp()
      });
      
      // Get all order history for this user, sorted by creation date
      const historyQuery = query(
        collection(db, 'userOrderHistory'),
        where('userId', '==', userId),
        orderBy('createdAt', 'asc') // Oldest first
      );
      
      const snapshot = await getDocs(historyQuery);
      const orderHistory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // If we have more than 10 orders, delete the oldest ones
      if (orderHistory.length > 10) {
        const ordersToDelete = orderHistory.slice(0, orderHistory.length - 10);
        
        // Delete oldest orders
        for (const oldOrder of ordersToDelete) {
          await deleteDoc(doc(db, 'userOrderHistory', oldOrder.id));
          console.log(`Deleted oldest order from history: ${oldOrder.id}`);
        }
      }
    } catch (error) {
      console.error('Error managing order history:', error);
      // Don't throw error here, as we don't want it to affect the main order flow
    }
  };
  
  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      alert(
        t('orderReview.emptyCartTitle'),
        t('orderReview.emptyCartMessage')
      );
      return;
    }
    
    setLoading(true);
    
    try {
      // Create order object
      const order = {
        customer: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          userId: user?.uid || null,
        },
        address: {
          fullName: customerInfo.address.fullName,
          streetAddress: customerInfo.address.streetAddress,
          apartment: customerInfo.address.apartment || '',
          city: customerInfo.address.city,
          state: customerInfo.address.state,
          postalCode: customerInfo.address.postalCode,
          country: customerInfo.address.country,
          phoneNumber: customerInfo.address.phoneNumber,
        },
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
          weight: item.weight
        })),
        message: customerInfo.message || '',
        totalAmount: getTotalPrice(),
        createdAt: serverTimestamp(),
      };
      
      // Manage order history for the user
      if (user?.uid) {
        await manageOrderHistory(user.uid, order);
      }
      
      // Attempt to send confirmation email on web platform
      if (Platform.OS === 'web') {
        setSendingEmail(true);
        try {
          await emailService.sendOrderConfirmation({
            customer: order.customer,
            items: order.items,
            totalAmount: Number(order.totalAmount),
            address: order.address,
            language: currentLanguage // Pass the current language
          });
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
          // We don't want to show this error to the user as the order was still placed successfully
        } finally {
          setSendingEmail(false);
        }
      }
      
      // Clear cart
      clearCart();
      
      alert(
        t('orderReview.orderSuccessTitle'),
        t('orderReview.orderSuccessMessage'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.navigate('Home', { locale: currentLanguage })
          }
        ]
      );
      
    } catch (error) {
      console.error('Error placing order:', error);
      alert(
        t('orderReview.orderErrorTitle'),
        t('orderReview.orderErrorMessage')
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate order summary
  const subtotal = getTotalPrice();
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;
  
  return (
    <SafeAreaView style={styles.container}>
      <Header onCatalogPress={() => navigation.navigate('Home', { locale: currentLanguage })} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>{t('orderReview.title')}</Text>
          </View>
          
          {/* Order Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('orderReview.orderItems')}</Text>
            
            {items.map((item, index) => {
              const itemTotalPrice = item.price * item.quantity;
              
              return (
                <View key={`${item.id}-${index}`} style={styles.orderItem}>
                  {item.imageUrl ? (
                    <Image 
                      source={{ uri: item.imageUrl }} 
                      style={styles.itemImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={[styles.itemImage, styles.placeholderContainer]}>
                      <Ionicons name="image-outline" size={30} color="#cccccc" />
                    </View>
                  )}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>
                      {item.weight?.value} {item.weight?.unit}
                    </Text>
                    <View style={styles.itemPriceRow}>
                      <Text style={styles.itemQuantity}>{t('orderReview.quantity')}: {item.quantity}</Text>
                      <Text style={styles.itemPrice}>{itemTotalPrice}€</Text>
                    </View>
                  </View>
                </View>
              );
            })}
            
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('orderReview.subtotal')}:</Text>
                <Text style={styles.summaryValue}>{getTotalPrice()}€</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('orderReview.shipping')}:</Text>
                <Text style={styles.summaryValue}>
                  {shipping === 0 ? t('orderReview.freeShipping') : `${shipping}€`}
                </Text>
              </View>
              
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>{t('orderReview.total')}:</Text>
                <Text style={styles.totalValue}>{getTotalPrice()}€</Text>
              </View>
            </View>
          </View>
          
          {/* Customer Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('orderReview.customerInfo')}</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('checkout.name')}:</Text>
              <Text style={styles.infoValue}>{customerInfo.name}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('checkout.email')}:</Text>
              <Text style={styles.infoValue}>{customerInfo.email}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('checkout.phone')}:</Text>
              <Text style={styles.infoValue}>{customerInfo.phone}</Text>
            </View>
          </View>
          
          {/* Delivery Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('orderReview.deliveryAddress')}</Text>
            
            <View style={styles.addressContainer}>
              <Text style={styles.addressName}>{customerInfo.address.fullName}</Text>
              <Text style={styles.addressText}>{customerInfo.address.streetAddress}</Text>
              {customerInfo.address.apartment ? (
                <Text style={styles.addressText}>{customerInfo.address.apartment}</Text>
              ) : null}
              <Text style={styles.addressText}>
                {customerInfo.address.city}, {customerInfo.address.state} {customerInfo.address.postalCode}
              </Text>
              <Text style={styles.addressText}>{customerInfo.address.country}</Text>
              <Text style={styles.addressPhone}>{customerInfo.address.phoneNumber}</Text>
            </View>
          </View>
          
          {/* Additional Notes */}
          {customerInfo.message ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('orderReview.additionalNotes')}</Text>
              <Text style={styles.messageText}>{customerInfo.message}</Text>
            </View>
          ) : null}
          
          {/* Place Order Button */}
          <TouchableOpacity 
            style={[styles.placeOrderButton, (loading || sendingEmail) && styles.disabledButton]}
            onPress={handlePlaceOrder}
            disabled={loading || sendingEmail}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : sendingEmail ? (
              <View style={styles.buttonContentRow}>
                <ActivityIndicator color="white" size="small" style={styles.buttonLoader} />
                <Text style={styles.placeOrderButtonText}>{t('orderReview.sendingConfirmation')}</Text>
              </View>
            ) : (
              <Text style={styles.placeOrderButtonText}>{t('orderReview.placeOrder')}</Text>
            )}
          </TouchableOpacity>
          
          <Text style={styles.disclaimer}>
            {t('orderReview.disclaimer')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImage: {
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
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  itemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 13,
    color: '#555',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  summaryContainer: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#555',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#555',
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  addressContainer: {
    marginBottom: 10,
  },
  addressName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addressText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  messageText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  placeOrderButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    opacity: 0.7,
  },
  placeOrderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLoader: {
    marginRight: 10,
  },
});

export default OrderReviewScreen;