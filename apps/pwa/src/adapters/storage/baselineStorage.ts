/**
 * IndexedDB Baseline Storage Adapter
 * Persists and hydrates the WearableBaseline and BaselineSnapshot.
 * This is NOT a port — it's an infrastructure helper used by the PWA
 * to feed pre-loaded snapshots into safety-core pure functions.
 */

import type { BaselineSnapshot } from "@uicare-hui/safety-core";

const DB_NAME = "uicare-safety";
const DB_VERSION = 1;
const STORE = "baseline";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "userId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadBaselineSnapshot(userId: string): Promise<BaselineSnapshot | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.get(userId);
    req.onsuccess = () => resolve(req.result?.snapshot ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveBaselineSnapshot(
  userId: string,
  snapshot: BaselineSnapshot
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.put({ userId, snapshot });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
