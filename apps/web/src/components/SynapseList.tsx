'use client';

import { useState } from 'react';
import { useNeurons } from '@/hooks/useNeurons';
import { useSynapses, Synapse } from '@/hooks/useSynapses';

function SynapseCard({ synapse, neurons }: { synapse: Synapse; neurons: Map<string, string> }) {
  const weightPercent = Math.round(synapse.weight * 100);
  const preName = neurons.get(synapse.preNeuronId) || 'Unknown';
  const postName = neurons.get(synapse.postNeuronId) || 'Unknown';

  return (
    <div
      style={{
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '8px',
        background: '#111',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#3b82f6' }}>{preName}</span>
        <span style={{ color: '#888' }}>→</span>
        <span style={{ color: '#22c55e' }}>{postName}</span>
        <span style={{ marginLeft: 'auto', color: '#888', fontSize: '12px' }}>
          weight: {weightPercent}%
        </span>
      </div>
      <div
        style={{
          marginTop: '8px',
          background: '#222',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${weightPercent}%`,
            height: '4px',
            background: '#8b5cf6',
            transition: 'width 0.3s',
          }}
        />
      </div>
    </div>
  );
}

export function SynapseList() {
  const { neurons } = useNeurons();
  const { synapses, loading, error, createSynapse } = useSynapses();
  const [preId, setPreId] = useState('');
  const [postId, setPostId] = useState('');
  const [creating, setCreating] = useState(false);

  const neuronMap = new Map(neurons.map((n) => [n.id, n.label]));

  const handleCreate = async () => {
    if (!preId || !postId || preId === postId) return;
    setCreating(true);
    try {
      await createSynapse(preId, postId);
      setPreId('');
      setPostId('');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div>Loading synapses...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div style={{ marginTop: '24px' }}>
      <h2>Synapses ({synapses.length})</h2>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <select
          value={preId}
          onChange={(e) => setPreId(e.target.value)}
          style={{ flex: 1, padding: '8px', background: '#222', border: '1px solid #444', color: '#fff', minWidth: '120px' }}
        >
          <option value="">Pre-synaptic</option>
          {neurons.map((n) => (
            <option key={n.id} value={n.id}>{n.label}</option>
          ))}
        </select>
        <span style={{ padding: '8px', color: '#888' }}>→</span>
        <select
          value={postId}
          onChange={(e) => setPostId(e.target.value)}
          style={{ flex: 1, padding: '8px', background: '#222', border: '1px solid #444', color: '#fff', minWidth: '120px' }}
        >
          <option value="">Post-synaptic</option>
          {neurons.map((n) => (
            <option key={n.id} value={n.id}>{n.label}</option>
          ))}
        </select>
        <button
          onClick={handleCreate}
          disabled={!preId || !postId || preId === postId || creating}
          style={{
            padding: '8px 16px',
            background: preId && postId && preId !== postId ? '#8b5cf6' : '#444',
            border: 'none',
            color: '#fff',
            cursor: preId && postId && preId !== postId ? 'pointer' : 'not-allowed',
            borderRadius: '4px',
          }}
        >
          {creating ? 'Creating...' : 'Connect'}
        </button>
      </div>

      {synapses.map((synapse) => (
        <SynapseCard key={synapse.id} synapse={synapse} neurons={neuronMap} />
      ))}
    </div>
  );
}
