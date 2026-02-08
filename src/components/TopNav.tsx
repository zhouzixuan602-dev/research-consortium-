import { useRef } from 'react';
import type { User } from '../types';
import { exportAllData, importAllData, downloadJson } from '../portability';

interface Props {
  search: string;
  onSearchChange: (s: string) => void;
  currentUser: User | null;
  onRefresh: () => void;
  onLogout: () => void;
}

export default function TopNav({ search, onSearchChange, currentUser, onRefresh, onLogout }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const json = await exportAllData();
    downloadJson(json, `neurozhihu-backup-${Date.now()}.json`);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await importAllData(text);
    onRefresh();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <nav className="top-nav glass">
      <div className="logo">
        <div className="logo-icon">N</div>
        NeuroZhihu
      </div>

      <div className="search-box">
        <span className="search-icon">&#x1F50D;&#xFE0E;</span>
        <input
          type="text"
          placeholder="Search posts, tags, topics..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="nav-actions">
        <button className="btn btn-ghost btn-sm" onClick={handleExport}>
          Export
        </button>
        <button className="btn btn-ghost btn-sm" onClick={handleImport}>
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {currentUser && (
          <span className="nav-username">{currentUser.name}</span>
        )}
        <button className="avatar-btn" title={currentUser?.name || 'Profile'}>
          {currentUser?.avatar || '?'}
        </button>
        {currentUser && (
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
