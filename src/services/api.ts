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

// Generate default realistic classes for today and tomorrow
export function getInitialSeedClasses(): VirtualClass[] {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  const formatTime = (h: number, m: number) => {
    const hh = String(h % 24).padStart(2, '0');
    const mm = String(Math.max(0, Math.min(59, m))).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const liveStart = formatTime(currentHour, Math.max(0, currentMin - 15));
  const liveEnd = formatTime(currentHour + 1, currentMin + 25);
  const upcomingStart = formatTime(currentHour + 1, currentMin + 30);
  const upcomingEnd = formatTime(currentHour + 2, currentMin + 15);
  const endedStart = formatTime(Math.max(0, currentHour - 2), 0);
  const endedEnd = formatTime(Math.max(0, currentHour - 1), 0);

  return [
    {
      id: 'cls-101',
      grade: 'Grade 10',
      section: 'A',
      subject: 'Mathematics',
      teacherName: 'Dr. Tariq Al-Hassan',
      date: todayStr,
      startTime: liveStart,
      endTime: liveEnd,
      zoomUrl: 'https://zoom.us/j/84930219482?pwd=MathGrade10Live',
      meetingId: '849 3021 9482',
      passcode: 'Math10A',
      topic: 'Chapter 5: Quadratic Functions & Parabolic Modeling',
      notes: 'Please open your textbook to page 142. Graphing calculators required.',
      colorTheme: 'blue',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cls-102',
      grade: 'Grade 10',
      section: 'A',
      subject: 'Advanced Physics',
      teacherName: 'Ms. Elena Rostova',
      date: todayStr,
      startTime: upcomingStart,
      endTime: upcomingEnd,
      zoomUrl: 'https://zoom.us/j/91284723901?pwd=PhysicsLab2026',
      meetingId: '912 8472 3901',
      passcode: 'Physics10',
      topic: 'Electromagnetic Induction & Faraday\'s Law Simulation',
      notes: 'Review the lab sheet uploaded on Google Classroom before joining.',
      colorTheme: 'indigo',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cls-103',
      grade: 'Grade 10',
      section: 'A',
      subject: 'English Literature',
      teacherName: 'Mr. Julian Vance',
      date: todayStr,
      startTime: endedStart,
      endTime: endedEnd,
      zoomUrl: 'https://zoom.us/j/77239104821',
      meetingId: '772 3910 4821',
      passcode: 'Hamlet10A',
      topic: 'Act III Soliloquy Analysis - Hamlet',
      notes: 'Completed session. Homework assignment due Sunday evening.',
      colorTheme: 'amber',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cls-104',
      grade: 'Grade 12',
      section: 'B',
      subject: 'Calculus BC',
      teacherName: 'Prof. Amira Mansoor',
      date: todayStr,
      startTime: liveStart,
      endTime: liveEnd,
      zoomUrl: 'https://zoom.us/j/93481239023?pwd=CalcBC2026',
      meetingId: '934 8123 9023',
      passcode: 'DerivativesBC',
      topic: 'Integration by Parts & Tabular Method',
      notes: 'AP Exam prep problem set walkthrough. Session will be recorded.',
      colorTheme: 'emerald',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cls-105',
      grade: 'Grade 9',
      section: 'C',
      subject: 'Biology',
      teacherName: 'Dr. Kareem Zaki',
      date: todayStr,
      startTime: liveStart,
      endTime: liveEnd,
      zoomUrl: 'https://zoom.us/j/64512938472',
      meetingId: '645 1293 8472',
      passcode: 'BioCell9',
      topic: 'Cellular Respiration: Krebs Cycle and Electron Transport',
      notes: 'Interactive quiz on Kahoot will be conducted in the last 15 minutes.',
      colorTheme: 'emerald',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cls-106',
      grade: 'KG1',
      section: 'A',
      subject: 'Phonics & Story Time',
      teacherName: 'Ms. Sarah Jenkins',
      date: todayStr,
      startTime: upcomingStart,
      endTime: upcomingEnd,
      zoomUrl: 'https://zoom.us/j/51298403918',
      meetingId: '512 9840 3918',
      passcode: 'KG1Stars',
      topic: 'Letter Sound /m/ and The Hungry Monster Storybook',
      notes: 'Parents please assist your little ones with drawing paper and colored crayons.',
      colorTheme: 'rose',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cls-107',
      grade: 'KG2',
      section: 'B',
      subject: 'Early Math & Shapes',
      teacherName: 'Ms. Layla Mahmoud',
      date: todayStr,
      startTime: liveStart,
      endTime: liveEnd,
      zoomUrl: 'https://zoom.us/j/82301923847',
      meetingId: '823 0192 3847',
      passcode: 'ShapesKG2',
      topic: 'Counting by 2s and Exploring 3D Solids (Cubes & Spheres)',
      notes: 'Bring 5 building blocks and a toy ball to class.',
      colorTheme: 'purple',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cls-108',
      grade: 'Grade 4',
      section: 'A',
      subject: 'Science Exploration',
      teacherName: 'Mr. Robert Chen',
      date: todayStr,
      startTime: upcomingStart,
      endTime: upcomingEnd,
      zoomUrl: 'https://zoom.us/j/49201948271',
      meetingId: '492 0194 8271',
      passcode: 'Sci4Rocks',
      topic: 'The Rock Cycle: Igneous, Sedimentary, and Metamorphic',
      notes: 'Have your science notebook ready. Video demonstration included.',
      colorTheme: 'teal',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cls-109',
      grade: 'Grade 7',
      section: 'A',
      subject: 'Computer Science',
      teacherName: 'Eng. Omar Farooq',
      date: todayStr,
      startTime: liveStart,
      endTime: liveEnd,
      zoomUrl: 'https://zoom.us/j/38291048291',
      meetingId: '382 9104 8291',
      passcode: 'Python7A',
      topic: 'Python Programming: Loops & Conditional Statements',
      notes: 'Please log into Replit before class begins.',
      colorTheme: 'cyan',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cls-110',
      grade: 'Grade 11',
      section: 'A',
      subject: 'Chemistry',
      teacherName: 'Dr. Nadia Qasim',
      date: tomorrowStr,
      startTime: '09:00',
      endTime: '09:45',
      zoomUrl: 'https://zoom.us/j/90281948102',
      meetingId: '902 8194 8102',
      passcode: 'Chem11Orbit',
      topic: 'Quantum Numbers & Electron Configuration Practice',
      notes: 'Periodic tables must be available at hand.',
      colorTheme: 'amber',
      createdAt: new Date().toISOString(),
    }
  ];
}

// Test connection on startup
testConnection().catch(console.warn);

/**
 * Real-time listener for Firestore classes
 * Automatically updates whenever any teacher creates, modifies, or deletes a class.
 */
export function subscribeToClasses(
  callback: (classes: VirtualClass[]) => void,
  onError?: (err: any) => void
): () => void {
  const colRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    colRef,
    async (snapshot) => {
      // If collection is completely empty, seed it with initial schedule
      if (snapshot.empty) {
        try {
          const seeds = getInitialSeedClasses();
          const batch = writeBatch(db);
          for (const item of seeds) {
            const docRef = doc(db, COLLECTION_NAME, item.id);
            batch.set(docRef, item);
          }
          await batch.commit();
          callback(seeds);
          return;
        } catch (e) {
          console.warn('Initial seed failed:', e);
        }
      }

      const list: VirtualClass[] = [];
      snapshot.forEach((docSnap) => {
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

    if (snapshot.empty) {
      // Seed collection
      const seeds = getInitialSeedClasses();
      const batch = writeBatch(db);
      for (const item of seeds) {
        batch.set(doc(db, COLLECTION_NAME, item.id), item);
      }
      await batch.commit();
      return seeds;
    }

    const list: VirtualClass[] = [];
    snapshot.forEach((docSnap) => {
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
        return JSON.parse(cached);
      } catch {}
    }
    return getInitialSeedClasses();
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
 * Teacher login authentication
 */
export async function loginTeacher(password: string): Promise<{ success: boolean; name?: string; error?: string }> {
  const validPassword = 'Meis13579';
  if (password.trim() === validPassword) {
    return { success: true, name: 'Faculty & Teacher Administration' };
  }
  return { success: false, error: 'Incorrect password. Please enter the authorized faculty access code.' };
}

/**
 * Reset Firestore collection with sample schedules
 */
export async function resetDatabase(): Promise<VirtualClass[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const existing = await getDocs(colRef);
    const batch = writeBatch(db);

    existing.forEach((d) => {
      batch.delete(d.ref);
    });

    const seeds = getInitialSeedClasses();
    seeds.forEach((item) => {
      batch.set(doc(db, COLLECTION_NAME, item.id), item);
    });

    await batch.commit();
    return seeds;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
  }
}
