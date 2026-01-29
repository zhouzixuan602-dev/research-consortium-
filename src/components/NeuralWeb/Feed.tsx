import React, { useState } from 'react';
import { usePosts } from '../../hooks/usePosts';
import PostCard from './PostCard';
import PostModal from './PostModal';
import { Post } from '../../types';
import './Feed.css';

export default function Feed() {
  const { posts, loading, error, hasMore, loadMore } = usePosts();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="feed-container">
        <div className="feed-loading">
          <div className="spinner"></div>
          <p>Loading Neural Web...</p>
        </div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="feed-container">
        <div className="feed-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <header className="feed-header">
        <h1>Neural Web</h1>
        <p>Discover and connect with research across disciplines</p>
      </header>

      {posts.length === 0 ? (
        <div className="feed-empty">
          <p>No posts yet. Be the first to share your research!</p>
        </div>
      ) : (
        <>
          <div className="feed-grid">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => handlePostClick(post)}
              />
            ))}
          </div>

          {hasMore && (
            <div className="feed-load-more">
              <button onClick={loadMore} disabled={loading}>
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}

      {selectedPost && (
        <PostModal post={selectedPost} onClose={handleCloseModal} />
      )}
    </div>
  );
}
