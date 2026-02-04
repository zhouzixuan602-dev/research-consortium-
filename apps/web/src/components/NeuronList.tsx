'use client';

import { useState } from 'react';
import { useNeurons, Neuron } from '@/hooks/useNeurons';

function NeuronCard({ neuron }: { neuron: Neuron }) {
  const activationPercent = Math.round(neuron.activation * 100);
  const isFiring = neuron.activation >= neuron.threshold;

  return (
    <div
      style={{
        border: isFiring ? '2px solid #22c55e' : '1px solid #333',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '8px',
        background: isFiring ? '#052e16' : '#111',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>{neuron.label}</strong>
        <span style={{ color: '#888', fontSize: '12px' }}>{neuron.type}</span>
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
            width: `${activationPercent}%`,
            height: '8px',
            background: isFiring ? '#22c55e' : '#3b82f6',
            transition: 'width 0.3s',
          }}
        />
      </div>
      <div
        style={{
          marginTop: '4px',
          fontSize: '12px',
          color: '#888',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>Activation: {activationPercent}%</span>
        <span>Fires: {neuron.fireCount}</span>
      </div>
    </div>
  );
}

export function NeuronList() {
  const { neurons, loading, error, createNeuron } = useNeurons();
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<Neuron['type']>('topic');

  const handleCreate = async () => {
    if (!newLabel.trim()) return;
    await createNeuron(newType, newLabel.trim());
    setNewLabel('');
  };

  if (loading) return <div>Loading neurons...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Neurons ({neurons.length})</h2>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Neuron label"
          style={{ padding: '8px', background: '#222', border: '1px solid #444', color: '#fff' }}
        />
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value as Neuron['type'])}
          style={{ padding: '8px', background: '#222', border: '1px solid #444', color: '#fff' }}
        >
          <option value="topic">Topic</option>
          <option value="keyword">Keyword</option>
          <option value="user">User</option>
          <option value="document">Document</option>
        </select>
        <button
          onClick={handleCreate}
          style={{ padding: '8px 16px', background: '#3b82f6', border: 'none', color: '#fff', cursor: 'pointer' }}
        >
          Create
        </button>
      </div>

      {neurons.map((neuron) => (
        <NeuronCard key={neuron.id} neuron={neuron} />
      ))}
    </div>
  );
}
