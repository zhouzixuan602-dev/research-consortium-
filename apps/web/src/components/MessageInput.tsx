'use client';

import { useState } from 'react';

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  isAuthenticated: boolean;
}

export function MessageInput({ onSend, isAuthenticated }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    setError(null);

    try {
      await onSend(content);
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        style={{
          padding: '20px',
          background: '#0a0a0a',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#888',
          border: '1px solid #222',
        }}
      >
        <p style={{ margin: '0 0 8px 0' }}>Sign in to join the discussion</p>
        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
          You can read all messages without signing in
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          background: '#0a0a0a',
          borderRadius: '8px',
          border: '1px solid #222',
          overflow: 'hidden',
        }}
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your reply..."
          disabled={sending}
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '16px',
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '14px',
            lineHeight: 1.6,
            resize: 'vertical',
            outline: 'none',
          }}
        />

        {error && (
          <div style={{ padding: '0 16px 12px', color: '#f55', fontSize: '13px' }}>{error}</div>
        )}

        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid #222',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '12px', color: '#666' }}>
            Plain text only. Press Enter for new paragraph.
          </span>
          <button
            type="submit"
            disabled={sending || !content.trim()}
            style={{
              padding: '8px 20px',
              background: content.trim() && !sending ? '#8b5cf6' : '#333',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '14px',
              cursor: content.trim() && !sending ? 'pointer' : 'not-allowed',
            }}
          >
            {sending ? 'Sending...' : 'Reply'}
          </button>
        </div>
      </div>
    </form>
  );
}
