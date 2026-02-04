'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Neuron {
  id: string;
  type: 'topic' | 'user' | 'keyword' | 'document';
  label: string;
  activation: number;
  threshold: number;
  decay: number;
  fireCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export function useNeurons() {
  const [neurons, setNeurons] = useState<Neuron[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'neurons'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const neuronList: Neuron[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Neuron[];
        setNeurons(neuronList);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const createNeuron = async (
    type: Neuron['type'],
    label: string
  ): Promise<string> => {
    const docRef = await addDoc(collection(db, 'neurons'), {
      type,
      label,
      activation: 0,
      threshold: 0.7,
      decay: 0.1,
      fireCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  };

  return { neurons, loading, error, createNeuron };
}
