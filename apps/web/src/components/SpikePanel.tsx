'use client';

import { useNeurons } from '@/hooks/useNeurons';
import { useSpikes } from '@/hooks/useSpikes';

export function SpikePanel() {
  const { neurons } = useNeurons();
  const { spikes, loading, error } = useSpikes(20);

  const neuronMap = new Map(neurons.map((n) => [n.id, n.label]));

  const formatTime = (date: Date | undefined) => {
    if (!date) return '--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (loading) return <div style={{ marginTop: '24px' }}>Loading spikes...</div>;
  if (error) return <div style={{ marginTop: '24px', color: '#f55' }}>Error: {error.message}</div>;

  return (
    <div style={{ marginTop: '24px' }}>
      <h2>Recent Spikes ({spikes.length})</h2>

      {spikes.length === 0 ? (
        <p style={{ color: '#888' }}>No spikes recorded yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {spikes.map((spike) => (
            <div
              key={spike.id}
              style={{
                padding: '12px',
                background: spike.processed ? '#111' : '#1a1a2e',
                border: spike.processed ? '1px solid #333' : '1px solid #8b5cf6',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ color: '#3b82f6' }}>
                  {neuronMap.get(spike.sourceNeuronId) || spike.sourceNeuronId.slice(0, 8)}
                </span>
                <span style={{ color: '#888' }}>→</span>
                <span style={{ color: '#22c55e' }}>
                  {neuronMap.get(spike.targetNeuronId) || spike.targetNeuronId.slice(0, 8)}
                </span>
                <span
                  style={{
                    marginLeft: 'auto',
                    padding: '2px 8px',
                    background: '#222',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f59e0b',
                  }}
                >
                  {Math.round(spike.strength * 100)}%
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    background: spike.processed ? '#166534' : '#7c3aed',
                    borderRadius: '12px',
                    fontSize: '10px',
                    color: '#fff',
                  }}
                >
                  {spike.processed ? 'processed' : 'pending'}
                </span>
              </div>
              <div style={{ marginTop: '4px', fontSize: '11px', color: '#666' }}>
                {formatTime(spike.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
