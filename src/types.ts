export type NetworkType = 'DMN' | 'ECN' | 'PFC';

export interface User {
  id?: number;
  name: string;
  avatar: string;
  bio: string;
  interests: string[];
  createdAt: number;
}

export interface Post {
  id?: number;
  authorId: number;
  title: string;
  content: string;
  tags: string[];
  network: NetworkType;
  upvotes: number;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id?: number;
  postId: number;
  authorId: number;
  content: string;
  upvotes: number;
  createdAt: number;
}

export interface Interest {
  id?: number;
  userId: number;
  tag: string;
  active: boolean;
  strength: number;
  toggledAt: number;
}

export interface Spike {
  id?: number;
  type: 'post' | 'message' | 'interest';
  sourceId: number;
  tokens: string[];
  network: NetworkType;
  intensity: number;
  timestamp: number;
}

export interface Neuron {
  id?: number;
  label: string;
  tags: string[];
  network: NetworkType;
  activation: number;
  lastFired: number;
}

export interface Synapse {
  id?: number;
  preNeuronId: number;
  postNeuronId: number;
  weight: number;
  lastUpdated: number;
}
