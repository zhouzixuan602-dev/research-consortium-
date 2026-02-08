import { useState } from 'react';
import type { NetworkType } from '../types';

interface Props {
  onSubmit: (title: string, content: string, tags: string[], network: NetworkType) => void;
  onClose: () => void;
}

const NETWORK_OPTIONS: NetworkType[] = ['DMN', 'ECN', 'PFC'];

export default function NewPostModal({ onSubmit, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [network, setNetwork] = useState<NetworkType>('DMN');

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    onSubmit(title.trim(), content.trim(), tags, network);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>New Post</h2>

        <div className="form-row">
          <label className="form-label">Title</label>
          <input
            type="text"
            placeholder="What's your question or topic?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div className="form-row">
          <label className="form-label">Content</label>
          <textarea
            placeholder="Share your thoughts in detail..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
          />
        </div>

        <div className="form-row">
          <label className="form-label">Tags (comma-separated)</label>
          <input
            type="text"
            placeholder="ai, neuroscience, learning"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="form-label">Network</label>
          <div className="network-select">
            {NETWORK_OPTIONS.map((n) => (
              <button
                key={n}
                className={`network-option ${network === n ? 'selected' : ''}`}
                onClick={() => setNetwork(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim()}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
