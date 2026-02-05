'use client';

import { useState, useMemo } from 'react';
import { usePosts, SortMode } from '@/hooks/usePosts';
import { PostCard } from './PostCard';

interface FeedProps {
  onPostClick: (postId: string) => void;
}

export function Feed({ onPostClick }: FeedProps) {
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const { posts, loading, error } = usePosts(sortMode);

  // Client-side filtering by title/abstract/tags
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;

    const query = searchQuery.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.abstract.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [posts, searchQuery]);

  if (loading) {
    return <div style={{ padding: '24px', color: '#888' }}>Loading posts...</div>;
  }

  if (error) {
    return <div style={{ padding: '24px', color: '#f55' }}>Error: {error.message}</div>;
  }

  return (
    <div>
      {/* Search and Sort Controls */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        {/* Search box */}
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '10px 14px',
            background: '#111',
            border: '1px solid #333',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
          }}
        />

        {/* Sort buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setSortMode('newest')}
            style={{
              padding: '10px 16px',
              background: sortMode === 'newest' ? '#8b5cf6' : '#222',
              border: sortMode === 'newest' ? '1px solid #a78bfa' : '1px solid #333',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Newest
          </button>
          <button
            onClick={() => setSortMode('active')}
            style={{
              padding: '10px 16px',
              background: sortMode === 'active' ? '#8b5cf6' : '#222',
              border: sortMode === 'active' ? '1px solid #a78bfa' : '1px solid #333',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Most Active
          </button>
        </div>
      </div>

      {/* Posts list */}
      {filteredPosts.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: '#888' }}>
          {searchQuery ? 'No posts match your search.' : 'No posts yet. Be the first to post!'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} onClick={() => onPostClick(post.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
