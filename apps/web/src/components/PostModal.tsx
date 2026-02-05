'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post } from '@/hooks/usePosts';
import { useMessages } from '@/hooks/useMessages';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface PostModalProps {
  postId: string;
  onClose: () => void;
  isAuthenticated: boolean;
}

export function PostModal({ postId, onClose, isAuthenticated }: PostModalProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { messages, loading: messagesLoading, error: messagesError, sendMessage } = useMessages(postId);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'posts', postId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setPost({
            id: snapshot.id,
            authorId: data.authorId,
            authorName: data.authorName,
            authorPhotoURL: data.authorPhotoURL,
            title: data.title,
            abstract: data.abstract,
            coverImageURL: data.coverImageURL,
            tags: data.tags || [],
            messageCount: data.messageCount || 0,
            interestCount: data.interestCount || 0,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            lastActivityAt: data.lastActivityAt?.toDate(),
          });
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [postId]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#111',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '700px',
          maxHeight: '90vh',
          overflow: 'auto',
          border: '1px solid #333',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            background: '#111',
            zIndex: 10,
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px' }}>Post Detail</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0 8px',
            }}
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {loading ? (
            <p style={{ color: '#888' }}>Loading...</p>
          ) : !post ? (
            <p style={{ color: '#f55' }}>Post not found</p>
          ) : (
            <>
              {/* Post header */}
              <h1 style={{ margin: '0 0 12px 0', fontSize: '24px' }}>{post.title}</h1>

              {/* Author info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                {post.authorPhotoURL ? (
                  <img
                    src={post.authorPhotoURL}
                    alt=""
                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#333',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                    }}
                  >
                    {post.authorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 500 }}>{post.authorName}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {post.createdAt?.toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Cover image */}
              {post.coverImageURL && (
                <img
                  src={post.coverImageURL}
                  alt=""
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    marginBottom: '16px',
                  }}
                />
              )}

              {/* Abstract */}
              <p style={{ color: '#ccc', lineHeight: 1.6, marginBottom: '16px' }}>{post.abstract}</p>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: '4px 12px',
                        background: '#222',
                        borderRadius: '16px',
                        fontSize: '13px',
                        color: '#8b5cf6',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  padding: '16px 0',
                  borderTop: '1px solid #333',
                  borderBottom: '1px solid #333',
                  marginBottom: '24px',
                  color: '#888',
                  fontSize: '14px',
                }}
              >
                <span>{post.messageCount} replies</span>
                <span>{post.interestCount} interests</span>
              </div>

              {/* Discussion thread section */}
              <div>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#ccc' }}>
                  Discussion ({messages.length})
                </h3>

                {/* Messages list */}
                <div style={{ marginBottom: '20px' }}>
                  <MessageList messages={messages} loading={messagesLoading} error={messagesError} />
                </div>

                {/* Message input */}
                <MessageInput onSend={handleSendMessage} isAuthenticated={isAuthenticated} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
