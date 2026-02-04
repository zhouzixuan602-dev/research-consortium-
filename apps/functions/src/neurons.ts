import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * When a neuron's activation exceeds threshold, it "fires"
 * and propagates spikes to connected neurons via synapses.
 */
export const onNeuronUpdated = functions.firestore
  .document('neurons/{neuronId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const neuronId = context.params.neuronId;

    // Check if neuron should fire (activation crossed threshold)
    if (before.activation < after.threshold && after.activation >= after.threshold) {
      // Neuron fires - increment fire count and record time
      await change.after.ref.update({
        fireCount: admin.firestore.FieldValue.increment(1),
        lastFiredAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Find outgoing synapses and create spikes
      const synapses = await db
        .collection('synapses')
        .where('preNeuronId', '==', neuronId)
        .get();

      const batch = db.batch();
      synapses.forEach((synapse) => {
        const data = synapse.data();
        const spikeRef = db.collection('spikes').doc();
        batch.set(spikeRef, {
          sourceNeuronId: neuronId,
          targetNeuronId: data.postNeuronId,
          strength: after.activation * data.weight,
          payload: { trigger: 'fire' },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          processed: false,
        });
      });

      await batch.commit();
      functions.logger.info(`Neuron ${neuronId} fired, created ${synapses.size} spikes`);
    }
  });

/**
 * Initialize default values when a neuron is created.
 */
export const onNeuronCreated = functions.firestore
  .document('neurons/{neuronId}')
  .onCreate(async (snap) => {
    const data = snap.data();
    const updates: Record<string, unknown> = {};

    if (data.threshold === undefined) updates.threshold = 0.7;
    if (data.decay === undefined) updates.decay = 0.1;
    if (data.activation === undefined) updates.activation = 0.0;
    if (data.fireCount === undefined) updates.fireCount = 0;

    if (Object.keys(updates).length > 0) {
      await snap.ref.update(updates);
    }
  });
