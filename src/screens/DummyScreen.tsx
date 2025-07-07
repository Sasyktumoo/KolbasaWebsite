import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, ScrollView } from 'react-native';
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

// HTML input component for React Native Web
const FileInput = ({ onChange, multiple = false, accept = "image/*", id }) => {
  const inputRef = useRef(null);
  
  if (Platform.OS !== 'web') {
    return null;
  }
  
  return (
    <View>
      <input
        id={id}
        type="file"
        ref={inputRef}
        onChange={onChange}
        multiple={multiple}
        accept={accept}
        style={{ marginBottom: 15 }}
      />
    </View>
  );
};

// Product card component
const ProductCard = ({ 
  product, 
  index, 
  handleFileChange, 
  previewUrls, 
  isUploading 
}) => {
  return (
    <View style={styles.productCard}>
      <Text style={styles.productCardTitle}>{product?.name || "Unnamed Product"}</Text>
      <View style={styles.productCardDetails}>
        <Text style={styles.detailText}>Type: {product?.meatType || "N/A"}</Text>
        <Text style={styles.detailText}>
          Weight: {product?.netWeight?.value || "N/A"}{product?.netWeight?.unit || ""}
        </Text>
        <Text style={styles.detailText}>
          Meat content: {product?.meatContent ? `${product.meatContent.value}${product.meatContent.unit || ''}` : "Not specified"}
        </Text>
      </View>

      <Text style={styles.selectImagesText}>Select images for this product:</Text>
      <FileInput 
        id={`file-input-${index}`}
        onChange={(e) => handleFileChange(e, index)}
        multiple={true}
        accept="image/jpeg,image/png"
      />
      
      {/* Image previews */}
      {previewUrls[index] && previewUrls[index].length > 0 && (
        <View>
          <Text style={styles.previewsTitle}>Selected Images:</Text>
          <View style={styles.imagePreviewContainer}>
            {previewUrls[index].map((url, imgIndex) => (
              <View key={imgIndex} style={styles.imagePreview}>
                <img 
                  src={url} 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  alt={`Preview ${imgIndex + 1}`}
                />
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const DummyScreen = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [progress, setProgress] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const { translate } = useLanguage();
  
const productsData = [

  {
    "name": "Классические берлинцы",
    "packaging": "вакуум",
    "netWeight": { "value": 500, "unit": "г", "approximate": false },
    "storageTemperature": { "min": 2, "max": 6, "unit": "°C" },
    "processingType": ["пропаривание", "копчение"],
    "meatType": "свинина",
    "meatContent": {
      "value": 71,
      "unit": "%",
      "description": "71% мясистость"
    },
    "shelfLife": { "value": 30, "unit": "дней" },
        "translations": {
      "uk": {
        "name": "Класичні берлінці",
        "packaging": "вакуум",
        "meatType": "свинина",
        "meatContentDescription": "71% вміст м'яса",
        "processingType": ["на пару", "копчення"]
      },
      "ru": {
        "name": "Классические берлинцы",
        "packaging": "вакуум",
        "meatType": "свинина",
        "meatContentDescription": "71% мясистость",
        "processingType": ["пропаривание", "копчение"]
      },
      "en": {
        "name": "Berlinki Classic",
        "packaging": "vacuum pack",
        "meatType": "pork",
        "meatContentDescription": "71% meat content",
        "processingType": ["steamed", "smoked"]
      },
      "es": {
        "name": "Berlinki Clásicos",
        "packaging": "vacío",
        "meatType": "cerdo",
        "meatContentDescription": "71% de contenido de carne",
        "processingType": ["al vapor", "ahumado"]
      }
    }
  },
  {
    "name": "Охотничья колбаса",
    "packaging": "карты",
    "netWeight": { "value": 270, "unit": "г", "approximate": false },
    "storageTemperature": { "min": 2, "max": 6, "unit": "°C" },
    "processingType": ["пропаривание", "сушка", "копчение"],
    "meatType": "свинина",
    "meatContent": {
      "value": 136,
      "unit": "%",
      "description": "100 г продукта изготовлено из 136 г свинины"
    },
    "shelfLife": { "value": 30, "unit": "дней" },
    "translations": {
      "uk": {
        "name": "Мисливська ковбаса",
        "packaging": "лоток",
        "meatType": "свинина",
        "meatContentDescription": "100 г продукту виготовлено зі 136 г свинини",
        "processingType": ["на пару", "сушіння", "копчення"]
      },
      "ru": {
        "name": "Охотничья колбаса",
        "packaging": "карты",
        "meatType": "свинина",
        "meatContentDescription": "100 г продукта изготовлено из 136 г свинины",
        "processingType": ["пропаривание", "сушка", "копчение"]
      },
      "en": {
        "name": "Hunter Sausage",
        "packaging": "tray",
        "meatType": "pork",
        "meatContentDescription": "100 g product made from 136 g pork",
        "processingType": ["steamed", "dried", "smoked"]
      },
      "es": {
        "name": "Salchicha de Cazador",
        "packaging": "bandeja",
        "meatType": "cerdo",
        "meatContentDescription": "100 g de producto elaborado a partir de 136 g de cerdo",
        "processingType": ["al vapor", "secado", "ahumado"]
      }
    }
  },

  /* 2. Колбаса из можжевельника ------------------------------------- */
  {
    "name": "колбаса из можжевельника",
    "packaging": "карты",
    "netWeight": { "value": 200, "unit": "г", "approximate": true },
    "storageTemperature": { "min": 2, "max": 6, "unit": "°C" },
    "processingType": ["пропаривание", "сушка", "копчение"],
    "meatType": "свинина",
    "meatContent": {
      "value": 122,
      "unit": "%",
      "description": "100 г продукта изготовлено из 122 г свинины"
    },
    "shelfLife": { "value": 30, "unit": "дней" },
    "translations": {
      "uk": {
        "name": "Ковбаса з ялівцю",
        "packaging": "лоток",
        "meatType": "свинина",
        "meatContentDescription": "100 г продукту виготовлено зі 122 г свинини",
        "processingType": ["на пару", "сушіння", "копчення"]
      },
      "ru": {
        "name": "колбаса из можжевельника",
        "packaging": "карты",
        "meatType": "свинина",
        "meatContentDescription": "100 г продукта изготовлено из 122 г свинины",
        "processingType": ["пропаривание", "сушка", "копчение"]
      },
      "en": {
        "name": "Juniper Sausage",
        "packaging": "tray",
        "meatType": "pork",
        "meatContentDescription": "100 g product made from 122 g pork",
        "processingType": ["steamed", "dried", "smoked"]
      },
      "es": {
        "name": "Salchicha de Enebro",
        "packaging": "bandeja",
        "meatType": "cerdo",
        "meatContentDescription": "100 g de producto elaborado a partir de 122 g de cerdo",
        "processingType": ["al vapor", "secado", "ahumado"]
      }
    }
  }


]

  
  // Initialize state for multiple products
  useState(() => {
    setSelectedFiles(new Array(productsData.length).fill([]));
    setPreviewUrls(new Array(productsData.length).fill([]));
  }, []);
  
  // Handle file selection for a specific product
  const handleFileChange = (event, productIndex) => {
    const files = Array.from(event.target.files);
    
    // Update selected files for this product
    const newSelectedFiles = [...selectedFiles];
    newSelectedFiles[productIndex] = files;
    setSelectedFiles(newSelectedFiles);
    
    // Create preview URLs for the selected files
    const previews = files.map(file => URL.createObjectURL(file));
    const newPreviewUrls = [...previewUrls];
    newPreviewUrls[productIndex] = previews;
    setPreviewUrls(newPreviewUrls);
  };
  
  // Function to upload an image to Firebase Storage and get its URL
  const uploadImageAsync = async (file, productIndex, imageIndex) => {
    setProgress(`Uploading image ${imageIndex + 1} for product ${productIndex + 1}...`);
    
    try {
      // Get English name from translations
      const englishName = productsData[productIndex]?.translations?.en?.name || 
                          productsData[productIndex]?.name || 
                          `product_${productIndex + 1}`;
      
      // Format the name: replace spaces with underscores and remove special characters
      const formattedName = englishName
        .replace(/\s+/g, '_')       // Replace spaces with underscores
        .replace(/[^\w_-]/g, '')    // Remove any special characters except underscores and hyphens
        .toLowerCase();             // Convert to lowercase for consistency
      
      // Create filename with product name and number for multiple images
      const imageNumber = imageIndex + 1;
      const filename = `${formattedName}_${imageNumber}.jpg`;
      
      // Get reference to storage location
      const storage = getStorage();
      const storageRef = ref(storage, `products/${filename}`);
      
      // Upload the file directly
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error(`Error uploading image ${imageIndex + 1} for product ${productIndex + 1}:`, error);
      throw error;
    }
  };
  
  const addProducts = async () => {
    // Check if at least one product has images
    const hasAnyImages = selectedFiles.some(files => files.length > 0);
    if (!hasAnyImages) {
      Alert.alert("Error", "Please select images for at least one product");
      return;
    }
    
    setIsAdding(true);
    setProgress('Starting upload process...');
    
    try {
      const results = [];
      
      // Process each product
      for (let i = 0; i < productsData.length; i++) {
        // Skip products with no images
        if (!selectedFiles[i] || selectedFiles[i].length === 0) {
          continue;
        }
        
        setProgress(`Processing product ${i + 1}: ${productsData[i].name}...`);
        
        // Upload all images for this product
        const imageUrlPromises = selectedFiles[i].map((file, imgIndex) => 
          uploadImageAsync(file, i, imgIndex)
        );
        
        const imageUrls = await Promise.all(imageUrlPromises);
        
        // Create a copy of the product data and add image URLs
        const productWithImages = {
          ...productsData[i],
          imageUrls: imageUrls
        };
        
        // Add the document to the "foodItems" collection
        const docRef = await addDoc(collection(FIREBASE_DB, 'foodItems'), productWithImages);
        results.push({
          name: productWithImages.name,
          id: docRef.id,
          imageCount: imageUrls.length
        });
      }
      
      // Clean up preview URLs
      const allPreviews = previewUrls.flat();
      allPreviews.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
      
      // Reset state
      setSelectedFiles(new Array(productsData.length).fill([]));
      setPreviewUrls(new Array(productsData.length).fill([]));
      
      // Show results
      const resultMessage = results.map(r => 
        `${r.name}: ID ${r.id}, ${r.imageCount} images`
      ).join('\n');
      
      Alert.alert(
        "Success", 
        `Added ${results.length} products to database:\n\n${resultMessage}`
      );
      
    } catch (error) {
      console.error("Error adding products:", error);
      Alert.alert("Error", `Failed to add products: ${error.message}`);
    } finally {
      setIsAdding(false);
      setProgress('');
    }
  };

  return (
    <TextPagesLayout>
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.title}>Add Multiple Products with Images</Text>
          <Text style={styles.description}>
            Select images for each product using the file pickers below, then click "Add Products" to upload them to Firebase Storage.
          </Text>
          
          {/* Product cards */}
          {productsData.map((product, index) => (
            <ProductCard
              key={index}
              product={product}
              index={index}
              handleFileChange={handleFileChange}
              previewUrls={previewUrls}
              isUploading={isAdding}
            />
          ))}
          
          <TouchableOpacity 
            style={[styles.button, isAdding && styles.buttonDisabled]} 
            onPress={addProducts}
            disabled={isAdding}
          >
            <Text style={styles.buttonText}>
              {isAdding ? "Processing..." : "Add Products with Images"}
            </Text>
          </TouchableOpacity>
          
          {isAdding && (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="small" color="#FF3B30" />
              <Text style={styles.progressText}>{progress}</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  productCard: {
    marginBottom: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  productCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  productCardDetails: {
    marginBottom: 15,
  },
  selectImagesText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  previewsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  imagePreview: {
    width: 80,
    height: 80,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
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
  detailText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
    color: '#333',
  }
});

export default DummyScreen;



/*
{
  name: "Колбаса Краковская, сухая, экстра",
  packaging: "вакуум",
  netWeight: { value: 1200, unit: "г", approximate: false },
  storageTemperature: { min: 2, max: 25, unit: "°C" },
  processingType: ["пропаривание", "сушка", "копчение"],
  meatType: "свинина",
  meatContent: {
    value: 143,
    unit: "г",
    description: "На 100 г готового продукта уходит 143 г свинины."
  },
  shelfLife: { value: 54, unit: "дней" },
  translations: {
    uk: {
      name: "Ковбаса Краківська, суха, екстра",
      packaging: "вакуум",
      meatType: "свинина",
      meatContentDescription:
        "На 100 г готового продукту використовується 143 г свинини",
      processingType: ["на пару", "сушіння", "копчення"]
    },
    ru: {
      name: "Колбаса Краковская, сухая, экстра",
      packaging: "вакуум",
      meatType: "свинина",
      meatContentDescription:
        "На 100 г готового продукта уходит 143 г свинины.",
      processingType: ["пропаривание", "сушка", "копчение"]
    },
    en: {
      name: "Krakowska Sausage, Dry, Extra",
      packaging: "vacuum",
      meatType: "pork",
      meatContentDescription:
        "143 g of pork used for 100 g of finished product",
      processingType: ["steamed", "dried", "smoked"]
    },
    es: {
      name: "Salchicha Krakowska, seca, extra",
      packaging: "al vacío",
      meatType: "cerdo",
      meatContentDescription:
        "Se usan 143 g de cerdo por cada 100 g de producto final",
      processingType: ["al vapor", "secado", "ahumado"]
    }
  }
},
 */