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
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;

    return date.toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
    });
  };

  // Get floor number (reversed order - newest is highest floor)
  const getFloorNumber = (index: number, total: number) => {
    return total - index;
  };

  if (loading) {
    return (
      <div className="message-list-loading">
        <div className="spinner-small"></div>
        <p>加载评论中...</p>
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
        <p>暂无评论</p>
        <span>来发表第一条评论吧！</span>
      </div>
    );
  }

  return (
    <div className="message-list" ref={listRef}>
      {messages.map((message, index) => {
        const floorNum = getFloorNumber(index, messages.length);

        return (
          <div key={message.id} className="message-item">
            <div className="message-left">
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
              <div className="floor-number">{floorNum}F</div>
            </div>

            <div className="message-content">
              <div className="message-header">
                <span className="message-author">{message.authorName}</span>
                <span className="message-time">{formatTime(message.createdAt)}</span>
              </div>
              <div className="message-text">{message.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
