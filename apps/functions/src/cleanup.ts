import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * When a neuron is deleted, clean up all connected synapses.
 */
export const onNeuronDeleted = functions.firestore
  .document('neurons/{neuronId}')
  .onDelete(async (snap, context) => {
    const neuronId = context.params.neuronId;

    // Find all synapses where this neuron is pre or post
    const [preSynapses, postSynapses] = await Promise.all([
      db.collection('synapses').where('preNeuronId', '==', neuronId).get(),
      db.collection('synapses').where('postNeuronId', '==', neuronId).get(),
    ]);

    const batch = db.batch();
    let count = 0;

    preSynapses.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
    });

    postSynapses.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
    });

    if (count > 0) {
      await batch.commit();
      functions.logger.info(`Deleted ${count} synapses for neuron ${neuronId}`);
    }
  });
