import { db } from './db';
import type { NetworkType } from './types';

const DEMO_USERS = [
  { name: 'Ada Lovelace', avatar: 'AL', bio: 'Pioneer of computing', interests: ['algorithms', 'mathematics', 'computing'] },
  { name: 'Alan Turing', avatar: 'AT', bio: 'Father of theoretical computer science', interests: ['ai', 'computation', 'cryptography'] },
  { name: 'Grace Hopper', avatar: 'GH', bio: 'Queen of code', interests: ['compilers', 'programming', 'navy'] },
  { name: 'John von Neumann', avatar: 'JN', bio: 'Polymath and game theorist', interests: ['mathematics', 'physics', 'game-theory'] },
  { name: 'Rosalind Franklin', avatar: 'RF', bio: 'X-ray crystallography pioneer', interests: ['biology', 'dna', 'chemistry'] },
];

const TAG_POOL = [
  'ai', 'neuroscience', 'mathematics', 'computing', 'algorithms',
  'biology', 'physics', 'philosophy', 'cognition', 'networks',
  'learning', 'memory', 'attention', 'consciousness', 'language',
];

const NETWORKS: NetworkType[] = ['DMN', 'ECN', 'PFC'];

const DEMO_POSTS: { title: string; content: string; tags: string[]; network: NetworkType }[] = [
  {
    title: 'How does the Default Mode Network shape our creativity?',
    content: 'The DMN activates during rest and mind-wandering. Research suggests it plays a key role in creative thinking by connecting disparate memories and ideas. When we daydream, the DMN allows us to simulate scenarios, combine concepts in novel ways, and generate insights that would never arise during focused attention. What are your thoughts on leveraging DMN activity for problem-solving?',
    tags: ['neuroscience', 'cognition', 'networks'],
    network: 'DMN',
  },
  {
    title: 'Hebbian Learning: The foundation of neural plasticity',
    content: 'Donald Hebb proposed that "neurons that fire together wire together." This simple rule explains how synaptic connections strengthen through repeated co-activation. Modern deep learning uses backpropagation, but biological brains rely on local Hebbian-like mechanisms. Could simpler Hebbian rules be sufficient for building intelligent systems?',
    tags: ['ai', 'neuroscience', 'learning'],
    network: 'ECN',
  },
  {
    title: 'Attention mechanisms in transformers vs biological attention',
    content: 'Transformer models use scaled dot-product attention to weigh the relevance of different input tokens. The prefrontal cortex performs a similar function—filtering relevant stimuli and suppressing distractors. How far does this analogy extend? Are there architectural lessons from neuroscience that could improve current AI attention mechanisms?',
    tags: ['ai', 'attention', 'computing'],
    network: 'PFC',
  },
  {
    title: 'Memory consolidation during sleep',
    content: 'During sleep, the hippocampus replays experiences to the neocortex, gradually transferring memories from short-term to long-term storage. This process mirrors how experience replay works in reinforcement learning. The DMN is particularly active during NREM sleep stages. Understanding this process could unlock new approaches to continual learning in AI.',
    tags: ['neuroscience', 'memory', 'learning'],
    network: 'DMN',
  },
  {
    title: 'The role of executive control in complex reasoning',
    content: 'The Executive Control Network coordinates goal-directed behavior, working memory maintenance, and cognitive flexibility. When we solve a multi-step problem, the ECN orchestrates activity across multiple brain regions. This is analogous to how chain-of-thought prompting helps language models break down complex tasks.',
    tags: ['cognition', 'networks', 'ai'],
    network: 'ECN',
  },
  {
    title: 'Can artificial neural networks develop consciousness?',
    content: 'Integrated Information Theory proposes that consciousness arises from integrated information processing. If we build networks with sufficient integration, could they become conscious? The PFC is thought to be central to conscious awareness, but consciousness may require more than just computation—it may need embodiment.',
    tags: ['consciousness', 'philosophy', 'ai'],
    network: 'PFC',
  },
  {
    title: 'Graph neural networks and brain connectivity',
    content: 'The brain is fundamentally a graph—neurons connected by synapses forming complex networks. Graph Neural Networks (GNNs) attempt to learn on graph-structured data. Could we use GNNs to model brain connectivity patterns and predict cognitive states? Early results in connectomics are promising.',
    tags: ['networks', 'computing', 'neuroscience'],
    network: 'ECN',
  },
  {
    title: 'Language as a cognitive scaffold',
    content: 'Language is not just communication—it structures thought itself. The PFC uses linguistic representations to plan, reason abstractly, and maintain goals. Large language models process language without any grounding in experience. Does this mean they think differently, or does statistical pattern matching approximate cognitive scaffolding?',
    tags: ['language', 'cognition', 'philosophy'],
    network: 'PFC',
  },
];

