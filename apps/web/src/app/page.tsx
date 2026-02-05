'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SignIn } from '@/components/SignIn';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Feed } from '@/components/Feed';
import { PostModal } from '@/components/PostModal';

export default function Home() {
  const { user, loading } = useAuth();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
  };

  const handleCloseModal = () => {
    setSelectedPostId(null);
  };

  return (
    <main style={{ padding: '24px', maxWidth: '900px', margin: '0 auto', color: '#fff', background: '#000', minHeight: '100vh' }}>
      <header style={{ marginBottom: '24px', borderBottom: '1px solid #333', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0 }}>Neural Web</h1>
          <p style={{ color: '#888', marginTop: '4px' }}>Biomimetic research collaboration platform</p>
        </div>
        {!loading && <SignIn />}
      </header>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ErrorBoundary>
          {/* Feed is public - anyone can browse */}
          <Feed onPostClick={handlePostClick} />

          {/* Post detail modal */}
          {selectedPostId && (
            <PostModal
              postId={selectedPostId}
              onClose={handleCloseModal}
              isAuthenticated={!!user}
            />
          )}
        </ErrorBoundary>
      )}
    </main>
  );
}
