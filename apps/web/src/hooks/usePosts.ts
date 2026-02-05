'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  limit,
  OrderByDirection,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  title: string;
  abstract: string;
  coverImageURL?: string;
  tags: string[];
  messageCount: number;
  interestCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}

export type SortMode = 'newest' | 'active';

export function usePosts(sortMode: SortMode = 'newest', maxPosts = 50) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const sortField = sortMode === 'newest' ? 'createdAt' : 'lastActivityAt';
    const q = query(
      collection(db, 'posts'),
      orderBy(sortField, 'desc' as OrderByDirection),
      limit(maxPosts)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const postList: Post[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            authorId: data.authorId,
            authorName: data.authorName,
            authorPhotoURL: data.authorPhotoURL,
            title: data.title,
            abstract: data.abstract,
            coverImageURL: data.coverImageURL,
            tags: data.tags || [],
            messageCount: data.messageCount || 0,
            interestCount: data.interestCount || 0,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            lastActivityAt: data.lastActivityAt?.toDate(),
          };
        });
        setPosts(postList);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sortMode, maxPosts]);

  const createPost = async (
    title: string,
    abstract: string,
    tags: string[],
    coverImageURL?: string
  ): Promise<string> => {
    if (!user) throw new Error('Must be logged in to create post');

    const docRef = await addDoc(collection(db, 'posts'), {
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous',
      authorPhotoURL: user.photoURL || null,
      title,
      abstract,
      coverImageURL: coverImageURL || null,
      tags,
      messageCount: 0,
      interestCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    });
    return docRef.id;
  };

  return { posts, loading, error, createPost };
}
