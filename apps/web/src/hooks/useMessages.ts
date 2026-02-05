'use client';

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
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface Message {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  createdAt: Date;
}

export function useMessages(postId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!postId) return;

    const q = query(
      collection(db, 'posts', postId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messageList: Message[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            postId,
            authorId: data.authorId,
            authorName: data.authorName,
            authorPhotoURL: data.authorPhotoURL,
            content: data.content,
            createdAt: data.createdAt?.toDate(),
          };
        });
        setMessages(messageList);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [postId]);

  const sendMessage = async (content: string): Promise<string> => {
    if (!user) throw new Error('Must be logged in to send message');
    if (!content.trim()) throw new Error('Message cannot be empty');

    // Add message to subcollection
    const messagesRef = collection(db, 'posts', postId, 'messages');
    const docRef = await addDoc(messagesRef, {
      postId,
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous',
      authorPhotoURL: user.photoURL || null,
      content: content.trim(),
      createdAt: serverTimestamp(),
    });

    // Update post's messageCount and lastActivityAt
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      messageCount: increment(1),
      lastActivityAt: serverTimestamp(),
    });

    return docRef.id;
  };

  return { messages, loading, error, sendMessage };
}
