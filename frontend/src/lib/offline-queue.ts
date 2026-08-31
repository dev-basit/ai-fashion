import { openDB } from "idb";

export interface QueuedAction {
  id: string;
  method: "POST" | "PATCH";
  url: string;
  payload: unknown;
  invalidateKeys: unknown[][];
  label: string;
  createdAt: number;
}

const DB_NAME = "glow-offline-queue";
const STORE = "actions";

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    },
  });
}

export async function enqueueAction(action: QueuedAction): Promise<void> {
  const db = await getDb();
  await db.put(STORE, action);
}

export async function getAllActions(): Promise<QueuedAction[]> {
  const db = await getDb();
  const all = await db.getAll(STORE);
  return all.sort((a, b) => a.createdAt - b.createdAt);
}

export async function removeAction(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE, id);
}
