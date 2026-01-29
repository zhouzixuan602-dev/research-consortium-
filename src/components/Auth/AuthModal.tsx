import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AuthModal.css';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal" ref={modalRef}>
        <button className="auth-modal-close" onClick={onClose}>
          ×
        </button>

        <h2>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          className="auth-google"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          Continue with Google
        </button>

        <p className="auth-switch">
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => setMode('signup')}>Sign Up</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setMode('signin')}>Sign In</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
