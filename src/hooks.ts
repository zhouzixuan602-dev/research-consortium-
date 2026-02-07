import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from './db';
import { fireSpike, tokenize, decayAll, getTopNeurons } from './engine';
import type { Post, Message, User, Neuron, NetworkType, Interest } from './types';

/** Reactive list of posts, optionally filtered by network and search */
export function usePosts(network: NetworkType | null, search: string) {
  const [posts, setPosts] = useState<(Post & { author?: User })[]>([]);

  const refresh = useCallback(async () => {
    let query = db.posts.orderBy('createdAt').reverse();
    let all = await query.toArray();

    if (network) {
      all = all.filter((p) => p.network === network);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      all = all.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          p.content.toLowerCase().includes(s) ||
          p.tags.some((t) => t.includes(s))
      );
    }

    const users = await db.users.toArray();
    const userMap = new Map(users.map((u) => [u.id!, u]));
    const enriched = all.map((p) => ({ ...p, author: userMap.get(p.authorId) }));
    setPosts(enriched);
  }, [network, search]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { posts, refresh };
}

/** Messages for a given post */
export function useMessages(postId: number | null) {
  const [messages, setMessages] = useState<(Message & { author?: User })[]>([]);

  const refresh = useCallback(async () => {
    if (!postId) {
      setMessages([]);
      return;
    }
    const msgs = await db.messages.where('postId').equals(postId).toArray();
    const users = await db.users.toArray();
    const userMap = new Map(users.map((u) => [u.id!, u]));
    const enriched = msgs
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((m) => ({ ...m, author: userMap.get(m.authorId) }));
    setMessages(enriched);
  }, [postId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { messages, refresh };
}

/** All users */
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    db.users.toArray().then(setUsers);
  }, []);
  return users;
}

/** Current user (first user acts as "me") */
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    db.users.toArray().then((users) => {
      if (users.length > 0) setUser(users[0]);
    });
  }, []);
  return user;
}

/** Interests for a user */
export function useInterests(userId: number | null) {
  const [interests, setInterests] = useState<Interest[]>([]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const all = await db.interests.where('userId').equals(userId).toArray();
    setInterests(all);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleInterest = useCallback(
    async (tag: string) => {
      if (!userId) return;
      const existing = await db.interests
        .where('[userId+tag]')
        .equals([userId, tag])
        .first();

      if (existing) {
        existing.active = !existing.active;
        existing.strength = existing.active
          ? Math.min(1, existing.strength + 0.1)
          : Math.max(0, existing.strength - 0.1);
        existing.toggledAt = Date.now();
        await db.interests.put(existing);

        if (existing.active) {
          await fireSpike('interest', existing.id!, [tag], 'DMN', existing.strength);
        }
      } else {
        const id = await db.interests.add({
          userId,
          tag,
          active: true,
          strength: 0.3,
          toggledAt: Date.now(),
        });
        await fireSpike('interest', id, [tag], 'DMN', 0.3);
      }
      refresh();
    },
    [userId, refresh]
  );

  return { interests, toggleInterest, refresh };
}

/** Create a new post */
export function useCreatePost() {
  return useCallback(
    async (authorId: number, title: string, content: string, tags: string[], network: NetworkType) => {
      const now = Date.now();
      const id = await db.posts.add({
        authorId,
        title,
        content,
        tags,
        network,
        upvotes: 0,
        messageCount: 0,
        createdAt: now,
        updatedAt: now,
      });

      const tokens = [...new Set([...tokenize(title), ...tokenize(content), ...tags])];
      await fireSpike('post', id, tokens, network);

      return id;
    },
    []
  );
}

/** Create a new message on a post */
export function useCreateMessage() {
  return useCallback(async (postId: number, authorId: number, content: string) => {
    const post = await db.posts.get(postId);
    if (!post) return;

    const now = Date.now();
    const msgId = await db.messages.add({
      postId,
      authorId,
      content,
      upvotes: 0,
      createdAt: now,
    });

    await db.posts.update(postId, {
      messageCount: (post.messageCount || 0) + 1,
      updatedAt: now,
    });

    const tokens = [...new Set([...tokenize(content), ...post.tags])];
    await fireSpike('message', msgId, tokens, post.network, 0.7);

    return msgId;
  }, []);
}

/** Upvote a post */
export function useUpvotePost() {
  return useCallback(async (postId: number) => {
    const post = await db.posts.get(postId);
    if (!post) return;
    await db.posts.update(postId, { upvotes: (post.upvotes || 0) + 1 });
  }, []);
}

/** Upvote a message */
export function useUpvoteMessage() {
  return useCallback(async (messageId: number) => {
    const msg = await db.messages.get(messageId);
    if (!msg) return;
    await db.messages.update(messageId, { upvotes: (msg.upvotes || 0) + 1 });
  }, []);
}

/** Neurons with auto-decay */
export function useNeurons(network: NetworkType | null) {
  const [neurons, setNeurons] = useState<Neuron[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const refresh = useCallback(async () => {
    const top = await getTopNeurons(network, 12);
    setNeurons(top);
  }, [network]);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(async () => {
      await decayAll(0.02);
      refresh();
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [refresh]);

  return { neurons, refresh };
}
