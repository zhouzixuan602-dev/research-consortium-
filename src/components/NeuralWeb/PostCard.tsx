import React from 'react';
import { Post } from '../../types';
import { useInterest } from '../../hooks/useInterest';
import { useAuth } from '../../contexts/AuthContext';
import './PostCard.css';

interface PostCardProps {
  post: Post;
  onClick: () => void;
  size?: 'small' | 'medium' | 'large';
}

// Generate a consistent color based on post title
const getGradientColor = (title: string) => {
  const colors = [
    ['#ff4757', '#ff6b7a'],
    ['#2ed573', '#7bed9f'],
    ['#1e90ff', '#70a1ff'],
    ['#ffa502', '#ffcc00'],
    ['#a55eea', '#d980fa'],
    ['#ff6348', '#ff7f50'],
    ['#3742fa', '#5352ed'],
    ['#20bf6b', '#26de81'],
  ];
  const index = title.length % colors.length;
  return colors[index];
};

// Generate placeholder image URL based on post content
const getPlaceholderImage = (post: Post) => {
  // If post has an image URL, use it
  if (post.imageURL) return post.imageURL;

  // Use author photo as a fallback visual
  if (post.authorPhotoURL) return null;

  return null;
};

export default function PostCard({ post, onClick, size = 'small' }: PostCardProps) {
  const { isInterested, toggling, toggleInterest } = useInterest(post.id);
  const { user, hasCompletedProfile } = useAuth();
  const gradient = getGradientColor(post.title);
  const imageUrl = getPlaceholderImage(post);

  const handleInterestClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      alert('请先登录');
      return;
    }

    if (!hasCompletedProfile) {
      alert('请先完善个人资料');
      return;
    }

    toggleInterest();
  };

  const viewCount = (post.messageCount || 0) + (post.interestCount || 0) * 3;

  return (
    <article
      className={`post-card post-card-${size}`}
      onClick={onClick}
      style={{
        background: imageUrl
          ? `linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.9)), url(${imageUrl}) center/cover`
          : `linear-gradient(135deg, ${gradient[0]}22 0%, ${gradient[1]}11 100%)`
      }}
    >
      <div className="post-card-inner">
        {/* View count badge */}
        <div className="post-view-count">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
          <span>{viewCount}</span>
        </div>

        {/* Avatar button */}
        <button
          className={`post-avatar-btn ${isInterested ? 'interested' : ''}`}
          onClick={handleInterestClick}
          disabled={toggling}
        >
          {post.authorPhotoURL ? (
            <img src={post.authorPhotoURL} alt={post.authorName} className="post-avatar" />
          ) : (
            <div className="post-avatar-placeholder" style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}>
              {post.authorName.charAt(0).toUpperCase()}
            </div>
          )}
          {isInterested && <span className="interest-dot"></span>}
        </button>

        {/* Content overlay */}
        <div className="post-content-overlay">
          {post.tags && post.tags.length > 0 && (
            <div className="post-tag-badge" style={{ background: gradient[0] }}>
              {post.tags[0]}
            </div>
          )}
          <h3 className="post-title">{post.title}</h3>
          <p className="post-excerpt">
            {post.content.length > 60 ? `${post.content.substring(0, 60)}...` : post.content}
          </p>
        </div>

        {/* Stats bar */}
        <div className="post-stats-bar">
          <span className="post-author-name">{post.authorName}</span>
          <div className="post-stats">
            <span className="post-stat">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
              </svg>
              {post.messageCount || 0}
            </span>
            <span className="post-stat">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              {post.interestCount || 0}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
