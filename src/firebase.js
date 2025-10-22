// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "",
  authDomain: "smart-planner-da263.firebaseapp.com",
  projectId: "smart-planner-da263",
  storageBucket: "smart-planner-da263.firebasestorage.app",
  messagingSenderId: "815434623968",
  appId: "1:815434623968:web:f46e34fb21096a912b5985",
  measurementId: "G-E9JFFN7LRS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
