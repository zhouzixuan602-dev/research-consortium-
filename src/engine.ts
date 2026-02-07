import { db } from './db';
import type { NetworkType, Spike, Neuron } from './types';

/** Tokenize text into lowercase keyword tokens */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/** Fire a spike event when user creates a post, message, or toggles interest */
export async function fireSpike(
  type: 'post' | 'message' | 'interest',
  sourceId: number,
  tokens: string[],
  network: NetworkType,
  intensity: number = 1.0
): Promise<Spike> {
  const spike: Spike = {
    type,
    sourceId,
    tokens,
    network,
    intensity,
    timestamp: Date.now(),
  };
  const id = await db.spikes.add(spike);
  spike.id = id;

  // Propagate spike to matching neurons
  await propagateSpike(spike);

  return spike;
}

/** Propagate spike: activate neurons whose tags overlap with spike tokens */
async function propagateSpike(spike: Spike): Promise<void> {
  const neurons = await db.neurons.where('network').equals(spike.network).toArray();
  const spikeTokenSet = new Set(spike.tokens);

  const activated: Neuron[] = [];

  for (const neuron of neurons) {
    const overlap = neuron.tags.filter((t) => spikeTokenSet.has(t));
    if (overlap.length > 0) {
      const boost = (overlap.length / Math.max(neuron.tags.length, 1)) * spike.intensity;
      neuron.activation = Math.min(1.0, neuron.activation + boost * 0.3);
      neuron.lastFired = Date.now();
      activated.push(neuron);
    }
  }

  // Batch update activated neurons
  await db.neurons.bulkPut(activated);

  // Hebbian update: strengthen synapses between co-activated neurons
  for (let i = 0; i < activated.length; i++) {
    for (let j = i + 1; j < activated.length; j++) {
      await hebbianUpdate(activated[i].id!, activated[j].id!);
    }
  }
}

/** Simple Hebbian rule: neurons that fire together wire together */
async function hebbianUpdate(preId: number, postId: number): Promise<void> {
  const [a, b] = preId < postId ? [preId, postId] : [postId, preId];

  let synapse = await db.synapses
    .where('[preNeuronId+postNeuronId]')
    .equals([a, b])
    .first();

  const learningRate = 0.1;

  if (synapse) {
    synapse.weight = Math.min(1.0, synapse.weight + learningRate);
    synapse.lastUpdated = Date.now();
    await db.synapses.put(synapse);
  } else {
    await db.synapses.add({
      preNeuronId: a,
      postNeuronId: b,
      weight: learningRate,
      lastUpdated: Date.now(),
    });
  }
}

/** Decay all neuron activations and synapse weights over time */
export async function decayAll(decayRate: number = 0.05): Promise<void> {
  const neurons = await db.neurons.toArray();
  const updatedNeurons = neurons.map((n) => ({
    ...n,
    activation: Math.max(0, n.activation - decayRate),
  }));
  await db.neurons.bulkPut(updatedNeurons);

  const synapses = await db.synapses.toArray();
  const updatedSynapses = synapses
    .map((s) => ({
      ...s,
      weight: Math.max(0, s.weight - decayRate * 0.5),
    }))
    .filter((s) => s.weight > 0.01);

  // Remove near-zero synapses
  const toDelete = synapses
    .filter((s) => {
      const updated = updatedSynapses.find((u) => u.id === s.id);
      return !updated;
    })
    .map((s) => s.id!);

  await db.synapses.bulkPut(updatedSynapses);
  if (toDelete.length > 0) {
    await db.synapses.bulkDelete(toDelete);
  }
}

/** Get top activated neurons for a given network */
export async function getTopNeurons(
  network: NetworkType | null,
  limit: number = 10
): Promise<Neuron[]> {
  let neurons: Neuron[];
  if (network) {
    neurons = await db.neurons.where('network').equals(network).toArray();
  } else {
    neurons = await db.neurons.toArray();
  }
  return neurons.sort((a, b) => b.activation - a.activation).slice(0, limit);
}
