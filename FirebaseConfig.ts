// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Import analytics conditionally
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGM9l3hhlkdgp2SCOz5nhCeMD9ir9cp6A",
  authDomain: "foodshoppingwebsite.firebaseapp.com",
  projectId: "foodshoppingwebsite",
  storageBucket: "foodshoppingwebsite.firebasestorage.app",
  messagingSenderId: "196426062886",
  appId: "1:196426062886:web:140825f109440a5fdc5ae7",
  measurementId: "G-131WBV1VP2"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);

// Initialize analytics safely
let analyticsInstance = null;
const initializeAnalytics = async () => {
  try {
    if (await isSupported()) {
      analyticsInstance = getAnalytics(FIREBASE_APP);
      console.log("Analytics initialized successfully");
    }
  } catch (error) {
    console.log("Analytics not supported in this environment");
  }
};

// Only initialize analytics - don't export directly
initializeAnalytics();

export const getAnalyticsInstance = () => analyticsInstance;