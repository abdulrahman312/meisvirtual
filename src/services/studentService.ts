import studentsData from '../data/students.json';

export interface StudentRecord {
  name: string;
  iqama: string;
  grade: string;
  section: string; // e.g. 'A', 'B', ..., 'No Section'
}

export interface SheetConfig {
  sheetUrl: string;
  lastSynced: string | null;
  studentCount: number;
}

export const DEFAULT_SHEET_ID = '1ABOUxIdBBw0WU9sGoYL3rmvFlJ5R7metUUF2btyeyLM';
export const DEFAULT_SHEET_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_SHEET_ID}/edit`;

const studentsMap: Record<string, StudentRecord> = { ...(studentsData as Record<string, StudentRecord>) };

const STUDENT_STORAGE_KEY = 'meis_authenticated_student';

/**
 * Find student by Iqama or Student ID.
 * Queries the live server endpoint (/api/students/verify) which can check the live Google Sheet,
 * and falls back to local data if server is unreachable.
 */
export async function findStudentByIqama(input: string): Promise<StudentRecord | null> {
  if (!input) return null;
  // Clean input: remove whitespace, dashes, leading/trailing spaces
  const cleaned = input.trim().replace(/[-\s]/g, '');
  if (!cleaned) return null;

  try {
    const res = await fetch('/api/students/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ iqama: cleaned }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.student) {
        // Cache locally
        studentsMap[cleaned] = data.student;
        return data.student;
      }
    }
  } catch (err) {
    console.warn('Server verify offline or unreachable, checking local database:', err);
  }

  // Fallback to local map
  if (studentsMap[cleaned]) {
    return studentsMap[cleaned];
  }

  // Also check without leading zero or with leading zero just in case
  const match = Object.values(studentsMap).find(
    (s) => s.iqama === cleaned || s.iqama.replace(/^0+/, '') === cleaned.replace(/^0+/, '')
  );

  return match || null;
}

/**
 * Synchronous local lookup (for immediate checks)
 */
export function findStudentByIqamaSync(input: string): StudentRecord | null {
  if (!input) return null;
  const cleaned = input.trim().replace(/[-\s]/g, '');
  if (!cleaned) return null;

  if (studentsMap[cleaned]) {
    return studentsMap[cleaned];
  }

  return (
    Object.values(studentsMap).find(
      (s) => s.iqama === cleaned || s.iqama.replace(/^0+/, '') === cleaned.replace(/^0+/, '')
    ) || null
  );
}

/**
 * Get Google Sheet config and sync status
 */
export async function fetchSheetConfig(): Promise<SheetConfig> {
  try {
    const res = await fetch('/api/sheet/config');
    if (res.ok) {
      const data = await res.json();
      return {
        sheetUrl: data.sheetUrl || '',
        lastSynced: data.lastSynced || null,
        studentCount: data.studentCount || Object.keys(studentsMap).length,
      };
    }
  } catch (err) {
    console.error('Failed to fetch sheet config:', err);
  }
  return {
    sheetUrl: DEFAULT_SHEET_URL,
    lastSynced: null,
    studentCount: Object.keys(studentsMap).length,
  };
}

/**
 * Save Google Sheet URL and immediately sync students
 */
export async function saveSheetConfig(sheetUrl: string): Promise<{
  success: boolean;
  message: string;
  studentCount?: number;
  lastSynced?: string;
}> {
  const res = await fetch('/api/sheet/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheetUrl }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to connect Google Sheet.');
  }

  return data;
}

/**
 * Manually trigger re-sync from configured Google Sheet
 */
export async function syncGoogleSheet(): Promise<{
  success: boolean;
  message: string;
  studentCount?: number;
  lastSynced?: string;
}> {
  const res = await fetch('/api/sheet/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to sync Google Sheet.');
  }

  return data;
}

/**
 * Fetch all students from server (for admin view)
 */
export async function fetchAllStudents(): Promise<StudentRecord[]> {
  try {
    const res = await fetch('/api/students');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        return data.data;
      }
    }
  } catch (err) {
    console.error('Failed to fetch students list:', err);
  }
  return Object.values(studentsMap);
}

export function getStoredStudent(): StudentRecord | null {
  try {
    const raw = localStorage.getItem(STUDENT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function storeStudent(student: StudentRecord): void {
  try {
    localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(student));
  } catch {}
}

export function clearStoredStudent(): void {
  try {
    localStorage.removeItem(STUDENT_STORAGE_KEY);
  } catch {}
}

