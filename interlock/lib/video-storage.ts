/**
 * IndexedDB-backed video storage so a presenter can pre-upload a clip
 * before going on stage. Persisted as a Blob in the `interlock-demo`
 * database under the `videos` object store, keyed by `current`.
 */

const DB = "interlock-demo";
const STORE = "videos";
const KEY = "current";

function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveDemoVideo(file: File): Promise<void> {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(file, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getDemoVideo(): Promise<Blob | null> {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve((req.result as Blob) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function clearDemoVideo(): Promise<void> {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Returns a usable video src (object URL) for the page, or null if no
 * file has been pre-uploaded. The caller is responsible for revoking
 * the URL via URL.revokeObjectURL when the video element unmounts.
 */
export async function getDemoVideoUrl(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const blob = await getDemoVideo();
    if (!blob) return null;
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}
