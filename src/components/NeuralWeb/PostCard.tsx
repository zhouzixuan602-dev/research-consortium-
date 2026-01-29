import React from 'react';
import { Post } from '../../types';
import { useInterest } from '../../hooks/useInterest';
import { useAuth } from '../../contexts/AuthContext';
import './PostCard.css';

interface PostCardProps {
  post: Post;
  onClick: () => void;
}

export default function PostCard({ post, onClick }: PostCardProps) {
  const { isInterested, toggling, toggleInterest } = useInterest(post.id);
  const { user, hasCompletedProfile } = useAuth();

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      alert('Please sign in to express interest.');
      return;
    }

    if (!hasCompletedProfile) {
      alert('Please complete your profile to express interest.');
      return;
    }

    toggleInterest();
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <article className="post-card" onClick={onClick}>
      <div className="post-card-header">
        <button
          className={`post-avatar-btn ${isInterested ? 'interested' : ''}`}
          onClick={handleAvatarClick}
          disabled={toggling}
          title={isInterested ? 'Remove interest' : 'Express interest'}
        >
          {post.authorPhotoURL ? (
            <img
              src={post.authorPhotoURL}
              alt={post.authorName}
              className="post-avatar"
            />
          ) : (
            <div className="post-avatar-placeholder">
              {post.authorName.charAt(0).toUpperCase()}
            </div>
          )}
          {isInterested && <span className="interest-indicator">★</span>}
        </button>
        <div className="post-meta">
          <span className="post-author">{post.authorName}</span>
          <span className="post-date">{formatDate(post.createdAt)}</span>
        </div>
      </div>

      <h3 className="post-title">{post.title}</h3>

      <p className="post-excerpt">
        {post.content.length > 150
          ? `${post.content.substring(0, 150)}...`
          : post.content}
      </p>

      {post.tags && post.tags.length > 0 && (
        <div className="post-tags">
          {post.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="post-tag">
              {tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="post-tag-more">+{post.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className="post-stats">
        <span className="post-stat">
          <span className="stat-icon">💬</span>
          {post.messageCount || 0}
        </span>
        <span className="post-stat">
          <span className="stat-icon">★</span>
          {post.interestCount || 0}
        </span>
      </div>
    </article>
  );
}
