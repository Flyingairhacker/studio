import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "@/firebase/config";

let app;
let db;
let auth;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
  console.log("Firebase connection active. Cloud Stream online.");
} catch (error) {
  console.error("Firebase initialization failed:", error);
  console.warn("Firebase features will not be available.");
}

export { db, auth };
