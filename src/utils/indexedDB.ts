/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/indexedDB.ts
class IndexedDBService {
  private dbName = 'NexusMediaDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('directoryHandles')) {
          db.createObjectStore('directoryHandles', { keyPath: 'name' });
        }
      };
    });
  }

  async saveDirectoryHandle(name: string, handle: any): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['directoryHandles'], 'readwrite');
      const store = transaction.objectStore('directoryHandles');
      const request = store.put({ name, handle });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getDirectoryHandle(name: string): Promise<any> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['directoryHandles'], 'readonly');
      const store = transaction.objectStore('directoryHandles');
      const request = store.get(name);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.handle || null);
    });
  }

  async deleteDirectoryHandle(name: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['directoryHandles'], 'readwrite');
      const store = transaction.objectStore('directoryHandles');
      const request = store.delete(name);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const indexedDBService = new IndexedDBService();