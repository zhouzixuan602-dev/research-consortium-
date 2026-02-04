# Neural Web

Biomimetic research collaboration platform using Spike/Neuron/Synapse architecture.

## Structure

```
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── functions/    # Firebase Cloud Functions
├── packages/
│   └── shared/       # Shared types (Spike, Neuron, Synapse)
└── docs/             # Specifications
```

## Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Firebase Cloud Functions (Node 18)
- **Database**: Cloud Firestore
- **Auth**: Firebase Authentication (Google)

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   # Edit .env.local with your Firebase config
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Run Firebase emulators** (optional)
   ```bash
   npm run emulators
   ```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build all workspaces |
| `npm run deploy` | Deploy to Firebase |
| `npm run emulators` | Start Firebase emulators |

## Core Concepts

- **Neuron**: Node representing a concept, topic, or research area
- **Synapse**: Weighted connection between neurons
- **Spike**: Information impulse that propagates through the network

## License

MIT
