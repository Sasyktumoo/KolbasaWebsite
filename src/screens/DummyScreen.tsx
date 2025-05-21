import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator, Platform } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FIREBASE_DB } from '../../FirebaseConfig';
import TextPagesLayout from '../components/TestPagesLayout';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { LanguageContext } from '../context/languages/LanguageContext';

// Create a temporary useLanguage hook directly in this file
const useLanguage = () => {
  const { currentLanguage, changeLanguage } = useContext(LanguageContext);
  const { t } = useTranslation();
  return {
    translate: t,
    currentLanguage,
    changeLanguage
  };
};

const DummyScreen = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [progress, setProgress] = useState('');
  const { translate } = useLanguage();
  
  // Array of image paths for web environment
  const imagePaths = [
    '/KolbasaWebsite/src/assets/images/1000049582.jpg',
    '/KolbasaWebsite/src/assets/images/1000049583.jpg',
    '/KolbasaWebsite/src/assets/images/1000049584.jpg'
  ];
  
  // Function to upload an image to Firebase Storage and get its URL
  const uploadImageAsync = async (path, index) => {
    setProgress(`Uploading image ${index + 1}...`);
    
    try {
      // Create unique filename
      const filename = `berlinki_kids_${index + 1}_${Date.now()}.jpg`;
      
      // Get reference to storage location
      const storage = getStorage();
      const storageRef = ref(storage, `products/${filename}`);
      
      // For web environment, fetch the file and create a blob
      const response = await fetch(path);
      const blob = await response.blob();
      
      // Upload the blob
      const snapshot = await uploadBytes(storageRef, blob);
      
      // Get the download URL
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error(`Error uploading image ${index + 1}:`, error);
      throw error;
    }
  };
  
  const addTestProduct = async () => {
    setIsAdding(true);
    setProgress('Starting upload process...');
    
    try {
      // Upload all images and get their URLs
      const imageUrlPromises = imagePaths.map((path, index) => 
        uploadImageAsync(path, index)
      );
      
      setProgress('Uploading images to Firebase Storage...');
      const imageUrls = await Promise.all(imageUrlPromises);
      
      setProgress('Images uploaded successfully. Adding product to database...');
      
      const productData = {
        "name": "Берлинки Дети",
        "packaging": "карты",
        "netWeight": {
          "value": 130,
          "unit": "г",
          "approximate": false
        },
        "storageTemperature": {
          "min": 0,
          "max": 6,
          "unit": "°C"
        },
        "processingType": ["пропаривание", "копчение"],
        "meatType": "курица",
        "meatContent": {
          "value": 90,
          "unit": "%",
          "description": "90% мясистость"
        },
        "shelfLife": null,
        "imageUrls": imageUrls, // Add the uploaded image URLs
        "translations": {
          "uk": {
            "name": "Берлінки Діти",
            "packaging": "лоток",
            "meatType": "курятина",
            "meatContentDescription": "90% вміст м'яса",
            "processingType": ["на пару", "копчення"]
          },
          "ru": {
            "name": "Берлинки Дети",
            "packaging": "карты",
            "meatType": "курица",
            "meatContentDescription": "90% мясистость",
            "processingType": ["пропаривание", "копчение"]
          },
          "en": {
            "name": "Berlinki Kids",
            "packaging": "tray",
            "meatType": "chicken",
            "meatContentDescription": "90% meat content",
            "processingType": ["steamed", "smoked"]
          },
          "es": {
            "name": "Berlinki Niños",
            "packaging": "bandeja",
            "meatType": "pollo",
            "meatContentDescription": "90% de contenido de carne",
            "processingType": ["al vapor", "ahumado"]
          }
        }
      };      

      // Add the document to the "foodItems" collection
      const docRef = await addDoc(collection(FIREBASE_DB, 'foodItems'), productData);
      Alert.alert("Success", `Product added with ID: ${docRef.id}\nImages uploaded: ${imageUrls.length}`);
    } catch (error) {
      console.error("Error adding product:", error);
      Alert.alert("Error", `Failed to add test product: ${error.message}`);
    } finally {
      setIsAdding(false);
      setProgress('');
    }
  };

  return (
    <TextPagesLayout>
      <View style={styles.content}>
        <Text style={styles.title}>Add Test Product with Images</Text>
        <Text style={styles.description}>
          Press the button below to upload product images to Firebase Storage and add the "Берлинки Дети" product to the foodItems collection with image URLs.
        </Text>
        
        {/* Image previews */}
        <View style={styles.imagePreviewContainer}>
          {imagePaths.map((path, index) => (
            <View key={index} style={styles.imagePreview}>
              <Text style={styles.imageText}>Image {index + 1}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity 
          style={[styles.button, isAdding && styles.buttonDisabled]} 
          onPress={addTestProduct}
          disabled={isAdding}
        >
          <Text style={styles.buttonText}>
            {isAdding ? "Processing..." : "Add Product with Images"}
          </Text>
        </TouchableOpacity>
        
        {isAdding && (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="small" color="#FF3B30" />
            <Text style={styles.progressText}>{progress}</Text>
          </View>
        )}
        
        <Text style={styles.productTitle}>Product Details:</Text>
        <View style={styles.productDetails}>
          <Text style={styles.detailText}>Name: Берлинки Дети / Berlinki Kids</Text>
          <Text style={styles.detailText}>Type: Chicken sausages</Text>
          <Text style={styles.detailText}>Weight: 130g</Text>
          <Text style={styles.detailText}>Meat content: 90%</Text>
          <Text style={styles.detailText}>Processing: Steamed, Smoked</Text>
          <Text style={styles.detailText}>Images: 3 images will be uploaded</Text>
        </View>
      </View>
    </TextPagesLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 25,
    maxWidth: 800,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 20,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  imageText: {
    color: '#555',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ffaba7',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressText: {
    marginLeft: 10,
    color: '#555',
    fontSize: 14,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  productDetails: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  detailText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    color: '#333',
  }
});

export default DummyScreen;