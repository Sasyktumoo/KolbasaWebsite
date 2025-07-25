import { CartItem } from '../context/cart/CartContext';
import { PRICE_PER_KG } from './constants';

// Helper function to calculate weight in kg
export const getWeightInKg = (item: any) => {
  if (!item.weight) return 1; // Default weight if missing
  
  const { value, unit } = item.weight;
  
  // Convert to kg based on unit
  if (unit.toLowerCase() === 'kg' || unit.toLowerCase() === 'кг') {
    return value;
  } else if (unit.toLowerCase() === 'g' || unit.toLowerCase() === 'г') {
    return value / 1000;
  } else {
    return value; // If unknown unit, just use the value
  }
};

// Calculate price for a single item based on weight and quantity
export const getItemTotalPrice = (item: any) => {
  const weightInKg = getWeightInKg(item);
  const totalWeight = weightInKg * item.quantity;
  return (PRICE_PER_KG * totalWeight).toFixed(2);
};

export const getItemPrice = (item: any) => {
  const weightInKg = getWeightInKg(item);
  return (PRICE_PER_KG * weightInKg).toFixed(2);
};