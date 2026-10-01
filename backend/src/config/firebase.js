import fs from 'fs';
import path from 'path';
// Modular API (firebase-admin/app, firebase-admin/auth) — the default
// `import admin from 'firebase-admin'` namespace import doesn't reliably
// expose sub-properties like `admin.credential` under Node ESM interop,
// which throws "Cannot read properties of undefined (reading 'cert')".
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { env } from './env.js';

let authInstance = null;

/**
 * FIREBASE_SERVICE_ACCOUNT_JSON (the whole key file's contents, pasted as one
 * env var — for hosts like Render/Railway with no file upload) wins when set;
 * FIREBASE_SERVICE_ACCOUNT_PATH (a local file path, for local dev) is the
 * fallback so nothing changes for anyone already running locally.
 */
const loadServiceAccount = () => {
  if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }
  if (env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const resolvedPath = path.resolve(process.cwd(), env.FIREBASE_SERVICE_ACCOUNT_PATH);
    return JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
  }
  return null;
};

/**
 * Lazily initializes the Firebase Admin SDK and returns its Auth service.
 * Deferred so a server that never exercises Google Sign-In (e.g. local dev
 * without either var set) doesn't crash on boot.
 */
export const getFirebaseAuth = () => {
  if (authInstance) return authInstance;

  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    throw new Error(
      'Firebase is not configured on the server. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH.'
    );
  }

  const app = getApps().length ? getApp() : initializeApp({ credential: cert(serviceAccount) });
  authInstance = getAuth(app);
  return authInstance;
};
