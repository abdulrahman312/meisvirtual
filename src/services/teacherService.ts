import teachersData from '../data/teachers.json';

export interface TeacherRecord {
  name: string;
  username: string;
}

export interface TeacherSheetConfig {
  sheetUrl: string;
  lastSynced: string | null;
  teacherCount: number;
}

export const DEFAULT_TEACHER_SHEET_ID = '1APNmErZKmD2xL_ncCanGnbJBi0sDiptU6hvzl1qj8f4';
export const DEFAULT_TEACHER_SHEET_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_TEACHER_SHEET_ID}/edit`;

const teachersMap: Record<string, TeacherRecord> = { ...(teachersData as Record<string, TeacherRecord>) };

const TEACHER_STORAGE_KEY = 'meis_authenticated_teacher';

/**
 * Verify Teacher by Classera Username
 * Queries the backend endpoint (/api/teachers/verify) which checks the database and live Google Sheet.
 * Falls back to local dictionary if server endpoint is unreachable.
 */
export async function verifyTeacherByUsername(
  usernameInput: string
): Promise<{ success: boolean; teacher?: TeacherRecord; error?: string }> {
  if (!usernameInput) {
    return { success: false, error: 'Please enter your Classera Username.' };
  }

  const cleanUsername = usernameInput.trim();
  const normalizedKey = cleanUsername.toLowerCase();

  try {
    const res = await fetch('/api/teachers/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanUsername }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.teacher) {
        // Cache locally
        teachersMap[normalizedKey] = data.teacher;
        storeTeacher(data.teacher);
        return { success: true, teacher: data.teacher };
      }
    } else {
      const errData = await res.json().catch(() => null);
      if (errData && errData.error) {
        return { success: false, error: errData.error };
      }
    }
  } catch (err) {
    console.warn('Teacher verify server check fallback to local database:', err);
  }

  // Fallback to local map
  const localMatch = teachersMap[normalizedKey] || Object.values(teachersMap).find(
    (t) => t.username.toLowerCase() === normalizedKey
  );

  if (localMatch) {
    storeTeacher(localMatch);
    return { success: true, teacher: localMatch };
  }

  return {
    success: false,
    error: `No faculty record found for Classera username "${cleanUsername}". Please verify your Classera username or contact school administration.`,
  };
}

export function getStoredTeacher(): TeacherRecord | null {
  try {
    const raw = sessionStorage.getItem(TEACHER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function storeTeacher(teacher: TeacherRecord): void {
  try {
    sessionStorage.setItem(TEACHER_STORAGE_KEY, JSON.stringify(teacher));
  } catch {}
}

export function clearStoredTeacher(): void {
  try {
    sessionStorage.removeItem(TEACHER_STORAGE_KEY);
  } catch {}
}
