import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './ProfileForm.css';

interface ProfileFormProps {
  onClose: () => void;
}

export default function ProfileForm({ onClose }: ProfileFormProps) {
  const { userProfile, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [institution, setInstitution] = useState(userProfile?.institution || '');
  const [interests, setInterests] = useState(
    userProfile?.researchInterests?.join(', ') || ''
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError('Display name is required.');
      return;
    }

    if (!institution.trim()) {
      setError('Institution is required.');
      return;
    }

    setLoading(true);

    try {
      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        institution: institution.trim(),
        researchInterests: interests
          .split(',')
          .map((i) => i.trim())
          .filter((i) => i.length > 0),
        profileCompleted: true,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    }

    setLoading(false);
  };

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal" ref={modalRef}>
        <h2>Complete Your Profile</h2>
        <p className="profile-subtitle">
          Please complete your profile to participate in discussions.
        </p>

        {error && <div className="profile-error">{error}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-field">
            <label htmlFor="displayName">Display Name *</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              disabled={loading}
              placeholder="Your name"
            />
          </div>

          <div className="profile-field">
            <label htmlFor="institution">Institution *</label>
            <input
              id="institution"
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              required
              disabled={loading}
              placeholder="University or organization"
            />
          </div>

          <div className="profile-field">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={loading}
              rows={3}
              placeholder="Brief description of your research"
            />
          </div>

          <div className="profile-field">
            <label htmlFor="interests">Research Interests</label>
            <input
              id="interests"
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              disabled={loading}
              placeholder="Comma-separated (e.g., AI, Neuroscience, Biology)"
            />
          </div>

          <div className="profile-actions">
            <button
              type="button"
              className="profile-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="profile-submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
