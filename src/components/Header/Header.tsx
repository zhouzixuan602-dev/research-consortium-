import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../Auth/AuthModal';
import ProfileForm from '../Auth/ProfileForm';
import './Header.css';

interface HeaderProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'all', label: '推荐' },
  { id: 'daily', label: '日常' },
  { id: 'research', label: '研究' },
  { id: 'discussion', label: '讨论' },
];

export default function Header({ activeCategory, onCategoryChange }: HeaderProps) {
  const { user, userProfile, hasCompletedProfile, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="header-brand">
          <div className="brand-logo">
            <svg viewBox="0 0 32 32" className="logo-icon">
              <circle cx="16" cy="16" r="14" fill="currentColor" />
              <path d="M10 12 L16 8 L22 12 L22 20 L16 24 L10 20 Z" fill="#0d0d0d" />
              <circle cx="16" cy="16" r="4" fill="currentColor" />
            </svg>
          </div>
          <span className="brand-name">Neural Web</span>
        </div>
      </div>

      <nav className="header-categories">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </nav>

      <div className="header-right">
        {user ? (
          <div className="header-user">
            {!hasCompletedProfile && (
              <button
                className="header-complete-profile"
                onClick={() => setShowProfileForm(true)}
              >
                Complete Profile
              </button>
            )}
            <button className="header-user-btn" onClick={() => setShowProfileForm(true)}>
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.displayName}
                  className="header-avatar"
                />
              ) : (
                <div className="header-avatar-placeholder">
                  {(userProfile?.displayName || user.email || '?').charAt(0).toUpperCase()}
                </div>
              )}
            </button>
            <button className="header-signout" onClick={handleSignOut}>
              退出
            </button>
          </div>
        ) : (
          <button
            className="header-signin"
            onClick={() => setShowAuthModal(true)}
          >
            登录
          </button>
        )}
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showProfileForm && <ProfileForm onClose={() => setShowProfileForm(false)} />}
    </header>
  );
}
