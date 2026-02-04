import * as admin from 'firebase-admin';

admin.initializeApp();

// Health check
export { healthCheck } from './health';

// Neuron triggers
export { onNeuronCreated, onNeuronUpdated } from './neurons';

// Spike triggers
export { onSpikeCreated } from './spikes';

// Scheduled tasks
export { decayNeuronActivations } from './decay';
