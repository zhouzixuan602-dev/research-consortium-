'use client';

import { useState } from 'react';
import { useNeurons } from '@/hooks/useNeurons';
import { useSpikes } from '@/hooks/useSpikes';

export function SpikePanel() {
  const { neurons } = useNeurons();
  const { spikes, sendSpike } = useSpikes(10);
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [strength, setStrength] = useState(0.3);
  const [sending, setSending] = useState(false);

  const handleSendSpike = async () => {
    if (!sourceId || !targetId) return;
    setSending(true);
    try {
      await sendSpike(sourceId, targetId, strength);
      setStrength(0.3);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ marginTop: '24px', padding: '16px', background: '#111', borderRadius: '8px', border: '1px solid #333' }}>
      <h3 style={{ margin: '0 0 16px 0' }}>Send Spike</h3>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <select
          value={sourceId}
          onChange={(e) => setSourceId(e.target.value)}
          style={{ flex: 1, padding: '8px', background: '#222', border: '1px solid #444', color: '#fff', minWidth: '120px' }}
        >
          <option value="">Source neuron</option>
          {neurons.map((n) => (
            <option key={n.id} value={n.id}>{n.label}</option>
          ))}
        </select>

        <span style={{ padding: '8px', color: '#888' }}>→</span>

        <select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          style={{ flex: 1, padding: '8px', background: '#222', border: '1px solid #444', color: '#fff', minWidth: '120px' }}
        >
          <option value="">Target neuron</option>
          {neurons.map((n) => (
            <option key={n.id} value={n.id}>{n.label}</option>
          ))}
        </select>

        <input
          type="number"
          min="0.1"
          max="1"
          step="0.1"
          value={strength}
          onChange={(e) => setStrength(parseFloat(e.target.value))}
          style={{ width: '70px', padding: '8px', background: '#222', border: '1px solid #444', color: '#fff' }}
        />

        <button
          onClick={handleSendSpike}
          disabled={!sourceId || !targetId || sending}
          style={{
            padding: '8px 16px',
            background: sourceId && targetId ? '#8b5cf6' : '#444',
            border: 'none',
            color: '#fff',
            cursor: sourceId && targetId ? 'pointer' : 'not-allowed',
            borderRadius: '4px',
          }}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>

      <div style={{ fontSize: '12px', color: '#666' }}>
        Recent spikes: {spikes.length}
      </div>
    </div>
  );
}
