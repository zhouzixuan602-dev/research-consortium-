import type { Post, User } from '../types';
import type { SortMode } from '../hooks';

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

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'most_discussed', label: 'Most Discussed' },
  { value: 'most_upvoted', label: 'Most Upvoted' },
];

interface Props {
  posts: (Post & { author?: User })[];
  selectedPostId: number | null;
  onSelectPost: (id: number) => void;
  onNewPost: () => void;
  onUpvote: (id: number) => void;
  sortMode: SortMode;
  onSortChange: (s: SortMode) => void;
}

export default function FeedCenter({
  posts,
  selectedPostId,
  onSelectPost,
  onNewPost,
  onUpvote,
  sortMode,
  onSortChange,
}: Props) {
  return (
    <section className="feed-center">
      <div className="feed-header">
        <h2>Feed</h2>
        <div className="feed-controls">
          <select
            className="sort-select"
            value={sortMode}
            onChange={(e) => onSortChange(e.target.value as SortMode)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button className="btn btn-primary btn-sm" onClick={onNewPost}>
            + New Post
          </button>
        </div>
      </div>

      {posts.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">&#x1F4AD;&#xFE0E;</div>
          <p>No posts match your filters.</p>
        </div>
      )}

      {posts.map((post) => (
        <article
          key={post.id}
          className={`feed-card glass ${selectedPostId === post.id ? 'selected' : ''}`}
          onClick={() => onSelectPost(post.id!)}
        >
          <div className="feed-card-header">
            <div className="card-avatar">{post.author?.avatar || '?'}</div>
            <div className="card-meta">
              <span className="card-author">{post.author?.name || 'Unknown'}</span>
              <span className="card-time">{timeAgo(post.createdAt)}</span>
            </div>
            <span className={`card-network-badge ${post.network.toLowerCase()}`}>
              {post.network}
            </span>
          </div>

          <h3>{post.title}</h3>
          <p>{post.content}</p>

          <div className="card-footer">
            <button
              className="card-stat btn-icon"
              style={{ width: 'auto', height: 'auto', gap: '4px', display: 'flex', alignItems: 'center' }}
              onClick={(e) => {
                e.stopPropagation();
                onUpvote(post.id!);
              }}
            >
              &#x25B2;&#xFE0E; {post.upvotes}
            </button>
            <span className="card-stat">&#x1F4AC;&#xFE0E; {post.messageCount}</span>
            <div className="card-tags">
              {post.tags.map((t) => (
                <span key={t} className="card-tag">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
