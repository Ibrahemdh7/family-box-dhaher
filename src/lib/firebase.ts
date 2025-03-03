import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Replace with your Firebase config
    apiKey: "AIzaSyBVAFTEZ92xwxkoR0DHRaHETGUVGBx9z8E",
    authDomain: "dhaherbox.firebaseapp.com",
    projectId: "dhaherbox",
    storageBucket: "dhaherbox.firebasestorage.app",
    messagingSenderId: "81275257493",
    appId: "1:81275257493:web:a75ecfea1ec7238034d19c",
    measurementId: "G-YCMJ3CPQCV"

};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;