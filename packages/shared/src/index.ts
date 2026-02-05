// =============================================================================
// Neural Web - Core Biomimetic Types
// =============================================================================

/**
 * Spike - Discrete information impulse traveling through the network.
 * Created when posts/messages/interests trigger neural activity.
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

// =============================================================================
// Zhihu-like Post/Discussion Types
// =============================================================================

/**
 * Post - A discussion topic in the Neural Web feed.
 * Creating a post triggers a Spike to related Neurons.
 */
export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  title: string;
  abstract: string;
  coverImageURL?: string;
  tags: string[];
  messageCount: number;
  interestCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date; // Updated when new message/interest added
}

/**
 * Message - A text reply in a post's discussion thread.
 * Stored as subcollection: posts/{postId}/messages/{messageId}
 */
export interface Message {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string; // Plain text only
  createdAt: Date;
}

/**
 * Interest - A user's "synaptic tag" on a post (like a bookmark/like).
 * Stored as subcollection: posts/{postId}/interests/{uid}
 */
export interface Interest {
  uid: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
}

// =============================================================================
// Cognitive Networks
// =============================================================================

/**
 * Cognitive network identifiers (DMN, ECN, PFC).
 */
export type NetworkType = 'DMN' | 'ECN' | 'PFC';

/**
 * Cognitive network definitions with metadata.
 */
export const COGNITIVE_NETWORKS: Record<NetworkType, { name: string; description: string }> = {
  DMN: {
    name: 'Default Mode Network',
    description: 'Background processing, idea incubation, self-referential thought',
  },
  ECN: {
    name: 'Executive Control Network',
    description: 'Active task focus, goal-directed reasoning, working memory',
  },
  PFC: {
    name: 'Prefrontal Cortex',
    description: 'Decision making, priority weighting, impulse control',
  },
};

/**
 * Default configuration values for neural simulation.
 */
export const NEURAL_DEFAULTS = {
  threshold: 0.7,
  decay: 0.1,
  plasticity: 0.05,
  initialActivation: 0,
  initialWeight: 0.5,
} as const;

/**
 * User profile for authentication.
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  createdAt: Date;
  updatedAt?: Date;
}
