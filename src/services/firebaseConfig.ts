import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { initializeFirestore, getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import appletConfig from '../../firebase-applet-config.json';

// Initialize Firebase App directly from provisioned config
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(appletConfig);

// Initialize Cloud Firestore with auto-detect long polling to ensure reliable connectivity in iframe environments
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(
    app,
    { experimentalAutoDetectLongPolling: true },
    appletConfig.firestoreDatabaseId
  );
} catch {
  firestoreInstance = getFirestore(app, appletConfig.firestoreDatabaseId);
}

export const db: Firestore = firestoreInstance;
export const auth: Auth = getAuth(app);

export const isFirebaseConfigured = (): boolean => {
  return Boolean(appletConfig.apiKey && appletConfig.projectId);
};

export const getFirebaseApp = (): FirebaseApp => app;
export const getDb = (): Firestore => db;
export const getFirebaseAuth = (): Auth => auth;

// Validate connection to Firestore as required by system guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      // Retry after a brief pause in case the iframe network layer was still initializing
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await getDocFromServer(doc(db, 'test', 'connection'));
        return;
      } catch (retryError) {
        if (retryError instanceof Error && retryError.message.includes('the client is offline')) {
          console.error('Please check your Firebase configuration.', retryError);
        }
      }
    }
  }
}

testConnection();

