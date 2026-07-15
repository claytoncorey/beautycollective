import { initializeApp, getApps } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  query,
  where
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged as fbOnAuthStateChanged
} from "firebase/auth";
import {
  getStorage,
  ref as sRef,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import {
  getAnalytics,
  isSupported,
  logEvent as fbLogEvent
} from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Log warning if config variables are missing, but let Firebase SDK handle validation errors
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn("Firebase configuration environment variables are missing. Please populate your .env file.");
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Asynchronously initialize Analytics to support all environments safely
const analyticsPromise = isSupported()
  .then((supported) => (supported ? getAnalytics(app) : null))
  .catch((err) => {
    console.warn("Firebase Analytics is not supported or failed to load:", err);
    return null;
  });

export const analyticsService = {
  async logPageView(viewName) {
    try {
      const analytics = await analyticsPromise;
      if (analytics) {
        fbLogEvent(analytics, 'page_view', {
          page_title: viewName,
          page_location: window.location.href,
          page_path: `/${viewName}`
        });
      }
    } catch (e) {
      console.warn("Failed to log page view event:", e);
    }
  },

  async logEvent(eventName, params = {}) {
    try {
      const analytics = await analyticsPromise;
      if (analytics) {
        fbLogEvent(analytics, eventName, params);
      }
    } catch (e) {
      console.warn("Failed to log custom event:", e);
    }
  }
};


// Unified Data Access API
export const dbService = {
  // Get all professionals
  async getProfessionals() {
    const querySnapshot = await getDocs(collection(db, "professionals"));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ ...doc.data(), id: doc.id });
    });
    return list;
  },

  // Get professional by email (case-insensitive)
  async getProfessionalByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    
    // Query exact match first
    const q = query(collection(db, "professionals"), where("email", "==", email.trim()));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { ...docSnap.data(), id: docSnap.id };
    }
    
    // Case insensitive fallback (fetch all and find)
    const all = await this.getProfessionals();
    return all.find(tech => tech.email.toLowerCase() === cleanEmail) || null;
  },

  // Add a new professional
  async addProfessional(tech) {
    const newTech = {
      ...tech,
      id: tech.id || Math.random().toString(36).substr(2, 9),
      status: tech.status || "pending",
      isFeatured: tech.isFeatured || false,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, "professionals"), newTech);
    return { ...newTech, id: docRef.id };
  },

  // Update a professional's details/status
  async updateProfessional(id, updatedFields) {
    const docRef = doc(db, "professionals", id);
    await updateDoc(docRef, updatedFields);
    return true;
  },

  // Delete a professional
  async deleteProfessional(id) {
    const docRef = doc(db, "professionals", id);
    await deleteDoc(docRef);
    return true;
  },

  // Submit anonymous feedback
  async addFeedback(feedbackText) {
    const feedbackDoc = {
      feedback: feedbackText,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, "feedback"), feedbackDoc);
    return { ...feedbackDoc, id: docRef.id };
  }
};

export const authService = {
  // Check auth state
  onAuthStateChanged(callback) {
    return fbOnAuthStateChanged(auth, callback);
  },

  // Login
  async signIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  },

  // Register
  async signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  },

  // Sign out
  async signOut() {
    return fbSignOut(auth);
  },

  // Password Reset
  async resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }
};

export const storageService = {
  // Upload professional media (portrait or logo)
  async uploadProfessionalFile(userEmail, folderName, file) {
    const cleanEmail = userEmail.trim().toLowerCase();
    const extension = file.name.split('.').pop();
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}.${extension}`;
    const fileRef = sRef(storage, `professionals/${cleanEmail}/${folderName}/${uniqueName}`);
    
    const snapshot = await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  }
};
