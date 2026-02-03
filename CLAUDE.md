# CLAUDE.md - AI Assistant Guide for Research Consortium

This document provides essential context for AI assistants working with the Research Consortium codebase.

## Project Overview

**Research Consortium** is a full-stack web application ("Neural Web") that enables researchers to discover, share, and discuss research across disciplines. It's built with React/TypeScript frontend and Firebase backend (Firestore, Auth, Cloud Functions, Storage).

## Quick Reference

```bash
# Development
npm start                              # Start React dev server (port 3000)
npm test                               # Run tests
npm run build                          # Production build

# Firebase
firebase emulators:start               # Start all emulators (Auth:9099, Firestore:8080, Functions:5001, Storage:9199, UI:4000)
firebase deploy                        # Deploy all
firebase deploy --only functions       # Deploy Cloud Functions
firebase deploy --only firestore:rules # Deploy security rules

# Cloud Functions
cd functions && npm run build          # Compile TypeScript
cd functions && npm run serve          # Local emulation
```

## Project Structure

```
/
├── src/                          # React frontend
│   ├── components/               # UI components (co-located CSS)
│   │   ├── Auth/                 # AuthModal, ProfileForm
│   │   ├── Header/               # Navigation header
│   │   └── NeuralWeb/            # Feed, PostCard, PostModal, Messages
│   ├── contexts/AuthContext.tsx  # Authentication state
│   ├── hooks/                    # Custom hooks (usePosts, useMessages, useInterest)
│   ├── types/index.ts            # TypeScript interfaces
│   ├── firebase/config.ts        # Firebase initialization
│   └── App.tsx                   # Main application component
├── functions/                    # Firebase Cloud Functions
│   └── src/index.ts              # All function definitions
├── public/                       # Static assets
├── firestore.rules               # Database security rules
├── storage.rules                 # Storage security rules
├── firebase.json                 # Firebase configuration
└── .env.example                  # Environment template
```

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | React | 18.2.0 |
| Language | TypeScript | 5.3.3 |
| Build | Create React App | 5.0.1 |
| Backend | Firebase | 10.7.1 |
| Functions | firebase-functions | 4.5.0 |
| Runtime | Node.js | 18 |

## Data Models

### Core Types (defined in `src/types/index.ts`)

```typescript
// User profile stored in /users/{userId}
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  bio: string;
  institution: string;
  researchInterests: string[];
  profileCompleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Research post stored in /posts/{postId}
interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  title: string;
  content: string;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  messageCount: number;
  interestCount: number;
}

// Message stored in /posts/{postId}/messages/{messageId}
interface Message {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  content: string;
  createdAt: Timestamp;
}

// Interest stored in /posts/{postId}/interests/{userId}
interface Interest {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  createdAt: Timestamp;
}
```

## Cloud Functions Reference

| Function | Trigger | Purpose |
|----------|---------|---------|
| `onUserCreated` | Auth onCreate | Auto-create user profile document |
| `onUserDeleted` | Auth onDelete | Clean up user data from Firestore |
| `onMessageCreated` | Firestore onCreate | Increment message count on post |
| `onMessageDeleted` | Firestore onDelete | Decrement message count on post |
| `onInterestCreated` | Firestore onCreate | Increment interest count on post |
| `onInterestDeleted` | Firestore onDelete | Decrement interest count on post |
| `createPost` | HTTPS Callable | Validate & create new posts |
| `recalculateCounts` | PubSub (24h) | Fix count inconsistencies daily |

## Security Rules Summary

### Firestore Access Control
- **Users**: Public read, owner-only create/update, no delete
- **Posts**: Public read, auth+profile required to create, author-only update/delete
- **Messages**: Public read, auth+profile required, max 10,000 chars, author-only edit/delete
- **Interests**: Public read, auth+profile required, document ID must match user UID

### Key Security Functions
```javascript
isAuthenticated()     // Check if user is signed in
isOwner(userId)       // Verify ownership
hasCompletedProfile() // Check profile completion status
```

## Code Conventions

### React Patterns
- **Functional components** with hooks only
- **Custom hooks** for business logic (`usePosts`, `useMessages`, `useInterest`)
- **Context API** for global state (`AuthContext`)
- **Real-time listeners** using `onSnapshot`
- **Modal pattern** with Escape key and outside-click handlers

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `PostCard`, `MessageInput` |
| Hooks | camelCase with `use` prefix | `usePosts`, `useInterest` |
| CSS classes | kebab-case | `post-card`, `auth-modal` |
| Firebase paths | lowercase | `posts`, `users` |
| Files | Match export name | `PostCard.tsx`, `usePosts.ts` |

