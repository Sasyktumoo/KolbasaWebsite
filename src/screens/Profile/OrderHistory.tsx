import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/languages/useLanguage';
import { useUser } from '../../context/UserContext';
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';

// Define order history item type
interface OrderHistoryItem {
  id: string;
  userId: string;
  order: {
    orderId: string;
    createdAt: {
      seconds: number;
      nanoseconds: number;
    };
    totalAmount: number;
    status?: string;
    itemCount: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  };
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

const OrderHistory = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { t, currentLanguage } = useLanguage();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const db = getFirestore();

  // Load order history
  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const orderQuery = query(
          collection(db, 'userOrderHistory'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc') // Most recent first
        );

        const snapshot = await getDocs(orderQuery);
        const orderHistory = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as OrderHistoryItem[];

        setOrders(orderHistory);
      } catch (error) {
        console.error('Error fetching order history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [user]);

  // Format date from Firestore timestamp
  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    return format(date, 'dd.MM.yyyy HH:mm');
  };

  // Get status color based on order status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#4CD964'; // Green
      case 'processing':
        return '#007AFF'; // Blue
      case 'pending':
        return '#FF9500'; // Orange
      case 'cancelled':
        return '#FF3B30'; // Red
      default:
        return '#8E8E93'; // Gray
    }
  };

  // Translate order status
  const getStatusText = (status: string) => {
    if (!status) return ''; // Return empty string if status is undefined
    
    switch (status.toLowerCase()) {
      case 'completed':
        return t('orderHistory.statusCompleted');
      case 'processing':
        return t('orderHistory.statusProcessing');
      case 'pending':
        return t('orderHistory.statusPending');
      case 'cancelled':
        return t('orderHistory.statusCancelled');
      default:
        return status;
    }
  };

  // Render each order item
  const renderOrderItem = ({ item }: { item: OrderHistoryItem }) => {
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>
            {t('orderHistory.orderNumber')}: {item.order.orderId}
          </Text>
          <Text style={styles.orderDate}>{formatDate(item.order.createdAt)}</Text>
        </View>

        {/* Only render status if it exists */}
        {item.order.status && (
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>{t('orderHistory.status')}:</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.order.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.order.status)}</Text>
            </View>
          </View>
        )}

        <View style={styles.orderInfoRow}>
          <Text style={styles.orderInfoLabel}>{t('orderHistory.items')}:</Text>
          <Text style={styles.orderInfoValue}>{item.order.itemCount}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.orderItemsList}>
          {item.order.items.map((orderItem, index) => (
            <View key={index} style={styles.orderItemRow}>
              <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
                {orderItem.name}
              </Text>
              <Text style={styles.itemQuantity}>x{orderItem.quantity}</Text>
              <Text style={styles.itemPrice}>{orderItem.price * orderItem.quantity}€</Text>
            </View>
          ))}
        </View>

        <View style={styles.separator} />

        <View style={styles.orderTotal}>
          <Text style={styles.orderTotalLabel}>{t('orderHistory.total')}:</Text>
          <Text style={styles.orderTotalValue}>{item.order.totalAmount}€</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('orderHistory.title')}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF3B30" />
            <Text style={styles.loadingText}>{t('orderHistory.loading')}</Text>
          </View>
        ) : orders.length > 0 ? (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.ordersList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={60} color="#cccccc" />
            <Text style={styles.emptyText}>{t('orderHistory.noOrders')}</Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigation.navigate('Home', { locale: currentLanguage })}
            >
              <Text style={styles.shopButtonText}>{t('orderHistory.startShopping')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    flex: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  ordersList: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderNumber: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  orderInfoLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  orderInfoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 10,
  },
  orderItemsList: {
    marginVertical: 5,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    marginRight: 10,
  },
  itemQuantity: {
    fontSize: 13,
    color: '#666',
    width: 40,
    textAlign: 'right',
    marginRight: 10,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    width: 60,
    textAlign: 'right',
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  orderTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  orderTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default OrderHistory;