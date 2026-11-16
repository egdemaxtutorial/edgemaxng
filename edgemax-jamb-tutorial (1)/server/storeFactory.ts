import path from 'node:path';
import {
  createFirestoreStore,
  hasFirestoreAdminCredentials,
} from './firestoreStore';
import { EdgeMaxDbError, type EdgeMaxDataStore } from './store';

let cachedStorePromise: Promise<EdgeMaxDataStore> | null = null;

export function isServerlessRuntime(): boolean {
  return Boolean(
    process.env.NETLIFY === 'true' || process.env.AWS_LAMBDA_FUNCTION_NAME
  );
}

export async function getEdgeMaxStore(): Promise<EdgeMaxDataStore> {
  if (!cachedStorePromise) {
    cachedStorePromise = (async () => {
      if (hasFirestoreAdminCredentials()) {
        return createFirestoreStore();
      }

      if (isServerlessRuntime()) {
        throw new EdgeMaxDbError(
          'Database not configured on Netlify: set FIREBASE_SERVICE_ACCOUNT_JSON (or FIREBASE_SERVICE_ACCOUNT_BASE64) in Netlify Site Settings -> Environment Variables to connect your Firestore database.',
          503
        );
      }

      const { createSqliteStore } = await import('./db');
      const dataDir = path.join(process.cwd(), '.data');
      return createSqliteStore(path.join(dataDir, 'edgemax.sqlite'));
    })().catch((err) => {
      cachedStorePromise = null;
      throw err;
    });
  }

  return cachedStorePromise;
}
