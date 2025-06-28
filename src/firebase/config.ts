import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBiYboIRVBTgGEpw2j-jKRVOdaydtA-YhY",
    authDomain: "picky-app-6125b.firebaseapp.com",
    projectId: "picky-app-6125b",
    storageBucket: "picky-app-6125b.firebasestorage.app",
    messagingSenderId: "1028535845202",
    appId: "1:1028535845202:web:723eaaba3de6c1edd67a8b",
    measurementId: "G-HDTP6HHXGD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
