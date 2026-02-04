import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const db = admin.firestore();

// Health check endpoint
export const healthCheck = functions.https.onRequest((req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
