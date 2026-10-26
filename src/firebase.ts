import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInAnonymously } from 'firebase/auth';
import {
  initializeFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import {
  getDatabase,
  ref as rtdbRef,
  set as rtdbSet,
  get as rtdbGet,
  onValue as rtdbOnValue,
  update as rtdbUpdate
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

// Automatically ensure an active Firebase Auth session exists so RTDB & Firestore permissions pass
if (typeof window !== 'undefined') {
  if (!auth.currentUser) {
    signInAnonymously(auth).catch((err) => {
      console.warn('Firebase anonymous auth init:', err?.message || err);
    });
  }
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
  collection,
  onSnapshot,
  serverTimestamp,
  signInWithPopup,
  signOut,
  rtdbRef,
  rtdbSet,
  rtdbGet,
  rtdbOnValue,
  rtdbUpdate
};

