'use client';

import { useStimulate } from '@/hooks/useStimulate';

interface StimulateButtonProps {
  neuronId: string;
  label?: string;
}

export function StimulateButton({ neuronId, label = '⚡' }: StimulateButtonProps) {
  const { stimulateNeuron, stimulating } = useStimulate();
  const isStimulating = stimulating === neuronId;

  const handleClick = async () => {
    try {
      await stimulateNeuron(neuronId, 0.2);
    } catch {
      // Error handled by hook
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isStimulating}
      title="Stimulate neuron (+0.2 activation)"
      style={{
        padding: '4px 8px',
        background: isStimulating ? '#444' : '#f59e0b',
        border: 'none',
        borderRadius: '4px',
        color: '#000',
        cursor: isStimulating ? 'wait' : 'pointer',
        fontSize: '12px',
        fontWeight: 'bold',
      }}
    >
      {isStimulating ? '...' : label}
    </button>
  );
}
