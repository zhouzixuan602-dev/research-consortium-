import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Create a user profile document when a new user signs up.
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user;

  await db.collection('users').doc(uid).set({
    uid,
    email: email || '',
    displayName: displayName || email?.split('@')[0] || 'Anonymous',
    photoURL: photoURL || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  functions.logger.info(`Created profile for user ${uid}`);
});

/**
 * Clean up user data when a user is deleted.
 */
export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  const { uid } = user;

  // Delete user profile
  await db.collection('users').doc(uid).delete();

  // Note: In production, you may want to also delete
  // or anonymize neurons/synapses created by this user

  functions.logger.info(`Deleted profile for user ${uid}`);
});
