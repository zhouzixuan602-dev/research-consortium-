import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from './db';
import { fireSpike, tokenize, decayAll, getTopNeurons } from './engine';
import type { Post, Message, User, Neuron, NetworkType, Interest } from './types';

export type SortMode = 'newest' | 'oldest' | 'most_discussed' | 'most_upvoted';

/** Reactive list of posts with filtering and sorting */
export function usePosts(
  network: NetworkType | null,
  search: string,
  sortMode: SortMode,
  filterTags: string[]
) {
  const [posts, setPosts] = useState<(Post & { author?: User })[]>([]);

  const refresh = useCallback(async () => {
    let all = await db.posts.toArray();

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
    if (filterTags.length > 0) {
      all = all.filter((p) => p.tags.some((t) => filterTags.includes(t)));
    }

    switch (sortMode) {
      case 'newest':
        all.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'oldest':
        all.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'most_discussed':
        all.sort((a, b) => b.messageCount - a.messageCount);
        break;
      case 'most_upvoted':
        all.sort((a, b) => b.upvotes - a.upvotes);
        break;
    }

    const users = await db.users.toArray();
    const userMap = new Map(users.map((u) => [u.id!, u]));
    const enriched = all.map((p) => ({ ...p, author: userMap.get(p.authorId) }));
    setPosts(enriched);
  }, [network, search, sortMode, filterTags]);

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
  const refresh = useCallback(async () => {
    const all = await db.users.toArray();
    setUsers(all);
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  return { users, refresh };
}

/** Current user from localStorage with login/register/logout */
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const storedId = localStorage.getItem('neurozhihu_user_id');
    if (storedId) {
      const u = await db.users.get(Number(storedId));
      if (u) {
        setUser(u);
        setLoading(false);
        return;
      }
    }
    setUser(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (userId: number) => {
    const u = await db.users.get(userId);
    if (u) {
      localStorage.setItem('neurozhihu_user_id', String(userId));
      setUser(u);
    }
  }, []);

  const register = useCallback(async (name: string, initials: string, bio: string) => {
    const id = await db.users.add({
      name,
      avatar: initials.toUpperCase().slice(0, 2),
      bio,
      interests: [],
      createdAt: Date.now(),
    });
    localStorage.setItem('neurozhihu_user_id', String(id));
    const u = await db.users.get(id);
    if (u) setUser(u);
    return id;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('neurozhihu_user_id');
    setUser(null);
  }, []);

  return { user, loading, login, register, logout, reload: loadUser };
}

/** Interests for a user */
export function useInterests(userId: number | null) {
  const [interests, setInterests] = useState<Interest[]>([]);

  const refresh = useCallback(async () => {
    if (!userId) {
      setInterests([]);
      return;
    }
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
