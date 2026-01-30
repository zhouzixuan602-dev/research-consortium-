import React, { useEffect, useRef } from 'react';
import { Post } from '../../types';
import { useMessages } from '../../hooks/useMessages';
import { useInterest } from '../../hooks/useInterest';
import { useAuth } from '../../contexts/AuthContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './PostModal.css';

interface PostModalProps {
  post: Post;
  onClose: () => void;
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

export default function PostModal({ post, onClose }: PostModalProps) {
  const { messages, loading, error, sending, sendMessage } = useMessages(post.id);
  const { isInterested, toggling, toggleInterest } = useInterest(post.id);
  const { user, hasCompletedProfile } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const gradient = getGradientColor(post.title);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleInterestClick = () => {
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
    <div className="modal-overlay">
      <div className="modal-container" ref={modalRef}>
        {/* Header image area */}
        <div
          className="modal-header-image"
          style={{
            background: post.imageURL
              ? `linear-gradient(to bottom, transparent 50%, var(--color-bg-secondary)), url(${post.imageURL}) center/cover`
              : `linear-gradient(135deg, ${gradient[0]}44 0%, ${gradient[1]}22 100%)`
          }}
        >
          <div className="modal-header-overlay">
            <div className="modal-header-stats">
              <span className="modal-view-count">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                {viewCount}
              </span>
            </div>

            {/* Avatar and interest button */}
            <button
              className={`modal-avatar-btn ${isInterested ? 'interested' : ''}`}
              onClick={handleInterestClick}
              disabled={toggling}
            >
              {post.authorPhotoURL ? (
                <img src={post.authorPhotoURL} alt={post.authorName} className="modal-avatar" />
              ) : (
                <div className="modal-avatar-placeholder" style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}>
                  {post.authorName.charAt(0).toUpperCase()}
                </div>
              )}
              {isInterested && (
                <span className="interest-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Close button */}
        <button className="modal-close" onClick={onClose} aria-label="关闭">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        {/* Content area */}
        <div className="modal-content">
          {/* Post info */}
          <div className="modal-post-info">
            <div className="modal-author-row">
              <span className="modal-author-name">{post.authorName}</span>
              <span className="modal-author-badge">楼主</span>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="modal-tags">
                {post.tags.map((tag, index) => (
                  <span key={index} className="modal-tag" style={{ background: `${gradient[0]}33`, color: gradient[0] }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h2 className="modal-title">{post.title}</h2>
            <div className="modal-body">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="modal-post-stats">
              <span className="modal-stat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
                </svg>
                {post.messageCount || 0} 评论
              </span>
              <span className="modal-stat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                {post.interestCount || 0} 关注
              </span>
            </div>
          </div>

          {/* Discussion section */}
          <section className="modal-discussion">
            <div className="discussion-header">
              <h3>评论区</h3>
              <span className="comment-count">{messages.length} 条评论</span>
            </div>
            <MessageList messages={messages} loading={loading} error={error} />
            <MessageInput onSend={sendMessage} sending={sending} />
          </section>
        </div>
      </div>
    </div>
  );
}
