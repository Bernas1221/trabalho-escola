import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDrCUOU644QApsrQ6MLmOtlEBmQ4-6LOCg",
  authDomain: "trabalho-da-escola-254e7.firebaseapp.com",
  projectId: "trabalho-da-escola-254e7",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);