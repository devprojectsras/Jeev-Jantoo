import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  confirmPasswordReset as fbConfirmPasswordReset,
  updatePassword as fbUpdatePassword,
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
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export type PetStatus = 'Pending' | 'Active' | 'Inactive' | 'Adopted';

@Injectable({
  providedIn: 'root'
})
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

  constructor() {
    const app = initializeApp(this.firebaseConfig);
    this.db = getFirestore(app);
    this.auth = getAuth(app);
    this.storage = getStorage(app); // Initialize Firebase Storage
  }

  // ---------------- Admin Auth ----------------
  async signInAdmin(email: string, password: string): Promise<boolean> {
    try {
      // Verify admin presence in Firestore
      const q = query(collection(this.db, 'admins'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) throw new Error('User not registered');

      // Firebase Auth sign-in
      await signInWithEmailAndPassword(this.auth, email, password);
      const sessionExpiry = Date.now() + 8 * 60 * 60 * 1000; // 8 hours
      localStorage.setItem('userEmail', email);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('sessionExpiry', sessionExpiry.toString());
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('password')) throw new Error('Incorrect password');
        throw new Error(error.message);
      }
      throw new Error('An unexpected error occurred during admin sign-in.');
    }
  }

  // Keep your public method names but call the aliased SDK functions
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

  // ---------------- Generic Firestore CRUD ----------------
  async addInformation(docID: string, data: any, collectionName: string): Promise<any> {
    try {
      const docRef = doc(this.db, collectionName, docID);
      await setDoc(docRef, data);
      return { id: docID, ...data };
    } catch (error) {
      console.error('Error adding data:', error);
      throw error;
    }
  }

  async getInformation(collectionName: string): Promise<any[]> {
    const querySnapshot = await getDocs(collection(this.db, collectionName));
    return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async getDocument(collectionName: string, id: string) {
    const ref = doc(this.db, collectionName, id);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }

  async editInformation(collectionName: string, id: string, data: any): Promise<void> {
    try {
      const docRef = doc(this.db, collectionName, id);
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
      console.log(`Document with ID: ${id} updated with new data`);
    } catch (error) {
      console.error('Error updating document: ', error);
      throw new Error('Error updating document');
    }
  }

  async deleteInformation(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(this.db, collectionName, id);
      await deleteDoc(docRef);
      console.log(`Document with ID ${id} deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting document with ID ${id}:`, error);
      throw error;
    }
  }

  async getCategoryCount(collectionName: string): Promise<number> {
    try {
      const categoryRef = collection(this.db, collectionName);
      const countSnapshot = await getCountFromServer(categoryRef);
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
   * Create/seed into the SAME collection the user app reads:
   *   - collection: 'pet-adoption'
   *   - status: 'Active' (title case)
   *   - 'id' field mirrors the Firestore document id
   */
  async addAdoption(data: any, file?: File): Promise<any> {
    try {
      let photoURL = '';
      if (file) {
        const safeName = (data?.petName || 'pet').toString().replace(/\s+/g, '_');
        const path = `pet-photos/${Date.now()}_${safeName}_${file.name}`;
        photoURL = await this.uploadFile(path, file);
      }

      const id = `${(data?.petName || 'pet').toString().replace(/\s+/g, '_')}_${Date.now()}`;
      const adoptionData = {
        ...data,
        id,
        status: 'Active' as PetStatus,
        photos: photoURL ? [photoURL] : (Array.isArray(data?.photos) ? data.photos : []),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = doc(this.db, 'pet-adoption', id);
      await setDoc(docRef, adoptionData);
      console.log('Adoption added with ID:', id);
      return { id, ...adoptionData };
    } catch (error) {
      console.error('Error adding adoption:', error);
      throw error;
    }
  }

  // ---------------- Status (generic) ----------------
  /**
   * Accepts legacy string or PetStatus. Normalizes common variants.
   * This removes TS2345 in components passing string.
   */
  async updateStatus(collectionName: string, id: string, status: PetStatus | string): Promise<void> {
    try {
      const normalized = this.normalizeStatus(status);
      const docRef = doc(this.db, collectionName, id);
      await updateDoc(docRef, { status: normalized, updatedAt: serverTimestamp() });
      console.log(`Status of document with ID: ${id} updated to ${normalized}`);
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
    return val; // keep as-is for other modules/collections
  }
}
