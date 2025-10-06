import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  confirmPasswordReset as fbConfirmPasswordReset,
  updatePassword as fbUpdatePassword,
  User
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  getCountFromServer,
  serverTimestamp,
  CollectionReference,
  DocumentReference
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export type PetStatus = 'Pending' | 'Active' | 'Inactive' | 'Adopted';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private firebaseConfig = {
    apiKey: 'AIzaSyB5b9mW2JUyiIW9GZMNt71tuc71zefomlA',
    authDomain: 'jeevjantoo-af3a1.firebaseapp.com',
    projectId: 'jeevjantoo-af3a1',
    storageBucket: 'jeevjantoo-af3a1.firebasestorage.app',
    messagingSenderId: '256459865200',
    appId: '1:256459865200:web:d25153592d78d7a3f108b5'
  };

  public db: any;
  private auth: any;
  private storage: any;

  // Optional: lets you unlock admin UI if admins/{uid} doc not seeded yet (dev)
  private FALLBACK_ADMIN_UIDS = ['an34sdrlaNZRNYaG132yc40zmhL2'];

  // Directory types that live under /directories/{type}/{docId}
  private DIRECTORY_TYPES = new Set<string>([
    'clinics',
    'ngos',
    'events',
    'ambulance',
    'boarding_spa',   // combined category
    'boarding',       // keep both to be safe
    'spa',
    'abc',
    'govt_helpline',
    'feeding',
    'medical_insurance'
  ]);

  constructor() {
    const app = initializeApp(this.firebaseConfig);
    this.db = getFirestore(app);
    this.auth = getAuth(app);
    this.storage = getStorage(app);
  }

  // ------- helpers: refs that honor /directories/{type} layout -------
  // private colRef(name: string): CollectionReference {
  //   if (this.DIRECTORY_TYPES.has(name)) {
  //     return collection(this.db, 'directories', name);
  //   }
  //   return collection(this.db, name);
  // }
  // private docRef(name: string, id: string): DocumentReference {
  //   if (this.DIRECTORY_TYPES.has(name)) {
  //     return doc(this.db, 'directories', name, id);
  //   }
  //   return doc(this.db, name, id);
  // }

  private colRef(name: string): CollectionReference {
  return collection(this.db, name);
}
private docRef(name: string, id: string): DocumentReference {
  return doc(this.db, name, id);
}
  private currentUidOrThrow(): string {
    const u: User | null = this.auth.currentUser;
    if (!u) throw new Error('No authenticated user found.');
    return u.uid;
  }

  // ---------------- Admin Auth ----------------
  async signInAdmin(email: string, password: string): Promise<boolean> {
    try {
      // 1) Sign-in first (Auth does not depend on Firestore rules)
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
      const uid = cred.user.uid;

      // 2) Verify admin AFTER sign-in (admins/{uid} doc)
      const adminSnap = await getDoc(doc(this.db, 'admins', uid));
      const isAdmin = adminSnap.exists() || this.FALLBACK_ADMIN_UIDS.includes(uid);
      if (!isAdmin) {
        await this.auth.signOut();
        throw new Error(`Not an admin. Ask owner to add your UID at /admins/${uid}`);
      }

      // 3) Session state (8-hour session window)
      const sessionExpiry = Date.now() + 8 * 60 * 60 * 1000;
      localStorage.setItem('userEmail', email);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('sessionExpiry', String(sessionExpiry));
      return true;
    } catch (err: any) {
      throw new Error(err?.message || 'Admin sign-in failed');
    }
  }

  // Seed your own admin doc quickly (Console writes bypass rules, but this helps in dev)
  async ensureMyAdminDoc() {
    const uid = this.currentUidOrThrow();
    const ref = doc(this.db, 'admins', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        email: this.auth.currentUser?.email || '',
        createdAt: serverTimestamp()
      });
    }
    return uid;
  }

  // ---------------- Password helpers ----------------
  async sendPasswordResetEmail(email: string) {
    try {
      await fbSendPasswordResetEmail(this.auth, email, {
        url: 'http://localhost:4200/reset-password',
        handleCodeInApp: true
      });
    } catch (error: unknown) {
      if (error instanceof Error) throw new Error(error.message);
      throw new Error('An unknown error occurred.');
    }
  }

  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    try {
      await fbConfirmPasswordReset(this.auth, code, newPassword);
    } catch (error: unknown) {
      if (error instanceof Error) throw new Error(error.message);
      throw new Error('An unknown error occurred.');
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No authenticated user found.');
    try {
      await fbUpdatePassword(user, newPassword);
      console.log('Password updated successfully');
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  }

  // ---------------- Generic Firestore CRUD (honors directories path) ----------------
  async addInformation(docID: string, data: any, collectionName: string): Promise<any> {
    try {
      const ref = this.docRef(collectionName, docID);
      await setDoc(ref, data);
      return { id: docID, ...data };
    } catch (error) {
      console.error('Error adding data:', error);
      throw error;
    }
  }

  async getInformation(collectionName: string): Promise<any[]> {
    const snap = await getDocs(this.colRef(collectionName));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async getDocument(collectionName: string, id: string) {
    const ref = this.docRef(collectionName, id);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }

  async editInformation(collectionName: string, id: string, data: any): Promise<void> {
    try {
      const ref = this.docRef(collectionName, id);
      await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
      console.log(`Document with ID: ${id} updated`);
    } catch (error) {
      console.error('Error updating document: ', error);
      throw new Error('Error updating document');
    }
  }

  async deleteInformation(collectionName: string, id: string): Promise<void> {
    try {
      const ref = this.docRef(collectionName, id);
      await deleteDoc(ref);
      console.log(`Document with ID ${id} deleted`);
    } catch (error) {
      console.error(`Error deleting document with ID ${id}:`, error);
      throw error;
    }
  }

  async getCategoryCount(collectionName: string): Promise<number> {
    try {
      const countSnapshot = await getCountFromServer(this.colRef(collectionName));
      return countSnapshot.data().count;
    } catch (error) {
      console.error('Error getting count for ' + collectionName + ':', error);
      throw new Error('Error fetching category count');
    }
  }

  // ---------------- Storage ----------------
  async uploadFile(path: string, file: File): Promise<string> {
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  // ---------------- Adoption (ADMIN) ----------------
  /**
   * Writes to 'pet-adoption' with required rule fields + uploads to adoption/{uid}/...
   */
  async addAdoption(data: any, file?: File): Promise<any> {
    try {
      const adminUid = this.currentUidOrThrow();

      const safeName = (data?.petName || 'pet').toString().replace(/\s+/g, '_');
      const id = `${safeName}_${Date.now()}`;

      let photoURL = '';
      if (file) {
        // matches storage.rules: /adoption/{uid}/{path=**}
        const path = `adoption/${adminUid}/${id}/${file.name}`;
        photoURL = await this.uploadFile(path, file);
      }

      const adoptionData = {
        ...data,
        id,
        status: 'Active' as PetStatus, // admin can publish directly
        photos: photoURL ? [photoURL] : (Array.isArray(data?.photos) ? data.photos : []),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),

        // REQUIRED by firestore.rules (pet-adoption)
        submitterUid: adminUid,
        ownerUid: adminUid
      };

      const ref = doc(this.db, 'pet-adoption', id);
      await setDoc(ref, adoptionData);
      console.log('Adoption added with ID:', id);
      return { id, ...adoptionData };
    } catch (error) {
      console.error('Error adding adoption:', error);
      throw error;
    }
  }

  
  // ---------------- Report Entry ----------------
  async reportEntry(collectionName: string, docId: string, reason: string): Promise<void> {
    try {
      const user = this.currentUidOrThrow();
      const reportId = `${collectionName}_${docId}_${user}`;
      const reportRef = doc(this.db, 'reports', reportId);
      
      // Check for existing report to prevent duplicates
      const existingReport = await getDoc(reportRef);
      if (existingReport.exists()) {
        throw new Error('ALREADY_EXISTS');
      }

      const reportData = {
        collection: collectionName,
        id: docId,
        reason: reason || 'Incorrect information',
        userId: user,
        status: 'open',
        createdAt: serverTimestamp()
      };

      await setDoc(reportRef, reportData);
      console.log(`Report created with ID: ${reportId}`);
    } catch (error: any) {
      if (error.message === 'ALREADY_EXISTS') {
        throw new Error('ALREADY_EXISTS');
      }
      if (error.message === 'auth/required') {
        throw new Error('auth/required');
      }
      console.error('Error creating report:', error);
      throw new Error(error.code || 'Could not submit report');
    }
  }

  // ---------------- Status (generic) ----------------
  async updateStatus(collectionName: string, id: string, status: PetStatus | string): Promise<void> {
    try {
      const normalized = this.normalizeStatus(status);
      const ref = this.docRef(collectionName, id);
      await updateDoc(ref, { status: normalized, updatedAt: serverTimestamp() });
      console.log(`Status of document ${id} updated to ${normalized}`);
    } catch (error) {
      console.error('Error updating status: ', error);
      throw new Error('Error updating status');
    }
  }

  private normalizeStatus(val: PetStatus | string): PetStatus | string {
    if (typeof val !== 'string') return val;
    const v = val.trim().toLowerCase();
    if (v === 'active') return 'Active';
    if (v === 'inactive') return 'Inactive';
    if (v === 'pending') return 'Pending';
    if (v === 'adopted') return 'Adopted';
    return val;
  }
}
