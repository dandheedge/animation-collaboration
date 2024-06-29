import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "animation-collaboration.firebaseapp.com",
  projectId: "animation-collaboration",
  storageBucket: "animation-collaboration.appspot.com",
  messagingSenderId: "939544919376",
  appId: "1:939544919376:web:9fc0cad0401bc369658055",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
