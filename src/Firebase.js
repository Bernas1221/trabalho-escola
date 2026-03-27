import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSy...",
  authDomain: "trabalho-da-escola-254e7.firebaseapp.com",
  projectId: "trabalho-da-escola-254e7",
});

export const db = getFirestore(app);