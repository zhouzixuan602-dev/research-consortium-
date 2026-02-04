'use client';

import { useState } from 'react';
import { Neuron } from '@research-consortium/shared';

interface CreateSynapseFormProps {
  neurons: Neuron[];
  onCreateSynapse: (preNeuronId: string, postNeuronId: string) => Promise<void>;
}

export function CreateSynapseForm({ neurons, onCreateSynapse }: CreateSynapseFormProps) {
  const [preNeuronId, setPreNeuronId] = useState('');
  const [postNeuronId, setPostNeuronId] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preNeuronId || !postNeuronId || preNeuronId === postNeuronId) return;

    setCreating(true);
    try {
      await onCreateSynapse(preNeuronId, postNeuronId);
      setPreNeuronId('');
      setPostNeuronId('');
    } finally {
      setCreating(false);
    }
  };

  const selectStyle = {
    padding: '8px',
    background: '#111',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: '4px',
    flex: 1,
    minWidth: '120px',
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      <select
        value={preNeuronId}
        onChange={(e) => setPreNeuronId(e.target.value)}
        style={selectStyle}
        disabled={creating}
      >
        <option value="">From neuron...</option>
        {neurons.map((n) => (
          <option key={n.id} value={n.id}>{n.label}</option>
        ))}
      </select>

      <span style={{ color: '#888' }}>→</span>

      <select
        value={postNeuronId}
        onChange={(e) => setPostNeuronId(e.target.value)}
        style={selectStyle}
        disabled={creating}
      >
        <option value="">To neuron...</option>
        {neurons.map((n) => (
          <option key={n.id} value={n.id}>{n.label}</option>
        ))}
      </select>

      <button
        type="submit"
        disabled={creating || !preNeuronId || !postNeuronId || preNeuronId === postNeuronId}
        style={{
          padding: '8px 16px',
          background: preNeuronId && postNeuronId && preNeuronId !== postNeuronId ? '#2a5' : '#333',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: preNeuronId && postNeuronId && preNeuronId !== postNeuronId ? 'pointer' : 'not-allowed',
        }}
      >
        {creating ? 'Creating...' : 'Connect'}
      </button>
    </form>
  );
}
