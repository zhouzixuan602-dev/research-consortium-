// =============================================================================
// Neural Web - Core Biomimetic Types
// =============================================================================

/**
 * Spike - Discrete information impulse traveling through the network.
 */
export interface Spike {
  id: string;
  sourceNeuronId: string;
  targetNeuronId: string;
  strength: number; // 0.0 - 1.0
  payload: Record<string, unknown>;
  createdAt: Date;
  processed: boolean;
}

/**
 * Neuron - Node representing a concept, topic, user, or research area.
 */
export interface Neuron {
  id: string;
  type: 'topic' | 'user' | 'keyword' | 'document';
  label: string;
  activation: number; // 0.0 - 1.0
  threshold: number; // firing threshold (default 0.7)
  decay: number; // decay rate per tick (default 0.1)
  createdAt: Date;
  updatedAt: Date;
  fireCount: number;
}

/**
 * Synapse - Weighted connection between two neurons.
 */
export interface Synapse {
  id: string;
  preNeuronId: string; // source
  postNeuronId: string; // target
  weight: number; // 0.0 - 1.0
  plasticity: number; // learning rate (default 0.05)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Cognitive network identifiers (DMN, ECN, PFC).
 */
export type NetworkType = 'DMN' | 'ECN' | 'PFC';

/**
 * User profile for authentication.
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
}