const DEMO_MESSAGES: { postIndex: number; authorIndex: number; content: string }[] = [
  { postIndex: 0, authorIndex: 1, content: 'Fascinating question. I believe the DMN acts as a pattern-completion engine, drawing on stored representations to fill gaps in our understanding.' },
  { postIndex: 0, authorIndex: 2, content: 'In my experience with programming, some of my best solutions came during walks away from the terminal. The DMN at work!' },
  { postIndex: 1, authorIndex: 0, content: 'The beauty of Hebbian learning is its locality—each synapse only needs information about its pre- and post-synaptic neurons. No global error signal required.' },
  { postIndex: 1, authorIndex: 3, content: 'We should consider that Hebbian learning alone leads to instability. Homeostatic mechanisms and normalization are essential complements.' },
  { postIndex: 2, authorIndex: 4, content: 'The biological attention system is multi-scale—from ion channels to cortical columns. Transformers only capture one level of this hierarchy.' },
  { postIndex: 2, authorIndex: 1, content: 'I think the key difference is that biological attention is inherently embodied and temporally grounded, while transformer attention operates on static sequences.' },
  { postIndex: 3, authorIndex: 0, content: 'The hippocampal replay mechanism is remarkably efficient. It selectively strengthens memories that are most relevant to survival and goals.' },
  { postIndex: 4, authorIndex: 2, content: 'The ECN must balance exploitation of known strategies with exploration of new approaches—a fundamental challenge in both biology and AI.' },
  { postIndex: 5, authorIndex: 3, content: 'Consciousness may not be binary. Perhaps artificial systems can achieve varying degrees of integrated information processing.' },
  { postIndex: 6, authorIndex: 1, content: 'The challenge with GNNs for brain modeling is the sheer scale—billions of neurons and trillions of synapses. We need better approximations.' },
  { postIndex: 7, authorIndex: 0, content: 'Language as cognitive scaffold is Vygotsky\'s idea brought to the 21st century. LLMs may be performing a statistical approximation of this scaffolding.' },
  { postIndex: 7, authorIndex: 4, content: 'From a biological perspective, language regions are deeply interconnected with sensory and motor areas. Pure text processing misses this embodiment.' },
];

const NEURON_DEFS: { label: string; tags: string[]; network: NetworkType }[] = [
  { label: 'Creativity Hub', tags: ['cognition', 'consciousness', 'philosophy'], network: 'DMN' },
  { label: 'Memory Encoder', tags: ['memory', 'learning', 'neuroscience'], network: 'DMN' },
  { label: 'Daydream Core', tags: ['consciousness', 'networks', 'cognition'], network: 'DMN' },
  { label: 'Task Planner', tags: ['algorithms', 'computing', 'ai'], network: 'ECN' },
  { label: 'Working Memory', tags: ['memory', 'attention', 'cognition'], network: 'ECN' },
  { label: 'Pattern Matcher', tags: ['learning', 'ai', 'networks'], network: 'ECN' },
  { label: 'Decision Gate', tags: ['attention', 'cognition', 'philosophy'], network: 'PFC' },
  { label: 'Language Processor', tags: ['language', 'computing', 'ai'], network: 'PFC' },
  { label: 'Abstract Reasoner', tags: ['mathematics', 'philosophy', 'cognition'], network: 'PFC' },
  { label: 'Social Modeler', tags: ['language', 'cognition', 'consciousness'], network: 'DMN' },
  { label: 'Novelty Detector', tags: ['attention', 'learning', 'neuroscience'], network: 'ECN' },
  { label: 'Goal Integrator', tags: ['networks', 'attention', 'computing'], network: 'PFC' },
];

export async function seedDatabase(): Promise<void> {
  const userCount = await db.users.count();
  if (userCount > 0) return; // Already seeded

  const now = Date.now();

  // Seed users
  const userIds: number[] = [];
  for (const u of DEMO_USERS) {
    const id = await db.users.add({
      name: u.name,
      avatar: u.avatar,
      bio: u.bio,
      interests: u.interests,
      createdAt: now - Math.random() * 86400000 * 30,
    });
    userIds.push(id);
  }

  // Seed interests
  for (let i = 0; i < DEMO_USERS.length; i++) {
    for (const tag of DEMO_USERS[i].interests) {
      await db.interests.add({
        userId: userIds[i],
        tag,
        active: true,
        strength: 0.5 + Math.random() * 0.5,
        toggledAt: now,
      });
    }
    // Add a couple random extra interests
    const extra = TAG_POOL.filter((t) => !DEMO_USERS[i].interests.includes(t)).slice(0, 2);
    for (const tag of extra) {
      await db.interests.add({
        userId: userIds[i],
        tag,
        active: Math.random() > 0.5,
        strength: Math.random() * 0.4,
        toggledAt: now,
      });
    }
  }

  // Seed posts
  const postIds: number[] = [];
  for (let i = 0; i < DEMO_POSTS.length; i++) {
    const p = DEMO_POSTS[i];
    const msgCount = DEMO_MESSAGES.filter((m) => m.postIndex === i).length;
    const id = await db.posts.add({
      authorId: userIds[i % userIds.length],
      title: p.title,
      content: p.content,
      tags: p.tags,
      network: p.network,
      upvotes: Math.floor(Math.random() * 50) + 5,
      messageCount: msgCount,
      createdAt: now - Math.random() * 86400000 * 14,
      updatedAt: now - Math.random() * 86400000 * 3,
    });
    postIds.push(id);
  }

  // Seed messages
  for (const m of DEMO_MESSAGES) {
    await db.messages.add({
      postId: postIds[m.postIndex],
      authorId: userIds[m.authorIndex],
      content: m.content,
      upvotes: Math.floor(Math.random() * 20),
      createdAt: now - Math.random() * 86400000 * 7,
    });
  }

  // Seed neurons
  for (const nd of NEURON_DEFS) {
    await db.neurons.add({
      label: nd.label,
      tags: nd.tags,
      network: nd.network,
      activation: Math.random() * 0.3,
      lastFired: now - Math.random() * 86400000,
    });
  }

  // Seed some initial synapses
  const neuronIds = await db.neurons.toArray();
  for (let i = 0; i < neuronIds.length; i++) {
    for (let j = i + 1; j < neuronIds.length; j++) {
      if (Math.random() > 0.7) {
        const [a, b] = [neuronIds[i].id!, neuronIds[j].id!];
        await db.synapses.add({
          preNeuronId: Math.min(a, b),
          postNeuronId: Math.max(a, b),
          weight: Math.random() * 0.3,
          lastUpdated: now,
        });
      }
    }
  }
}
