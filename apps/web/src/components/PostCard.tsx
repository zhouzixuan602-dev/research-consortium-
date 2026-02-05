'use client';

import { Post } from '@/hooks/usePosts';

interface PostCardProps {
  post: Post;
  onClick: () => void;
}

export function PostCard({ post, onClick }: PostCardProps) {
  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <article
      onClick={onClick}
      style={{
        background: '#111',
        border: '1px solid #333',
        borderRadius: '12px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'border-color 0.2s, transform 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#8b5cf6';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#333';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', gap: '16px' }}>
        {/* Cover image */}
        {post.coverImageURL && (
          <div
            style={{
              width: '120px',
              height: '80px',
              borderRadius: '8px',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <img
              src={post.coverImageURL}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          <h3
            style={{
              margin: '0 0 8px 0',
              fontSize: '18px',
              fontWeight: 600,
              color: '#fff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {post.title}
          </h3>

          {/* Abstract */}
          <p
            style={{
              margin: '0 0 12px 0',
              fontSize: '14px',
              color: '#888',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: '1.4',
            }}
          >
            {post.abstract}
          </p>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {post.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '2px 8px',
                    background: '#222',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#8b5cf6',
                  }}
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 4 && (
                <span style={{ fontSize: '12px', color: '#666' }}>+{post.tags.length - 4}</span>
              )}
            </div>
          )}

          {/* Meta info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '12px',
              color: '#666',
            }}
          >
            {/* Author */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {post.authorPhotoURL ? (
                <img
                  src={post.authorPhotoURL}
                  alt=""
                  style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                />
              ) : (
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: '#888',
                  }}
                >
                  {post.authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <span>{post.authorName}</span>
            </div>

            {/* Date */}
            <span>{formatDate(post.createdAt)}</span>

            {/* Activity counts */}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
              <span title="Messages">{post.messageCount} replies</span>
              <span title="Interests">{post.interestCount} interests</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
