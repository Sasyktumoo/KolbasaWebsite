import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';

// Product type definition for navigation
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  minOrder: number;
  image: any;
}

// Firebase product type definition
export interface FirebaseProduct {
  id?: string;
  name: string;
  packaging: string;
  netWeight: {
    value: number;
    unit: string;
    approximate: boolean;
  };
  storageTemperature: {
    min: number;
    max: number;
    unit: string;
  };
  processingType: string[];
  meatType: string;
  meatContent: {
    value: number;
    unit: string;
    description: string;
  };
  shelfLife: {
    value: number;
    unit: string;
  } | null;
  imageUrls?: string[];
  translations: {
    en: {
      name: string;
      packaging: string;
      meatType: string;
      meatContentDescription: string;
      processingType: string[];
    };
  };
}

export type ProductDetailScreenProps = {
  route: RouteProp<RootStackParamList, 'ProductDetailPage'>;
};

// Define section types for FlatList
export const SECTION_TYPES = {
  BREADCRUMB: 'breadcrumb',
  TITLE: 'title',
  TABS: 'tabs',
  MAIN: 'main',
  OTHER_PRODUCTS: 'otherProducts',
  DESCRIPTION: 'description',
  CHARACTERISTICS: 'characteristics',
  REVIEWS: 'reviews'
} as const;

export type SectionKey = typeof SECTION_TYPES[keyof typeof SECTION_TYPES];

// Message type definitions
export type CallbackRequestType = {
  type: 'callback';
  product: {
    id: string;
    name: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  comments: string;
  language: string;
};

export type SupplierMessageType = {
  type: 'message';
  sender: {
    name: string;
    email: string;
  };
  supplier: {
    email: string;
    phoneNumber: string;
  };
  product: {
    id: string;
    name: string;
  };
  message: string;
  language: string;
};

// Characteristic type for display
export interface Characteristic {
  name: string;
  value: string;
}