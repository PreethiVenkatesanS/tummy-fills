import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// IMPORTANT: Replace these with your actual Firebase config details!
const firebaseConfig = {
  apiKey: "AIzaSyB3Vjlh0SVPJIw40EIMrfDkm6McdOPwde4",
  authDomain: "tummy-filles-cloud-kitchen.firebaseapp.com",
  projectId: "tummy-filles-cloud-kitchen",
  storageBucket: "tummy-filles-cloud-kitchen.firebasestorage.app",
  messagingSenderId: "509135429090",
  appId: "1:509135429090:web:6b5b2a693003c32a6eedbb",
  measurementId: "G-C5L14T6362"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
