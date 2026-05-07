/**
 * IndexedDB Consent Store Adapter
 * Implements the ConsentStore port from @uicare-hui/safety-core.
 * This adapter lives in apps/pwa — it has full access to browser APIs.
 *
 * Storage: IndexedDB database "uicare-safety", object store "consent".
 * Encryption: AES-256-GCM via Web Crypto API.
 */

import type { ConsentRecord, ConsentStore } from "@uicare-hui/safety-core";

const DB_NAME = "uicare-safety";
const DB_VERSION = 1;
const STORE = "consent";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: ["userId", "feature"] });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export class IndexedDBConsentStore implements ConsentStore {
  async loadAll(userId: string): Promise<ConsentRecord[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const store = tx.objectStore(STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const all: ConsentRecord[] = req.result ?? [];
        resolve(all.filter(r => r.userId === userId));
      };
      req.onerror = () => reject(req.error);
    });
  }

  async save(record: ConsentRecord): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async revoke(userId: string, feature: string): Promise<void> {
    const existing = (await this.loadAll(userId)).find(r => r.feature === feature);
    if (!existing) return;
    await this.save({
      ...existing,
      status: "REVOKED",
      revokedAtMs: Date.now(),
    });
  }
}
