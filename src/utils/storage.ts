// IndexedDB persistent storage utility for large custom page images (bypasses localStorage 5MB limit)

const DB_NAME = "FoldStudioCustomPagesDB";
const STORE_NAME = "custom_page_images";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "pageId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a single page's custom image URL (data URI or blob)
 */
export async function savePageImage(pageId: string, imageUrl: string | undefined): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    if (!imageUrl) {
      store.delete(pageId);
    } else {
      store.put({ pageId, imageUrl, updatedAt: Date.now() });
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error("Failed to save image to IndexedDB:", err);
  }
}

/**
 * Batch save multiple page custom images
 */
export async function batchSavePageImages(updates: { pageId: string; imageUrl: string }[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    for (const item of updates) {
      store.put({ pageId: item.pageId, imageUrl: item.imageUrl, updatedAt: Date.now() });
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error("Failed to batch save images to IndexedDB:", err);
  }
}

/**
 * Load all custom page images from IndexedDB
 */
export async function loadAllPageImages(): Promise<Record<string, string>> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const results = request.result || [];
        const map: Record<string, string> = {};
        for (const item of results) {
          if (item.pageId && item.imageUrl) {
            map[item.pageId] = item.imageUrl;
          }
        }
        resolve(map);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Failed to load images from IndexedDB:", err);
    return {};
  }
}

/**
 * Clear all custom page images
 */
export async function clearAllPageImages(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.clear();

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error("Failed to clear images from IndexedDB:", err);
  }
}
