'use client';

import { useState } from 'react';
import { NetworkType, COGNITIVE_NETWORKS } from '@research-consortium/shared';

interface NetworkSelectorProps {
  value: NetworkType;
  onChange: (network: NetworkType) => void;
}

export function NetworkSelector({ value, onChange }: NetworkSelectorProps) {
  const [expanded, setExpanded] = useState(false);

  const networks = Object.entries(COGNITIVE_NETWORKS) as [NetworkType, { name: string; description: string }][];

  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        {networks.map(([key, { name }]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              padding: '8px 16px',
              background: value === key ? '#8b5cf6' : '#222',
              border: value === key ? '2px solid #a78bfa' : '1px solid #444',
              borderRadius: '20px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
          >
            {key}
          </button>
        ))}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            padding: '8px',
            background: 'transparent',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {expanded && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            background: '#111',
            borderRadius: '8px',
            border: '1px solid #333',
          }}
        >
          <h4 style={{ margin: '0 0 8px 0', color: '#a78bfa' }}>
            {COGNITIVE_NETWORKS[value].name}
          </h4>
          <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
            {COGNITIVE_NETWORKS[value].description}
          </p>
        </div>
      )}
    </div>
  );
}
