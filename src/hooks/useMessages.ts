import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Message } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useMessages(postId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const { user, userProfile, hasCompletedProfile } = useAuth();

  useEffect(() => {
    if (!postId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const messagesQuery = query(
      collection(db, 'posts', postId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messagesData: Message[] = [];
        snapshot.forEach((doc) => {
          messagesData.push({
            id: doc.id,
            ...doc.data(),
          } as Message);
        });

        setMessages(messagesData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Please try again.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [postId]);

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!user) {
      setError('You must be signed in to send messages.');
      return false;
    }

    if (!hasCompletedProfile || !userProfile) {
      setError('Please complete your profile before sending messages.');
      return false;
    }

    if (!content.trim()) {
      setError('Message cannot be empty.');
      return false;
    }

    setSending(true);
    setError(null);

    try {
      // Add the message
      await addDoc(collection(db, 'posts', postId, 'messages'), {
        postId,
        authorId: user.uid,
        authorName: userProfile.displayName,
        authorPhotoURL: userProfile.photoURL,
        content: content.trim(),
        createdAt: serverTimestamp(),
      });

      // Increment message count on the post
      await updateDoc(doc(db, 'posts', postId), {
        messageCount: increment(1),
      });

      setSending(false);
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      setSending(false);
      return false;
    }
  };

  return { messages, loading, error, sending, sendMessage };
}
