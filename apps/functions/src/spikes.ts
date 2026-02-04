import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Process incoming spikes - update target neuron activation
 * and strengthen the synapse (Hebbian learning).
 */
export const onSpikeCreated = functions.firestore
  .document('spikes/{spikeId}')
  .onCreate(async (snap, context) => {
    const spike = snap.data();
    const { targetNeuronId, sourceNeuronId, strength } = spike;

    // Mark spike as processed
    await snap.ref.update({ processed: true });

    // Update target neuron activation
    const neuronRef = db.collection('neurons').doc(targetNeuronId);
    const neuronSnap = await neuronRef.get();

    if (!neuronSnap.exists) {
      functions.logger.warn(`Target neuron ${targetNeuronId} not found`);
      return;
    }

    const neuron = neuronSnap.data()!;
    const newActivation = Math.min(1.0, neuron.activation + strength);

    await neuronRef.update({
      activation: newActivation,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Strengthen synapse (Hebbian learning: "neurons that fire together, wire together")
    const synapseQuery = await db
      .collection('synapses')
      .where('preNeuronId', '==', sourceNeuronId)
      .where('postNeuronId', '==', targetNeuronId)
      .limit(1)
      .get();

    if (!synapseQuery.empty) {
      const synapseDoc = synapseQuery.docs[0];
      const synapse = synapseDoc.data();
      const newWeight = Math.min(1.0, synapse.weight + synapse.plasticity * strength);

      await synapseDoc.ref.update({
        weight: newWeight,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(
        `Spike processed: ${sourceNeuronId} -> ${targetNeuronId}, synapse weight: ${newWeight.toFixed(3)}`
      );
    }
  });
