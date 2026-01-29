import React, { useEffect, useRef } from 'react';
import { Message } from '../../types';
import './MessageList.css';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

export default function MessageList({ messages, loading, error }: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(messages.length);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (listRef.current && messages.length > prevLengthRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
    prevLengthRef.current = messages.length;
  }, [messages.length]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="message-list-loading">
        <div className="spinner-small"></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="message-list-error">
        <p>{error}</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="message-list-empty">
        <p>No messages yet. Start the discussion!</p>
      </div>
    );
  }

  return (
    <div className="message-list" ref={listRef}>
      {messages.map((message, index) => {
        // Check if we need to show a date separator
        const showDateSeparator =
          index === 0 ||
          (message.createdAt &&
            messages[index - 1].createdAt &&
            formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt));

        return (
          <React.Fragment key={message.id}>
            {showDateSeparator && (
              <div className="message-date-separator">
                <span>{formatDate(message.createdAt)}</span>
              </div>
            )}
            <div className="message-item">
              <div className="message-avatar">
                {message.authorPhotoURL ? (
                  <img
                    src={message.authorPhotoURL}
                    alt={message.authorName}
                    className="message-avatar-img"
                  />
                ) : (
                  <div className="message-avatar-placeholder">
                    {message.authorName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-author">{message.authorName}</span>
                  <span className="message-time">{formatTime(message.createdAt)}</span>
                </div>
                <div className="message-text">{message.content}</div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
