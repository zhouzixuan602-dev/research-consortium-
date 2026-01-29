import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
  startAfter,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Post } from '../types';

const POSTS_PER_PAGE = 20;

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const postsQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(POSTS_PER_PAGE)
    );

    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const postsData: Post[] = [];
        snapshot.forEach((doc) => {
          postsData.push({
            id: doc.id,
            ...doc.data(),
          } as Post);
        });

        setPosts(postsData);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === POSTS_PER_PAGE);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const loadMore = async () => {
    if (!lastDoc || !hasMore) return;

    const nextQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(POSTS_PER_PAGE)
    );

    const unsubscribe = onSnapshot(
      nextQuery,
      (snapshot) => {
        const newPosts: Post[] = [];
        snapshot.forEach((doc) => {
          newPosts.push({
            id: doc.id,
            ...doc.data(),
          } as Post);
        });

        setPosts((prev) => [...prev, ...newPosts]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === POSTS_PER_PAGE);
      },
      (err) => {
        console.error('Error loading more posts:', err);
        setError('Failed to load more posts.');
      }
    );

    // Note: In production, manage this subscription properly
    return () => unsubscribe();
  };

  return { posts, loading, error, hasMore, loadMore };
}
