'use client';

import { useState } from 'react';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useStimulate() {
  const [stimulating, setStimulating] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const stimulateNeuron = async (neuronId: string, amount: number = 0.2): Promise<void> => {
    setStimulating(neuronId);
    setError(null);
    try {
      const neuronRef = doc(db, 'neurons', neuronId);
      await updateDoc(neuronRef, {
        activation: increment(amount),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to stimulate neuron'));
      throw err;
    } finally {
      setStimulating(null);
    }
  };

  return { stimulateNeuron, stimulating, error };
}
