import serverless from 'serverless-http';
import { createApiApp } from '../../server/app';
import {
  createFirestoreStore,
  hasFirestoreAdminCredentials,
} from '../../server/firestoreStore';
import { EdgeMaxDbError, type EdgeMaxDataStore } from '../../server/store';

let firestoreStorePromise: Promise<EdgeMaxDataStore> | null = null;

function getNetlifyStore(): Promise<EdgeMaxDataStore> {
  if (!firestoreStorePromise) {
    firestoreStorePromise = (async () => {
      if (!hasFirestoreAdminCredentials()) {
        throw new EdgeMaxDbError(
          'Database not configured on Netlify: set FIREBASE_SERVICE_ACCOUNT_JSON (or FIREBASE_SERVICE_ACCOUNT_BASE64) in Netlify Site Settings -> Environment Variables to connect your Cloud Firestore database.',
          503
        );
      }
      return createFirestoreStore();
    })().catch((err) => {
      firestoreStorePromise = null;
      throw err;
    });
  }
  return firestoreStorePromise;
}

const app = createApiApp({
  getStore: getNetlifyStore,
});

export const handler = serverless(app);
