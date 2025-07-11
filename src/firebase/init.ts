// initialise Firebase only once
import { FirebaseApp, initializeApp } from '@react-native-firebase/app';

let app: FirebaseApp | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (app) return app;

  app = initializeApp({
    apiKey: "AIzaSyD884mfzzEhPY5icP_hbd8ninH35djZcf8",
  authDomain: "crm-notifi-ca869.firebaseapp.com",
  projectId: "crm-notifi-ca869",
  storageBucket: "crm-notifi-ca869.firebasestorage.app",
  messagingSenderId: "478139440162",
  appId: "1:478139440162:web:c2fe376d543659b168be7b",
  measurementId: "G-R5S63HRY2Z"
  });

  return app;
}
