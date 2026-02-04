'use client';

import { useAuth } from '@/contexts/AuthContext';
import { NeuronList } from '@/components/NeuronList';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <main style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', color: '#fff', background: '#000', minHeight: '100vh' }}>
      <header style={{ marginBottom: '24px', borderBottom: '1px solid #333', paddingBottom: '16px' }}>
        <h1 style={{ margin: 0 }}>Neural Web</h1>
        <p style={{ color: '#888', marginTop: '4px' }}>Biomimetic research collaboration platform</p>
      </header>

      {loading ? (
        <p>Loading...</p>
      ) : !user ? (
        <div>
          <p>Sign in to interact with the neural network.</p>
        </div>
      ) : (
        <div>
          <p style={{ marginBottom: '16px', color: '#888' }}>
            Signed in as: {user.email}
          </p>
          <NeuronList />
        </div>
      )}
    </main>
  );
}
