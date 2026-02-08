import { useState } from 'react';
import type { User } from '../types';

interface Props {
  users: User[];
  onLogin: (userId: number) => void;
  onRegister: (name: string, initials: string, bio: string) => void;
}

export default function AuthScreen({ users, onLogin, onRegister }: Props) {
  const [mode, setMode] = useState<'select' | 'register'>('select');
  const [name, setName] = useState('');
  const [initials, setInitials] = useState('');
  const [bio, setBio] = useState('');

  const handleRegister = () => {
    if (!name.trim()) return;
    const auto = name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    onRegister(name.trim(), initials.trim() || auto, bio.trim());
  };

  return (
    <div className="auth-screen">
      <div className="auth-card glass">
        <div className="auth-logo">
          <div className="logo-icon" style={{ width: 48, height: 48, fontSize: '1.4rem', borderRadius: 14 }}>N</div>
          <h1>NeuroZhihu</h1>
          <p className="auth-subtitle">Biomimetic knowledge network</p>
        </div>

        {mode === 'select' && (
          <>
            <div className="auth-section-title">Choose an identity</div>
            <div className="user-list">
              {users.map((u) => (
                <button key={u.id} className="user-option" onClick={() => onLogin(u.id!)}>
                  <div className="card-avatar">{u.avatar}</div>
                  <div className="user-option-info">
                    <span className="user-option-name">{u.name}</span>
                    <span className="user-option-bio">{u.bio}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="auth-divider"><span>or</span></div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setMode('register')}>
              Create new account
            </button>
          </>
        )}

        {mode === 'register' && (
          <>
            <div className="auth-section-title">Create your identity</div>
            <div className="form-row">
              <label className="form-label">Name</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Your display name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-row">
              <label className="form-label">Initials (2 letters)</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Auto-generated from name"
                value={initials}
                onChange={(e) => setInitials(e.target.value.slice(0, 2))}
                maxLength={2}
              />
            </div>
            <div className="form-row">
              <label className="form-label">Bio (optional)</label>
              <input
                className="auth-input"
                type="text"
                placeholder="A short description about you"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setMode('select')}>
                Back
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleRegister}
                disabled={!name.trim()}
              >
                Create
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
