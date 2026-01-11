
import * as admin from 'firebase-admin';

// This function initializes and returns the Firebase Admin SDK.
// It's designed to be a singleton, ensuring it only initializes once.
export function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return {
      db: admin.firestore(),
      auth: admin.auth(),
    };
  }

  // Environment variables for Firebase Admin SDK
  // These should be set in your deployment environment (e.g., Vercel, Google Cloud Run)
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // The private key must be formatted correctly (replace \\n with \n)
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };

  // Check if essential service account info is present
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    throw new Error('Firebase Admin SDK service account information is missing or incomplete in environment variables.');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // You might need to add databaseURL if it's not inferred
    // databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`
  });

  return {
    db: admin.firestore(),
    auth: admin.auth(),
  };
}
