import { openDB } from 'idb';

const DB_NAME = 'coflow-db';
const STORE_NAME = 'hackathons';

// Ensure IndexedDB runs only in the browser
const isBrowser = typeof window !== 'undefined';

export const dbPromise = isBrowser
  ? openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    })
  : Promise.resolve(null);

// SAVE ALL to a store...
export const saveToIndexedDB = async (hackathons = [], stores = 'hackathons') => {
  const db = await dbPromise;
  if (!db) return { success: false, msg: `IndexedDB not available!` };
  if (!db.objectStoreNames.contains(stores)) {
    // Ensure 'saved' store exists
    return { success: false, msg: `Object store not Found!` };
  }

  const tx = db.transaction(stores, 'readwrite');
  const store = tx.objectStore(stores);

  await store.clear(); // Clear old data before saving new

  let i = 0;
  for (const hackathon of hackathons) {
    await store.put({ ...hackathon, id: hackathon._id });
    if (i === 29) break;
    i += 1;
  }
  await tx.done;
  return { success: true, msg: 'Hackathons cached locally' };
};

// GET ALL items from a store...
export const getFromIndexedDB = async (stores = 'hackathons') => {
  const db = await dbPromise;
  if (!db) return { success: false, msg: `IndexedDB not available!`, data: [] };
  if (!db.objectStoreNames.contains(stores)) {
    // Ensure 'saved' store exists
    return { success: false, msg: `Object store not Found!`, data: [] };
  }

  const all = await db.getAll(stores);
  return { success: true, data: all };
};
