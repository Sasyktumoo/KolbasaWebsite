import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getItemTotalPrice } from '../../utils/priceUtils';

export interface CartItem {
  id: string;
  name: string;
  price: number; // Keep for backward compatibility
  quantity: number;
  imageUrl?: string;
  weight?: {
    value: number;
    unit: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => string; // Changed return type to string
  getItemTotalPrice: (item: CartItem) => string; // Added helper function
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Load cart from AsyncStorage on initial render
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem('cart');
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Failed to load cart from storage', error);
      }
    };
    
    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem('cart', JSON.stringify(items));
      } catch (error) {
        console.error('Failed to save cart to storage', error);
      }
    };
    
    saveCart();
  }, [items]);

  // Add item to cart
  const addItem = (item: CartItem) => {
    setItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += item.quantity;
        return updatedItems;
      } else {
        // Item doesn't exist, add new item
        return [...prevItems, item];
      }
    });
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    console.log('clearCart function called');
    // Clear state immediately
    setItems([]);
    
    // Then handle the async storage operation
    AsyncStorage.removeItem('cart')
      .then(() => {
        console.log('Successfully cleared AsyncStorage');
      })
      .catch(error => {
        console.error('Error clearing AsyncStorage', error);
      });
  };

  // Get total number of items in cart
  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  // Get total price of items in cart - updated to use weight-based pricing
  const getTotalPrice = () => {
    const total = items.reduce((total, item) => {
      const itemPrice = Number(getItemTotalPrice(item));
      return total + itemPrice;
    }, 0);
    
    return total.toFixed(2);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      getItemTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};