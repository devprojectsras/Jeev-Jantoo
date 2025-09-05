import { Injectable } from '@angular/core';
import { initializeApp } from "firebase/app";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, confirmPasswordReset } from "firebase/auth";
import { deleteDoc, getDoc, doc, getFirestore, query, setDoc, updateDoc, where } from "firebase/firestore";
import { collection, addDoc,getCountFromServer,Firestore, getDocs } from "firebase/firestore";
import * as bcrypt from 'bcryptjs';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private firebaseConfig = {
    apiKey: "AIzaSyB5b9mW2JUyiIW9GZMNt71tuc71zefomlA",
    authDomain: "jeevjantoo-af3a1.firebaseapp.com",
    projectId: "jeevjantoo-af3a1",
    storageBucket: "jeevjantoo-af3a1.firebasestorage.app",
    messagingSenderId: "256459865200",
    appId: "1:256459865200:web:d25153592d78d7a3f108b5"
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



  async signInAdmin(email: string, password: string): Promise<boolean> {
    try {
      // Query Firestore for the 'admins' collection where the 'email' field matches the provided email
      const q = query(collection(this.db, 'admins'), where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // If a document is found, get the data
        const adminData = querySnapshot.docs[0].data();
        console.log('Admin data from Firestore:', adminData);

        // Attempt to authenticate using Firebase Authentication
        try {
          const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
          console.log('Authenticated with Firebase:', userCredential);  // Log Firebase auth response
          const sessionExpiry = new Date().getTime() + 28800000; // 8 hour session
          localStorage.setItem('userEmail', email);
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('sessionExpiry', sessionExpiry.toString());
          return true; // If authentication is successful, return true
        } catch (authError) {
          throw new Error('Incorrect password');
        }
      } else {
        throw new Error('User not registered');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);  // Throw specific error with message
      } else {
        throw new Error('An unexpected error occurred during admin sign-in.');
      }
    }
  }

  async addInformation(docID: string, data: any, collection: string): Promise<any> {
    try {
      const docRef = doc(this.db, collection, docID);
      await setDoc(docRef, data);
      console.log("Data added successfully:", data);
      return data;
    } catch (error) {
      console.error("Error adding data:", error);
      throw error;
    }
  }
  async getInformation(collectionName: string): Promise<any[]> {
    const querySnapshot = await getDocs(collection(this.db, collectionName));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async updateStatus(collectionName: string, id: string, status: string): Promise<void> {
    try {
      // Create a reference to the document
      const docRef = doc(this.db, collectionName, id);
      await updateDoc(docRef, {
        status: status,
        updatedAt: Date.now()
      });

      console.log(`Status of document with ID: ${id} updated to ${status}`);
    } catch (error) {
      console.error('Error updating status: ', error);
      throw new Error('Error updating status');
    }
  }

  async editInformation(collectionName: string, id: string, data: any): Promise<void> {
    try {
      const docRef = doc(this.db, collectionName, id);
      await updateDoc(docRef, { ...data, updatedAt: Date.now() });

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
  
  async uploadFile(path: string, file: File): Promise<string> {
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, file); // Upload file
    return getDownloadURL(storageRef); // Get download URL
  }

  async getCategoryCount(collectionName: string): Promise<number> {
    try {
      const categoryRef = collection(this.db, collectionName);
      const countSnapshot = await getCountFromServer(categoryRef);
      const count = countSnapshot.data().count; // Get the count value
      return count;
    } catch (error) {
      console.error('Error getting count for ' + collectionName + ':', error);
      throw new Error('Error fetching category count');
    }
  }
  
  
  async sendPasswordResetEmail(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email, {
        // Customize the email sent by Firebase
        url: 'http://localhost:4200/reset-password', // Firebase redirect URL
        handleCodeInApp: true
      });
    } catch (error: unknown) {  // Handle error as 'unknown'
      if (error instanceof Error) {  // Check if error is an instance of Error
        throw new Error(error.message);
      } else {
        throw new Error('An unknown error occurred.');
      }
    }
  }

  // Method to confirm password reset
  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    try {
      console.log('Attempting password reset with code:', code); // Log code
      console.log('New password being set:', newPassword); // Log password

      await confirmPasswordReset(this.auth, code, newPassword);

      console.log('Password reset confirmed successfully.');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error during password reset:', error.message); // Log error
        throw new Error(error.message);
      } else {
        console.error('Unknown error during password reset.');
        throw new Error('An unknown error occurred.');
      }
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    const user = this.auth.currentUser;

    if (user) {
      try {
        // Directly update the password if the user is authenticated
        await updatePassword(user, newPassword);
        console.log('Password updated successfully');
      } catch (error: unknown) {
        throw new Error(error instanceof Error ? error.message : 'An unknown error occurred.');
      }
    } else {
      throw new Error('No authenticated user found.');
    }
  }

  
  
}

