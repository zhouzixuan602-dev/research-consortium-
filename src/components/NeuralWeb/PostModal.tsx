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

export default function PostModal({ post, onClose }: PostModalProps) {
  const { messages, loading, error, sending, sendMessage } = useMessages(post.id);
  const { isInterested, toggling, toggleInterest } = useInterest(post.id);
  const { user, hasCompletedProfile } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

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

  const handleAvatarClick = () => {
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
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" ref={modalRef}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          ×
        </button>

        <div className="modal-content">
          <header className="modal-header">
            <div className="modal-author">
              <button
                className={`modal-avatar-btn ${isInterested ? 'interested' : ''}`}
                onClick={handleAvatarClick}
                disabled={toggling}
                title={isInterested ? 'Remove interest' : 'Express interest (click avatar)'}
              >
                {post.authorPhotoURL ? (
                  <img
                    src={post.authorPhotoURL}
                    alt={post.authorName}
                    className="modal-avatar"
                  />
                ) : (
                  <div className="modal-avatar-placeholder">
                    {post.authorName.charAt(0).toUpperCase()}
                  </div>
                )}
                {isInterested && <span className="interest-badge">★ Interested</span>}
              </button>
              <div className="modal-author-info">
                <span className="modal-author-name">{post.authorName}</span>
                <span className="modal-post-date">{formatDate(post.createdAt)}</span>
              </div>
            </div>

            <div className="modal-stats">
              <span className="modal-stat">
                💬 {post.messageCount || 0} messages
              </span>
              <span className="modal-stat">
                ★ {post.interestCount || 0} interested
              </span>
            </div>
          </header>

          <article className="modal-post">
            <h2 className="modal-title">{post.title}</h2>
            <div className="modal-body">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="modal-tags">
                {post.tags.map((tag, index) => (
                  <span key={index} className="modal-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>

          <section className="modal-discussion">
            <h3>Discussion</h3>
            <MessageList messages={messages} loading={loading} error={error} />
            <MessageInput onSend={sendMessage} sending={sending} />
          </section>
        </div>
      </div>
    </div>
  );
}