### CSS Organization
- Co-located with components (`Component.tsx` + `Component.css`)
- BEM-like naming: `block-element-modifier`
- Vanilla CSS, no frameworks
- Import in component file: `import './Component.css'`

### TypeScript Conventions
- Strict mode enabled
- All types centralized in `src/types/index.ts`
- Interface-based component props
- Use Timestamp from `firebase/firestore` for dates

## Firebase Patterns

### Collection References
```typescript
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const postsRef = collection(db, 'posts');
const postDoc = doc(db, 'posts', postId);
const messagesRef = collection(db, 'posts', postId, 'messages');
```

### Real-time Listeners
```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(query, (snapshot) => {
    // Handle data
  });
  return () => unsubscribe(); // Cleanup
}, [dependencies]);
```

### Server Timestamps
```typescript
import { serverTimestamp } from 'firebase/firestore';
// Always use serverTimestamp() for createdAt/updatedAt
```

### Atomic Counter Updates
```typescript
import { increment } from 'firebase/firestore';
await updateDoc(postRef, { messageCount: increment(1) });
```

## Environment Variables

Required in `.env` (see `.env.example`):
```
REACT_APP_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID
REACT_APP_USE_EMULATORS=false  # Set true for local development
```

## Common Tasks

### Adding a New Component
1. Create folder in `src/components/` (e.g., `NewFeature/`)
2. Create `NewFeature.tsx` with typed props interface
3. Create `NewFeature.css` with scoped class names
4. Export from component file

### Adding a New Hook
1. Create file in `src/hooks/` (e.g., `useNewFeature.ts`)
2. Follow existing patterns for Firestore listeners
3. Return cleanup function from useEffect

### Adding a Cloud Function
1. Add function in `functions/src/index.ts`
2. Export it from the module
3. Run `npm run build` in functions directory
4. Deploy with `firebase deploy --only functions`

### Modifying Security Rules
1. Edit `firestore.rules` or `storage.rules`
2. Test with emulators: `firebase emulators:start`
3. Deploy: `firebase deploy --only firestore:rules`

## Important Constraints

1. **Profile completion required**: Users must complete their profile before creating posts or messages
2. **Message length limit**: 10,000 characters max
3. **Storage limits**: Profile photos max 5MB (images only), post attachments max 10MB (images/PDFs)
4. **Email immutable**: User email cannot be changed after account creation
5. **Interest document ID**: Must match the user's UID for proper access control

## Testing

```bash
npm test                    # Run React tests with Jest
npm test -- --coverage      # With coverage report
npm test -- --watchAll=false # CI mode
```

## Deployment Checklist

1. Ensure all environment variables are set in production
2. Run `npm run build` and verify no errors
3. Deploy in order:
   - Security rules: `firebase deploy --only firestore:rules,storage:rules`
   - Functions: `firebase deploy --only functions`
   - Indexes: `firebase deploy --only firestore:indexes`
   - Hosting (if applicable)

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Emulators not starting | Check if ports 9099, 8080, 5001, 9199, 4000 are available |
| Functions not deploying | Run `npm run build` in functions/ first |
| Auth not working locally | Set `REACT_APP_USE_EMULATORS=true` |
| Permission denied errors | Check security rules and profile completion status |
| Count mismatch | Wait for scheduled `recalculateCounts` or trigger manually |

### Useful Commands
```bash
firebase emulators:start --import=./emulator-data  # Start with saved data
firebase emulators:export ./emulator-data          # Save emulator data
firebase functions:log                              # View function logs
```

## File Reference

| File | Purpose |
|------|---------|
| `src/App.tsx` | Root component, routing logic |
| `src/contexts/AuthContext.tsx` | Auth state provider |
| `src/firebase/config.ts` | Firebase initialization |
| `src/types/index.ts` | All TypeScript interfaces |
| `functions/src/index.ts` | All Cloud Functions |
| `firestore.rules` | Database access rules |
| `storage.rules` | File storage access rules |
| `firebase.json` | Firebase project config |
| `FIREBASE_SETUP.md` | Detailed setup documentation |
