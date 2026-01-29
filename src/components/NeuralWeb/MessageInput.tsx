import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './MessageInput.css';

interface MessageInputProps {
  onSend: (content: string) => Promise<boolean>;
  sending: boolean;
}

export default function MessageInput({ onSend, sending }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user, hasCompletedProfile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Please sign in to send messages.');
      return;
    }

    if (!hasCompletedProfile) {
      setError('Please complete your profile before sending messages.');
      return;
    }

    if (!content.trim()) {
      setError('Message cannot be empty.');
      return;
    }

    const success = await onSend(content);
    if (success) {
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!user) {
    return (
      <div className="message-input-auth-required">
        <p>Sign in to join the discussion</p>
      </div>
    );
  }

  if (!hasCompletedProfile) {
    return (
      <div className="message-input-profile-required">
        <p>Complete your profile to join the discussion</p>
      </div>
    );
  }

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      {error && <div className="message-input-error">{error}</div>}
      <div className="message-input-container">
        <textarea
          className="message-input-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          disabled={sending}
          rows={2}
        />
        <button
          type="submit"
          className="message-input-submit"
          disabled={sending || !content.trim()}
        >
          {sending ? '...' : 'Send'}
        </button>
      </div>
    </form>
  );
}
