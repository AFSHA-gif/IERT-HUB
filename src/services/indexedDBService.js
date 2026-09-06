// IndexedDB storage engine for storing PDF file Blobs locally during demo mode

const DB_NAME = 'IERT_HUB_DB';
const DB_VERSION = 1;
const STORE_NAME = 'pdf_blobs';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject('IndexedDB open error: ' + event.target.error);
    };
  });
}

export async function savePdfBlob(id, blob) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(blob, id);

    request.onsuccess = () => resolve(id);
    request.onerror = (event) => reject('Failed to store PDF blob: ' + event.target.error);
  });
}

export async function getPdfBlob(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject('Failed to retrieve PDF blob: ' + event.target.error);
  });
}

export async function deletePdfBlob(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = (event) => reject('Failed to delete PDF blob: ' + event.target.error);
  });
}
