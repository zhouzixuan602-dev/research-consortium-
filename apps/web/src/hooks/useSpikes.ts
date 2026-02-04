'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Spike {
  id: string;
  sourceNeuronId: string;
  targetNeuronId: string;
  strength: number;
  payload: Record<string, unknown>;
  createdAt: Date;
  processed: boolean;
}

export function useSpikes(maxSpikes = 50) {
  const [spikes, setSpikes] = useState<Spike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'spikes'),
      orderBy('createdAt', 'desc'),
      limit(maxSpikes)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const spikeList: Spike[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Spike[];
        setSpikes(spikeList);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [maxSpikes]);

  const sendSpike = async (
    sourceNeuronId: string,
    targetNeuronId: string,
    strength = 0.5,
    payload: Record<string, unknown> = {}
  ): Promise<string> => {
    const docRef = await addDoc(collection(db, 'spikes'), {
      sourceNeuronId,
      targetNeuronId,
      strength,
      payload,
      createdAt: serverTimestamp(),
      processed: false,
    });
    return docRef.id;
  };

  return { spikes, loading, error, sendSpike };
}
