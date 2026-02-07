import Dexie, { type Table } from 'dexie';
import type { User, Post, Message, Interest, Spike, Neuron, Synapse } from './types';

export class NeuroZhihuDB extends Dexie {
  users!: Table<User, number>;
  posts!: Table<Post, number>;
  messages!: Table<Message, number>;
  interests!: Table<Interest, number>;
  spikes!: Table<Spike, number>;
  neurons!: Table<Neuron, number>;
  synapses!: Table<Synapse, number>;

  constructor() {
    super('neurozhihu');
    this.version(1).stores({
      users: '++id, name',
      posts: '++id, authorId, network, createdAt, *tags',
      messages: '++id, postId, authorId, createdAt',
      interests: '++id, userId, tag, [userId+tag]',
      spikes: '++id, type, sourceId, network, timestamp',
      neurons: '++id, label, network, *tags',
      synapses: '++id, preNeuronId, postNeuronId, [preNeuronId+postNeuronId]',
    });
  }
}

export const db = new NeuroZhihuDB();
