// Import the functions you need from the SDKs you need
// src/firebase.ts
import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCb64M8yhXokADiTh7lA62jaSvxBy4G7pQ",
  authDomain: "clubhub-e810b.firebaseapp.com",
  databaseURL: "https://clubhub-e810b-default-rtdb.firebaseio.com",
  projectId: "clubhub-e810b",
  storageBucket: "clubhub-e810b.firebasestorage.app",
  messagingSenderId: "786777391504",
  appId: "1:786777391504:web:e62ec3e2bec89a19813315"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Cloud Firestore (The Database)
export const db: Firestore = getFirestore(app);
