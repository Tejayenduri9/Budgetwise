// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "@firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDvTsOhhD-l7hraJ0IOIpMZ-29abL_oYNo",
  authDomain: "budgetwise-c3cd9.firebaseapp.com",
  projectId: "budgetwise-c3cd9",
  storageBucket: "budgetwise-c3cd9.appspot.com",
  messagingSenderId: "938092216026",
  appId: "1:938092216026:web:b7e183e7526bf5e81f2fe3",
  measurementId: "G-PFYM2TRDMR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);
export default app;