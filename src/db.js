import { openDB } from 'idb';

const DB_NAME = 'RestaurantPOS';
const STORE_NAME = 'offlineOrders';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'tempId' });
      }
    },
  });
};

export const saveOrderOffline = async (order) => {
  const db = await initDB();
  await db.put(STORE_NAME, { ...order, tempId: Date.now() });
};

export const getAllOfflineOrders = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const clearOfflineOrders = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).clear();
  await tx.done;
};