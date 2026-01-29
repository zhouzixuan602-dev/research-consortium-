# Research Consortium - Firebase Setup Guide

Complete guide to set up Firebase for the Neural Web application.

## Firebase Schema

### Firestore Collections

```
/users/{userId}
├── uid: string              // Firebase Auth UID
├── email: string            // User email
├── displayName: string      // Display name
├── photoURL: string | null  // Profile photo URL
├── bio: string              // User biography
├── institution: string      // University/organization
├── researchInterests: string[]  // Array of interests
├── profileCompleted: boolean    // True if profile is complete
├── createdAt: Timestamp     // Account creation time
└── updatedAt: Timestamp     // Last update time

/posts/{postId}
├── authorId: string         // Author's UID
├── authorName: string       // Author's display name
├── authorPhotoURL: string | null  // Author's photo URL
├── title: string            // Post title
├── content: string          // Post content
├── tags: string[]           // Array of tags
├── createdAt: Timestamp     // Post creation time
├── updatedAt: Timestamp     // Last update time
├── messageCount: number     // Number of messages
├── interestCount: number    // Number of interested users
│
├── /messages/{messageId}    // Subcollection
│   ├── postId: string       // Parent post ID
│   ├── authorId: string     // Message author UID
│   ├── authorName: string   // Author's display name
│   ├── authorPhotoURL: string | null
│   ├── content: string      // Message text (max 10k chars)
│   └── createdAt: Timestamp
│
└── /interests/{userId}      // Subcollection (doc ID = user UID)
    ├── postId: string       // Parent post ID
    ├── userId: string       // Interested user's UID
    ├── userName: string     // User's display name
    ├── userPhotoURL: string | null
    └── createdAt: Timestamp
```

### Storage Structure

```
/users/{userId}/profile/    // User profile photos
/posts/{postId}/            // Post attachments (future)
```

---

## Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name (e.g., "research-consortium")
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Firebase Services

#### Authentication
1. Go to **Build > Authentication**
2. Click "Get started"
3. Enable **Email/Password** provider
4. Enable **Google** provider:
   - Add support email
   - Save

#### Firestore Database
1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **Production mode**
4. Select region closest to your users
5. Click "Enable"

#### Storage
1. Go to **Build > Storage**
2. Click "Get started"
3. Accept default security rules (we'll update them)
4. Select same region as Firestore
5. Click "Done"

### 3. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click web icon (</>) to add a web app
4. Register app with nickname
5. Copy the `firebaseConfig` object

### 4. Configure Environment Variables

Create `.env` file in project root:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_USE_EMULATORS=false
```

### 5. Deploy Security Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (select existing project)
firebase init

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### 6. Deploy Cloud Functions

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy functions
firebase deploy --only functions
```

### 7. Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

---

## Local Development with Emulators

### Start Emulators

```bash
# Start all emulators
firebase emulators:start

# Or start specific emulators
firebase emulators:start --only auth,firestore,storage,functions
```

### Configure App for Emulators

Set in `.env`:

```env
REACT_APP_USE_EMULATORS=true
```

Emulator UI available at: http://localhost:4000

---

## Cloud Functions Reference

| Function | Trigger | Description |
|----------|---------|-------------|
| `onUserCreated` | Auth onCreate | Creates user profile document |
| `onUserDeleted` | Auth onDelete | Cleans up user data |
| `onMessageCreated` | Firestore onCreate | Increments message count |
| `onMessageDeleted` | Firestore onDelete | Decrements message count |
| `onInterestCreated` | Firestore onCreate | Increments interest count |
| `onInterestDeleted` | Firestore onDelete | Decrements interest count |
| `createPost` | HTTPS Callable | Creates new post with validation |
| `recalculateCounts` | Scheduled (daily) | Fixes count inconsistencies |

---

## Security Rules Summary

### Users Collection
- **Read**: Public (for displaying author info)
- **Create**: Owner only, requires uid and email
- **Update**: Owner only, cannot change email
- **Delete**: Not allowed

### Posts Collection
- **Read**: Public
- **Create**: Authenticated + completed profile
- **Update**: Author (full), others (counts only)
- **Delete**: Author only

### Messages Subcollection
- **Read**: Public
- **Create**: Authenticated + completed profile, max 10k chars
- **Update**: Author only
- **Delete**: Author only

### Interests Subcollection
- **Read**: Public
- **Create**: Authenticated + completed profile, doc ID = user UID
- **Update**: Not allowed
- **Delete**: Owner only

---

## Running the App

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

App runs at: http://localhost:3000

---

## Troubleshooting

### "Permission denied" errors
- Ensure user has completed profile (`profileCompleted: true`)
- Check security rules are deployed
- Verify authentication state

### Real-time updates not working
- Check `onSnapshot` listener is set up correctly
- Verify Firestore rules allow reads
- Check browser console for errors

### Cloud Functions not triggering
- Ensure functions are deployed
- Check function logs: `firebase functions:log`
- Verify Firestore triggers match document paths
