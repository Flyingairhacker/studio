// This file is used to configure the Firebase SDK.
// It is safe to expose these values on the client side.
// For more information on how to get these values, see:
// https://firebase.google.com/docs/web/setup#get-config

// This setup allows the config to work on both server and client.
// It prioritizes server-only variables, falling back to public ones.
const apiKey = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

// No longer throwing an error here to prevent build-time crashes.
// The app will fail later if the key is truly missing when a Firebase service is used.

export const firebaseConfig = {
  apiKey: apiKey,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
