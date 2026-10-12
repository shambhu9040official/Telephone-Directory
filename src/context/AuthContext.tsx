import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateUserProfileData: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_USER_ID = 'demo_student_evaluator';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('contactsphere_demo_mode') === 'true';
  });

  const syncUserProfile = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserProfile(userSnap.data() as UserProfile);
      } else {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Directory User',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || null,
          theme: 'light',
          phoneFormat: 'INTERNATIONAL',
          customCategories: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.error('Error syncing profile from Firestore:', err);
      // Fallback local representation if rules or network delays
      setUserProfile({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsDemoMode(false);
        localStorage.removeItem('contactsphere_demo_mode');
        await syncUserProfile(currentUser);
      } else {
        if (isDemoMode) {
          // Set demo profile
          setUserProfile({
            uid: DEMO_USER_ID,
            displayName: 'Guest Evaluator (Demo Mode)',
            email: 'demo@contactsphere.app',
            photoURL: null,
            theme: 'light',
            phoneFormat: 'INTERNATIONAL',
            customCategories: ['Emergency', 'Academic Project'],
          });
        } else {
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  const signInWithGoogle = async () => {
    try {
      setIsDemoMode(false);
      localStorage.removeItem('contactsphere_demo_mode');
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      setIsDemoMode(false);
      localStorage.removeItem('contactsphere_demo_mode');
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error('Email login error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      setIsDemoMode(false);
      localStorage.removeItem('contactsphere_demo_mode');
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name });
        await syncUserProfile(cred.user);
      }
    } catch (error) {
      console.error('Sign-up error:', error);
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfileData = async (updates: Partial<UserProfile>) => {
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
        setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    } else if (isDemoMode) {
      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const logout = async () => {
    setIsDemoMode(false);
    localStorage.removeItem('contactsphere_demo_mode');
    await fbSignOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const enterDemoMode = () => {
    setIsDemoMode(true);
    localStorage.setItem('contactsphere_demo_mode', 'true');
    setUserProfile({
      uid: DEMO_USER_ID,
      displayName: 'Guest Evaluator (Demo Mode)',
      email: 'demo@contactsphere.app',
      photoURL: null,
      theme: 'light',
      phoneFormat: 'INTERNATIONAL',
      customCategories: ['Emergency', 'Academic Project'],
    });
  };

  const exitDemoMode = () => {
    setIsDemoMode(false);
    localStorage.removeItem('contactsphere_demo_mode');
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isDemoMode,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        updateUserProfileData,
        logout,
        enterDemoMode,
        exitDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
