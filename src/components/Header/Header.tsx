import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../Auth/AuthModal';
import ProfileForm from '../Auth/ProfileForm';
import './Header.css';

export default function Header() {
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
      <div className="header-brand">
        <h1>Research Consortium</h1>
      </div>

      <nav className="header-nav">
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
            <div className="header-user-info">
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
              <span className="header-username">
                {userProfile?.displayName || user.email}
              </span>
            </div>
            <button className="header-signout" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        ) : (
          <button
            className="header-signin"
            onClick={() => setShowAuthModal(true)}
          >
            Sign In
          </button>
        )}
      </nav>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showProfileForm && <ProfileForm onClose={() => setShowProfileForm(false)} />}
    </header>
  );
}
