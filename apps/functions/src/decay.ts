import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Scheduled function to decay neuron activations.
 * Runs every minute to simulate natural decay of neural activity.
 */
export const decayNeuronActivations = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async () => {
    const neuronsSnap = await db
      .collection('neurons')
      .where('activation', '>', 0)
      .get();

    if (neuronsSnap.empty) {
      functions.logger.info('No active neurons to decay');
      return;
    }

    const batch = db.batch();
    let decayedCount = 0;

    neuronsSnap.forEach((doc) => {
      const neuron = doc.data();
      const decayAmount = neuron.decay || 0.1;
      const newActivation = Math.max(0, neuron.activation - decayAmount);

      batch.update(doc.ref, {
        activation: newActivation,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      decayedCount++;
    });

    await batch.commit();
    functions.logger.info(`Decayed activation for ${decayedCount} neurons`);
  });
