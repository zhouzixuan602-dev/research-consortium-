import { useState } from 'react';
import type { Post, Message, User } from '../types';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface Props {
  post: Post & { author?: User };
  messages: (Message & { author?: User })[];
  onSendMessage: (content: string) => void;
  onUpvoteMessage: (id: number) => void;
}

export default function PostDetail({ post, messages, onSendMessage, onUpvoteMessage }: Props) {
  const [reply, setReply] = useState('');

  const handleSend = () => {
    const text = reply.trim();
    if (!text) return;
    onSendMessage(text);
    setReply('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="post-detail glass">
      <div className="feed-card-header" style={{ marginBottom: 0 }}>
        <div className="card-avatar">{post.author?.avatar || '?'}</div>
        <div className="card-meta">
          <span className="card-author">{post.author?.name || 'Unknown'}</span>
          <span className="card-time">{timeAgo(post.createdAt)}</span>
        </div>
        <span className={`card-network-badge ${post.network.toLowerCase()}`}>
          {post.network}
        </span>
      </div>

      <h2>{post.title}</h2>
      <div className="detail-content">{post.content}</div>

      <div className="detail-meta">
        <span>&#x25B2;&#xFE0E; {post.upvotes} upvotes</span>
        <span>&#x1F4AC;&#xFE0E; {messages.length} messages</span>
        <div className="card-tags" style={{ marginLeft: 'auto' }}>
          {post.tags.map((t) => (
            <span key={t} className="card-tag">{t}</span>
          ))}
        </div>
      </div>

      <div className="messages-section">
        <h4>Messages ({messages.length})</h4>

        {messages.map((msg) => (
          <div key={msg.id} className="message-item">
            <div className="message-avatar">{msg.author?.avatar || '?'}</div>
            <div className="message-body">
              <div className="message-author">{msg.author?.name || 'Unknown'}</div>
              <div className="message-text">{msg.content}</div>
              <div className="message-footer">
                <button
                  className="btn-icon"
                  style={{ width: 'auto', height: 'auto', fontSize: '0.75rem' }}
                  onClick={() => onUpvoteMessage(msg.id!)}
                >
                  &#x25B2;&#xFE0E; {msg.upvotes}
                </button>
                <span>{timeAgo(msg.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}

        <div className="reply-box">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a reply..."
            rows={2}
          />
          <button className="btn btn-primary btn-sm" onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
