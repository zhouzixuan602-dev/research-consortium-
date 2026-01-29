import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

/**
 * Triggered when a new user signs up via Firebase Auth.
 * Creates an initial user profile document if it doesn't exist.
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const userRef = db.collection('users').doc(user.uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    await userRef.set({
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || null,
      bio: '',
      institution: '',
      researchInterests: [],
      profileCompleted: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info(`Created profile for new user: ${user.uid}`);
  }
});

/**
 * Triggered when a user is deleted from Firebase Auth.
 * Cleans up user data from Firestore.
 */
export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  const batch = db.batch();

  // Delete user profile
  batch.delete(db.collection('users').doc(user.uid));

  // Note: In production, you might want to also:
  // - Delete user's posts
  // - Delete user's messages
  // - Delete user's interests
  // This is left as a consideration for data retention policies

  await batch.commit();
  functions.logger.info(`Cleaned up data for deleted user: ${user.uid}`);
});

/**
 * Triggered when a message is created in a post.
 * Updates the message count on the parent post (backup mechanism).
 */
export const onMessageCreated = functions.firestore
  .document('posts/{postId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    const { postId } = context.params;

    try {
      await db.collection('posts').doc(postId).update({
        messageCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(`Incremented message count for post: ${postId}`);
    } catch (error) {
      functions.logger.error(`Failed to update message count for post ${postId}:`, error);
    }
  });

/**
 * Triggered when a message is deleted from a post.
 * Decrements the message count on the parent post.
 */
export const onMessageDeleted = functions.firestore
  .document('posts/{postId}/messages/{messageId}')
  .onDelete(async (snapshot, context) => {
    const { postId } = context.params;

    try {
      await db.collection('posts').doc(postId).update({
        messageCount: admin.firestore.FieldValue.increment(-1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(`Decremented message count for post: ${postId}`);
    } catch (error) {
      functions.logger.error(`Failed to update message count for post ${postId}:`, error);
    }
  });

/**
 * Triggered when an interest is created on a post.
 * Updates the interest count on the parent post (backup mechanism).
 */
export const onInterestCreated = functions.firestore
  .document('posts/{postId}/interests/{interestId}')
  .onCreate(async (snapshot, context) => {
    const { postId } = context.params;

    try {
      await db.collection('posts').doc(postId).update({
        interestCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(`Incremented interest count for post: ${postId}`);
    } catch (error) {
      functions.logger.error(`Failed to update interest count for post ${postId}:`, error);
    }
  });

/**
 * Triggered when an interest is removed from a post.
 * Decrements the interest count on the parent post.
 */
export const onInterestDeleted = functions.firestore
  .document('posts/{postId}/interests/{interestId}')
  .onDelete(async (snapshot, context) => {
    const { postId } = context.params;

    try {
      await db.collection('posts').doc(postId).update({
        interestCount: admin.firestore.FieldValue.increment(-1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(`Decremented interest count for post: ${postId}`);
    } catch (error) {
      functions.logger.error(`Failed to update interest count for post ${postId}:`, error);
    }
  });

/**
 * Callable function to create a new post.
 * Validates user has completed profile before allowing post creation.
 */
export const createPost = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to create a post.'
    );
  }

  const userId = context.auth.uid;

  // Check if user has completed profile
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'User profile not found.'
    );
  }

  const userData = userDoc.data();
  if (!userData?.profileCompleted) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Please complete your profile before creating a post.'
    );
  }

  // Validate required fields
  const { title, content, tags } = data;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Title is required.'
    );
  }

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Content is required.'
    );
  }

  // Create the post
  const postData = {
    authorId: userId,
    authorName: userData.displayName,
    authorPhotoURL: userData.photoURL || null,
    title: title.trim(),
    content: content.trim(),
    tags: Array.isArray(tags) ? tags.filter((t: any) => typeof t === 'string').slice(0, 10) : [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    messageCount: 0,
    interestCount: 0,
  };

  const postRef = await db.collection('posts').add(postData);

  functions.logger.info(`Created new post ${postRef.id} by user ${userId}`);

  return { postId: postRef.id };
});

/**
 * Scheduled function to recalculate message and interest counts.
 * Runs daily to fix any count inconsistencies.
 */
export const recalculateCounts = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const postsSnapshot = await db.collection('posts').get();

    const batch = db.batch();
    let updateCount = 0;

    for (const postDoc of postsSnapshot.docs) {
      const messagesSnapshot = await postDoc.ref.collection('messages').count().get();
      const interestsSnapshot = await postDoc.ref.collection('interests').count().get();

      const currentData = postDoc.data();
      const actualMessageCount = messagesSnapshot.data().count;
      const actualInterestCount = interestsSnapshot.data().count;

      if (currentData.messageCount !== actualMessageCount ||
          currentData.interestCount !== actualInterestCount) {
        batch.update(postDoc.ref, {
          messageCount: actualMessageCount,
          interestCount: actualInterestCount,
        });
        updateCount++;
      }
    }

    if (updateCount > 0) {
      await batch.commit();
      functions.logger.info(`Recalculated counts for ${updateCount} posts`);
    }
  });
