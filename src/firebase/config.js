
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCa2NmGaBwoRIVZHRZN1-YWmNr5r920nR0",
  authDomain: "citypulse-7c9ea.firebaseapp.com",
  projectId: "citypulse-7c9ea",
  storageBucket: "citypulse-7c9ea.firebasestorage.app",
  messagingSenderId: "387038347930",
  appId: "1:387038347930:web:a63ce0d13abf6b42d39523",
  measurementId: "G-9FBZT3HLE9",
};

// Reuse the existing Firebase app if already initialized.
const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
