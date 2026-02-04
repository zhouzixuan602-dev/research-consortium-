# Neural Web Specification

## Core Entities

- **Spike** - Discrete information impulse traveling through the network
- **Neuron** - Node representing a concept, topic, user, or research area
- **Synapse** - Weighted connection between neurons

## Cognitive Networks (Future)

- **DMN (Default Mode Network)** - Background processing, idea incubation
- **ECN (Executive Control Network)** - Active task focus, goal-directed reasoning
- **PFC (Prefrontal Cortex)** - Decision making, priority weighting

## Data Flow

```
User activity → Spikes → Neurons activate → Synapses strengthen → Emergent connections
```

## Architecture

```
neural-web/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── functions/    # Firebase Cloud Functions
├── packages/
│   └── shared/       # Shared types (Spike, Neuron, Synapse)
└── firebase config   # Firestore rules, indexes
```

## Firestore Collections

- `users/{uid}` - User profiles
- `neurons/{id}` - Neural nodes with activation levels
- `synapses/{id}` - Weighted connections between neurons
- `spikes/{id}` - Immutable spike events

## Cloud Functions

| Function | Trigger | Description |
|----------|---------|-------------|
| healthCheck | HTTP | Health check endpoint |
| onNeuronCreated | Firestore | Set default neuron values |
| onNeuronUpdated | Firestore | Fire neuron, propagate spikes |
| onNeuronDeleted | Firestore | Clean up connected synapses |
| onSpikeCreated | Firestore | Update target activation, Hebbian learning |
| decayNeuronActivations | Scheduled | Decay all neuron activations |
| onUserCreated | Auth | Create user profile |
| onUserDeleted | Auth | Delete user profile |

## Neuron Properties

- `activation` (0.0-1.0) - Current activation level
- `threshold` (default 0.7) - Firing threshold
- `decay` (default 0.1) - Decay rate per tick
- `fireCount` - Total times neuron has fired

## Synapse Properties

- `weight` (0.0-1.0) - Connection strength
- `plasticity` (default 0.05) - Learning rate

## Hebbian Learning

When a spike propagates through a synapse:
```
newWeight = min(1.0, weight + plasticity * spikeStrength)
```
Neurons that fire together, wire together.

## React Components

| Component | Description |
|-----------|-------------|
| NeuronList | Display neurons with activation bars, create/delete |
| SynapseList | Display synapses with weight bars, create/delete |
| SpikePanel | Display recent spike events |
| SignIn | Google authentication button |
| ErrorBoundary | Graceful error handling wrapper |
| StimulateButton | Button to increase neuron activation |
| NetworkSelector | Toggle between DMN/ECN/PFC networks |
| CreateSynapseForm | Form to connect two neurons |

## React Hooks

| Hook | Description |
|------|-------------|
| useNeurons | CRUD operations for neurons with real-time sync |
| useSynapses | CRUD operations for synapses with real-time sync |
| useSpikes | Read spike events with real-time sync |
| useUser | Current user profile |
| useStimulate | Stimulate neuron activation |
