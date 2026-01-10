import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./firebase-config";

let app;
let db;
let isFirebaseAvailable = false;

try {
  // Check if all necessary Firebase config keys are present
  const areAllConfigKeysPresent = Object.values(firebaseConfig).every(val => val);

  if (areAllConfigKeysPresent) {
    app = !getApps().length ? initializeApp(firebaseConfig as FirebaseOptions) : getApp();
    db = getFirestore(app);
    isFirebaseAvailable = true;
    console.log("Firebase connection active. Cloud Stream online.");
  } else {
    console.warn("Firebase config is incomplete. Falling back to Local Node Broadcast. The site will be view-only.");
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
  console.warn("Falling back to Local Node Broadcast due to initialization error. The site will be view-only.");
}

export { db, isFirebaseAvailable };
