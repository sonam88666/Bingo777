import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInAnonymously,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import {
  initializeFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import {
  getDatabase,
  ref as rtdbRef,
  set as rtdbSet,
  get as rtdbGet,
  push as rtdbPush,
  onValue as rtdbOnValue,
  onChildAdded as rtdbOnChildAdded,
  update as rtdbUpdate,
  remove as rtdbRemove,
  runTransaction as rtdbRunTransaction,
  query as rtdbQuery,
  limitToLast as rtdbLimitToLast
} from 'firebase/database';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true
  },
  firebaseConfig.firestoreDatabaseId
);
export const rtdb = firebaseConfig.databaseURL ? getDatabase(app, firebaseConfig.databaseURL) : getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Single permanent device identifier stored in localStorage.getItem('BINGO_PERSISTENT_DEVICE_ID')
// Generated once if it does not exist; never overwritten on refresh or logout.
export function getPersistentDeviceId(): string {
  if (typeof window === 'undefined') return 'dev_server_default';
  try {
    const existing = localStorage.getItem('BINGO_PERSISTENT_DEVICE_ID');
    if (existing && existing.trim().length > 0) {
      return existing.trim();
    }
    const legacy = localStorage.getItem('app_device_uuid') || localStorage.getItem('bingo777_client_device_id');
    const generated =
      legacy && legacy.startsWith('dev_')
        ? legacy
        : `dev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem('BINGO_PERSISTENT_DEVICE_ID', generated);
    localStorage.setItem('app_device_uuid', generated);
    localStorage.setItem('bingo777_client_device_id', generated);
    return generated;
  } catch {
    return 'dev_fallback_persistent';
  }
}

// Configure Firebase Auth persistence immediately on initialization
if (typeof window !== 'undefined') {
  getPersistentDeviceId();
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('[Firebase] setPersistence warning:', err);
  });

  const validateConnection = async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error('Please check your Firebase configuration.');
      }
    }
  };
  validateConnection();
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  signInWithPopup,
  signOut,
  signInAnonymously,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  rtdbRef,
  rtdbSet,
  rtdbGet,
  rtdbPush,
  rtdbOnValue,
  rtdbOnChildAdded,
  rtdbUpdate,
  rtdbRemove,
  rtdbRunTransaction,
  rtdbQuery,
  rtdbLimitToLast
};

