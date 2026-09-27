import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testConnection } from './firebase';
import { VirtualClass } from '../types';

const COLLECTION_NAME = 'classes';
const STORAGE_KEY = 'meis_virtual_classes_cache';

// Test connection on startup
testConnection().catch(console.warn);

// Purge any dummy seed classes from previous setup if present
const DUMMY_IDS = [
  'cls-101', 'cls-102', 'cls-103', 'cls-104', 'cls-105', 'cls-106',
  'cls-107', 'cls-108', 'cls-109', 'cls-110', 'cls-111', 'cls-112'
];

async function purgeLegacyDummyClasses() {
  try {
    const batch = writeBatch(db);
    let hasDummy = false;
    for (const id of DUMMY_IDS) {
      batch.delete(doc(db, COLLECTION_NAME, id));
      hasDummy = true;
    }
    if (hasDummy) {
      await batch.commit().catch(() => {});
    }
    // Also clean localStorage cache if it contains dummy classes
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((c: any) => !DUMMY_IDS.includes(c.id));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
        }
      } catch {}
    }
  } catch {}
}

purgeLegacyDummyClasses();

/**
 * Real-time listener for Firestore classes
 * Starts clean with 0 classes until teachers upload them.
 */
export function subscribeToClasses(
  callback: (classes: VirtualClass[]) => void,
  onError?: (err: any) => void
): () => void {
  const colRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: VirtualClass[] = [];
      snapshot.forEach((docSnap) => {
        // Exclude any legacy dummy classes
        if (DUMMY_IDS.includes(docSnap.id)) {
          deleteDoc(doc(db, COLLECTION_NAME, docSnap.id)).catch(() => {});
          return;
        }
        const data = docSnap.data() as VirtualClass;
        list.push({ ...data, id: docSnap.id });
      });

      // Sort by date, then startTime
      list.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      callback(list);
    },
    (error) => {
      console.error('Error listening to classes:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    }
  );
}

/**
 * Fetch all classes once from Firestore
 */
export async function fetchClasses(): Promise<VirtualClass[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);

    const list: VirtualClass[] = [];
    snapshot.forEach((docSnap) => {
      if (DUMMY_IDS.includes(docSnap.id)) {
        deleteDoc(doc(db, COLLECTION_NAME, docSnap.id)).catch(() => {});
        return;
      }
      list.push({ ...(docSnap.data() as VirtualClass), id: docSnap.id });
    });

    list.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list;
  } catch (err) {
    console.warn('Firestore fetch failed, checking cached local data:', err);
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return Array.isArray(parsed) ? parsed.filter((c: any) => !DUMMY_IDS.includes(c.id)) : [];
      } catch {}
    }
    return [];
  }
}

/**
 * Create a new virtual class in Cloud Firestore
 */
export async function createClass(classData: Omit<VirtualClass, 'id' | 'createdAt'>): Promise<VirtualClass> {
  const newId = `cls-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const item: VirtualClass = {
    ...classData,
    id: newId,
    createdAt: new Date().toISOString(),
  };

  const docRef = doc(db, COLLECTION_NAME, newId);
  try {
    await setDoc(docRef, item);
    return item;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${newId}`);
  }
}

/**
 * Update an existing class in Cloud Firestore
 */
export async function updateClass(id: string, updates: Partial<VirtualClass>): Promise<VirtualClass> {
  const docRef = doc(db, COLLECTION_NAME, id);
  try {
    await updateDoc(docRef, updates as any);
    return { ...updates, id } as VirtualClass;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

/**
 * Delete a class from Cloud Firestore
 */
export async function deleteClass(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}

/**
 * Clear all classes from Cloud Firestore
 */
export async function clearAllClasses(): Promise<void> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const existing = await getDocs(colRef);
    const batch = writeBatch(db);

    existing.forEach((d) => {
      batch.delete(d.ref);
    });

    await batch.commit();
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
  }
}

/**
 * Teacher login authentication
 */
export async function loginTeacher(password: string): Promise<{ success: boolean; name?: string; error?: string }> {
  const validPassword = 'Meis13579';
  if (password.trim() === validPassword) {
    return { success: true, name: 'Faculty & Teacher Administration' };
  }
  return { success: false, error: 'Incorrect password. Please enter the authorized faculty access code.' };
}
