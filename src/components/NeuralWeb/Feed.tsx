import React, { useState } from 'react';
import { usePosts } from '../../hooks/usePosts';
import PostCard from './PostCard';
import PostModal from './PostModal';
import { Post } from '../../types';
import './Feed.css';

interface FeedProps {
  activeCategory: string;
}

export default function Feed({ activeCategory }: FeedProps) {
  const { posts, loading, error, hasMore, loadMore } = usePosts();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  // Filter posts by category (if not 'all')
  const filteredPosts = activeCategory === 'all'
    ? posts
    : posts.filter(post => {
        const tags = post.tags?.map(t => t.toLowerCase()) || [];
        const title = post.title.toLowerCase();
        const content = post.content.toLowerCase();

        switch (activeCategory) {
          case 'daily':
            return tags.some(t => ['daily', 'life', '日常', 'casual'].includes(t)) ||
                   title.includes('日常') || content.includes('日常');
          case 'research':
            return tags.some(t => ['research', 'study', '研究', 'science', 'paper'].includes(t)) ||
                   title.includes('研究') || content.includes('研究');
          case 'discussion':
            return tags.some(t => ['discussion', 'chat', '讨论', 'question', 'help'].includes(t)) ||
                   title.includes('讨论') || content.includes('讨论');
          default:
            return true;
        }
      });

  if (loading && posts.length === 0) {
    return (
      <div className="feed-container">
        <div className="feed-loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="feed-container">
        <div className="feed-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>重试</button>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-container">
      {filteredPosts.length === 0 ? (
        <div className="feed-empty">
          <div className="empty-icon">📭</div>
          <p>暂无内容</p>
          <span>来发布第一个帖子吧！</span>
        </div>
      ) : (
        <>
          <div className="feed-grid">
            {filteredPosts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => handlePostClick(post)}
                size={index % 5 === 0 ? 'large' : index % 3 === 0 ? 'medium' : 'small'}
              />
            ))}
          </div>

          {hasMore && (
            <div className="feed-load-more">
              <button onClick={loadMore} disabled={loading}>
                {loading ? '加载中...' : '加载更多'}
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
