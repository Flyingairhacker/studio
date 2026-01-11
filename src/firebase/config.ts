// This file is used to configure the Firebase SDK.
// It is safe to expose these values on the client side.
// For more information on how to get these values, see:
// https://firebase.google.com/docs/web/setup#get-config

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (!apiKey) {
    throw new Error("Missing Firebase API Key. Please set NEXT_PUBLIC_FIREBASE_API_KEY in your .env.local file.");
}

export const firebaseConfig = {
  apiKey: apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
