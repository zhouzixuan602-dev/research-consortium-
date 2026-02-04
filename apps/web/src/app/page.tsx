'use client';

import { useAuth } from '@/contexts/AuthContext';
import { NeuronList } from '@/components/NeuronList';
import { SpikePanel } from '@/components/SpikePanel';
import { SignIn } from '@/components/SignIn';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <main style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', color: '#fff', background: '#000', minHeight: '100vh' }}>
      <header style={{ marginBottom: '24px', borderBottom: '1px solid #333', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0 }}>Neural Web</h1>
          <p style={{ color: '#888', marginTop: '4px' }}>Biomimetic research collaboration platform</p>
        </div>
        {!loading && <SignIn />}
      </header>

      {loading ? (
        <p>Loading...</p>
      ) : !user ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <p style={{ color: '#888', marginBottom: '24px' }}>Sign in to interact with the neural network.</p>
        </div>
      ) : (
        <>
          <NeuronList />
          <SpikePanel />
        </>
      )}
    </main>
  );
}
