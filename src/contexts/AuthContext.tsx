import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  hasCompletedProfile: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (profileDoc.exists()) {
          setUserProfile(profileDoc.data() as UserProfile);
        } else {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    // Create initial profile document
    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      email: credential.user.email,
      displayName: '',
      photoURL: null,
      bio: '',
      institution: '',
      researchInterests: [],
      profileCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);

    // Check if profile exists, if not create one
    const profileDoc = await getDoc(doc(db, 'users', credential.user.uid));
    if (!profileDoc.exists()) {
      await setDoc(doc(db, 'users', credential.user.uid), {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: credential.user.displayName || '',
        photoURL: credential.user.photoURL,
        bio: '',
        institution: '',
        researchInterests: [],
        profileCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserProfile(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No authenticated user');

    const updatedData = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', user.uid), updatedData, { merge: true });

    // Refresh profile
    const profileDoc = await getDoc(doc(db, 'users', user.uid));
    if (profileDoc.exists()) {
      setUserProfile(profileDoc.data() as UserProfile);
    }
  };

  const hasCompletedProfile = userProfile?.profileCompleted ?? false;

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
    hasCompletedProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
