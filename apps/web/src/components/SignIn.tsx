'use client';

import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const googleProvider = new GoogleAuthProvider();

export function SignIn() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <button
        onClick={handleSignOut}
        disabled={loading}
        style={{
          padding: '8px 16px',
          background: '#333',
          border: '1px solid #555',
          color: '#fff',
          cursor: loading ? 'wait' : 'pointer',
          borderRadius: '4px',
        }}
      >
        {loading ? 'Signing out...' : 'Sign Out'}
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={handleSignIn}
        disabled={loading}
        style={{
          padding: '12px 24px',
          background: '#4285f4',
          border: 'none',
          color: '#fff',
          cursor: loading ? 'wait' : 'pointer',
          borderRadius: '4px',
          fontSize: '16px',
        }}
      >
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>
      {error && (
        <p style={{ color: '#ef4444', marginTop: '8px', fontSize: '14px' }}>
          {error}
        </p>
      )}
    </div>
  );
}
