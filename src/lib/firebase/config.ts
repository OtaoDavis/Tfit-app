import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
// import { getStorage, type FirebaseStorage } from 'firebase/storage';
// import { getAnalytics, type Analytics } from 'firebase/analytics';

// Ensure your .env.local file has these variables correctly defined
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app: FirebaseApp;

if (!firebaseConfig.apiKey) {
  console.error(
    'Firebase API Key is missing. Ensure NEXT_PUBLIC_FIREBASE_API_KEY is set in your .env.local file.'
  );
  // Initialize app with a dummy config if API key is missing to prevent immediate crash,
  // but functionality will be broken.
  app = initializeApp({ apiKey: "MISSING_KEY_CHECK_ENV" });

} else if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const firestore: Firestore = getFirestore(app);
// const storage: FirebaseStorage = getStorage(app);
// let analytics: Analytics | undefined;

// if (typeof window !== 'undefined') {
//   if (app.name && typeof firebase.analytics === 'function') { // This check might need adjustment for modular SDK
//     analytics = getAnalytics(app);
//   }
// }

export { app, auth, firestore /*, storage, analytics */ };
