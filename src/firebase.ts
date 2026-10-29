import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInAnonymously } from 'firebase/auth';
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

// Automatically ensure an active Firebase Auth session exists and validate connection on boot
if (typeof window !== 'undefined') {
  const initAndValidateConnection = async () => {
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth).catch(() => {});
      }
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error('Please check your Firebase configuration.');
      }
    }
  };
  initAndValidateConnection();
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
