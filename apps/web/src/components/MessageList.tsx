'use client';

import { Message } from '@/hooks/useMessages';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  error: Error | null;
}

export function MessageList({ messages, loading, error }: MessageListProps) {
  const formatTime = (date: Date | undefined) => {
    if (!date) return '';
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div style={{ padding: '20px', color: '#888', textAlign: 'center' }}>Loading messages...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: '#f55', textAlign: 'center' }}>Error loading messages</div>;
  }

  if (messages.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
        No replies yet. Be the first to contribute!
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {messages.map((message) => (
        <div
          key={message.id}
          style={{
            padding: '16px',
            background: '#0a0a0a',
            borderRadius: '8px',
            border: '1px solid #222',
          }}
        >
          {/* Author header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            {message.authorPhotoURL ? (
              <img
                src={message.authorPhotoURL}
                alt=""
                style={{ width: '36px', height: '36px', borderRadius: '50%' }}
              />
            ) : (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: '#888',
                }}
              >
                {message.authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 500, fontSize: '14px' }}>{message.authorName}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{formatTime(message.createdAt)}</div>
            </div>
          </div>

          {/* Message content - preserves paragraphs */}
          <div style={{ color: '#ccc', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {message.content}
          </div>
        </div>
      ))}
    </div>
  );
}
