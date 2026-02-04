'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Synapse {
  id: string;
  preNeuronId: string;
  postNeuronId: string;
  weight: number;
  plasticity: number;
  createdAt: Date;
  updatedAt: Date;
}

export function useSynapses(neuronId?: string) {
  const [synapses, setSynapses] = useState<Synapse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let q = query(collection(db, 'synapses'));

    // Filter by neuronId if provided (either pre or post)
    if (neuronId) {
      q = query(
        collection(db, 'synapses'),
        where('preNeuronId', '==', neuronId)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const synapseList: Synapse[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Synapse[];
        setSynapses(synapseList);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [neuronId]);

  const createSynapse = async (
    preNeuronId: string,
    postNeuronId: string,
    weight = 0.5,
    plasticity = 0.05
  ): Promise<string> => {
    const docRef = await addDoc(collection(db, 'synapses'), {
      preNeuronId,
      postNeuronId,
      weight,
      plasticity,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  };

  return { synapses, loading, error, createSynapse };
}
