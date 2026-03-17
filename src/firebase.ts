import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCF1vxKG_RE_XM-vX_ZbxDaq3z3mMHWdN8",
  authDomain: "circles-app-8898d.firebaseapp.com",
  projectId: "circles-app-8898d",
  storageBucket: "circles-app-8898d.firebasestorage.app",
  messagingSenderId: "195540836481",
  appId: "1:195540836481:web:7f6610f103090398c9ad80"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

console.log("Firebase Connected");
export default app;
