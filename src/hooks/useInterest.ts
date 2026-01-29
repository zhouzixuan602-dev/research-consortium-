import { useState, useEffect } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export function useInterest(postId: string) {
  const [isInterested, setIsInterested] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, userProfile, hasCompletedProfile } = useAuth();

  useEffect(() => {
    if (!postId || !user) {
      setIsInterested(false);
      setLoading(false);
      return;
    }

    const checkInterest = async () => {
      setLoading(true);
      try {
        const interestDoc = await getDoc(
          doc(db, 'posts', postId, 'interests', user.uid)
        );
        setIsInterested(interestDoc.exists());
      } catch (err) {
        console.error('Error checking interest:', err);
      }
      setLoading(false);
    };

    checkInterest();
  }, [postId, user]);

  const toggleInterest = async (): Promise<boolean> => {
    if (!user) {
      setError('You must be signed in to express interest.');
      return false;
    }

    if (!hasCompletedProfile || !userProfile) {
      setError('Please complete your profile first.');
      return false;
    }

    setToggling(true);
    setError(null);

    try {
      const interestRef = doc(db, 'posts', postId, 'interests', user.uid);
      const postRef = doc(db, 'posts', postId);

      if (isInterested) {
        // Remove interest
        await deleteDoc(interestRef);
        await updateDoc(postRef, {
          interestCount: increment(-1),
        });
        setIsInterested(false);
      } else {
        // Add interest
        await setDoc(interestRef, {
          postId,
          userId: user.uid,
          userName: userProfile.displayName,
          userPhotoURL: userProfile.photoURL,
          createdAt: serverTimestamp(),
        });
        await updateDoc(postRef, {
          interestCount: increment(1),
        });
        setIsInterested(true);
      }

      setToggling(false);
      return true;
    } catch (err) {
      console.error('Error toggling interest:', err);
      setError('Failed to update interest. Please try again.');
      setToggling(false);
      return false;
    }
  };

  return { isInterested, loading, toggling, error, toggleInterest };
}
