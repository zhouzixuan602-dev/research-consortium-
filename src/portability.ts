import { db } from './db';

export async function exportAllData(): Promise<string> {
  const [users, posts, messages, interests, spikes, neurons, synapses] =
    await Promise.all([
      db.users.toArray(),
      db.posts.toArray(),
      db.messages.toArray(),
      db.interests.toArray(),
      db.spikes.toArray(),
      db.neurons.toArray(),
      db.synapses.toArray(),
    ]);

  return JSON.stringify(
    { users, posts, messages, interests, spikes, neurons, synapses, exportedAt: Date.now() },
    null,
    2
  );
}

export async function importAllData(json: string): Promise<void> {
  const data = JSON.parse(json);

  await db.transaction(
    'rw',
    [db.users, db.posts, db.messages, db.interests, db.spikes, db.neurons, db.synapses],
    async () => {
      await db.users.clear();
      await db.posts.clear();
      await db.messages.clear();
      await db.interests.clear();
      await db.spikes.clear();
      await db.neurons.clear();
      await db.synapses.clear();

      if (data.users) await db.users.bulkAdd(data.users);
      if (data.posts) await db.posts.bulkAdd(data.posts);
      if (data.messages) await db.messages.bulkAdd(data.messages);
      if (data.interests) await db.interests.bulkAdd(data.interests);
      if (data.spikes) await db.spikes.bulkAdd(data.spikes);
      if (data.neurons) await db.neurons.bulkAdd(data.neurons);
      if (data.synapses) await db.synapses.bulkAdd(data.synapses);
    }
  );
}

export function downloadJson(json: string, filename: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
