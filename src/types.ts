export type SchoolStage = 'all' | 'kindergarten' | 'elementary' | 'middle' | 'high';

export interface GradeDefinition {
  id: string; // e.g. "KG1", "Grade 10"
  label: string; // e.g. "Kindergarten 1", "Grade 10"
  stage: SchoolStage;
  numericOrder: number;
  description: string;
}

export const ALL_GRADES: GradeDefinition[] = [
  { id: 'KG1', label: 'KG 1', stage: 'kindergarten', numericOrder: 0, description: 'Early Childhood & Foundation' },
  { id: 'KG2', label: 'KG 2', stage: 'kindergarten', numericOrder: 1, description: 'Kindergarten & Pre-Primary' },
  { id: 'Grade 1', label: 'Grade 1', stage: 'elementary', numericOrder: 2, description: 'Primary Foundation' },
  { id: 'Grade 2', label: 'Grade 2', stage: 'elementary', numericOrder: 3, description: 'Primary Elementary' },
  { id: 'Grade 3', label: 'Grade 3', stage: 'elementary', numericOrder: 4, description: 'Intermediate Primary' },
  { id: 'Grade 4', label: 'Grade 4', stage: 'elementary', numericOrder: 5, description: 'Upper Elementary' },
  { id: 'Grade 5', label: 'Grade 5', stage: 'elementary', numericOrder: 6, description: 'Elementary Graduation Year' },
  { id: 'Grade 6', label: 'Grade 6', stage: 'middle', numericOrder: 7, description: 'Junior Middle School' },
  { id: 'Grade 7', label: 'Grade 7', stage: 'middle', numericOrder: 8, description: 'Middle School Explorer' },
  { id: 'Grade 8', label: 'Grade 8', stage: 'middle', numericOrder: 9, description: 'Middle School Prep' },
  { id: 'Grade 9', label: 'Grade 9', stage: 'high', numericOrder: 10, description: 'Freshman High School' },
  { id: 'Grade 10', label: 'Grade 10', stage: 'high', numericOrder: 11, description: 'Sophomore High School' },
  { id: 'Grade 11', label: 'Grade 11', stage: 'high', numericOrder: 12, description: 'Junior High & Advanced Studies' },
  { id: 'Grade 12', label: 'Grade 12', stage: 'high', numericOrder: 13, description: 'Senior High School & AP / Diplomas' },
];

export const ALL_SECTIONS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // 'A' to 'Z'

export interface VirtualClass {
  id: string;
  grade: string;
  section: string;
  subject: string;
  teacherName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  zoomUrl: string;
  meetingId?: string;
  passcode?: string;
  topic?: string;
  notes?: string;
  colorTheme?: string;
  createdAt?: string;
}

export type ClassStatus = 'live' | 'upcoming' | 'ended';

export interface ClassStatusInfo {
  status: ClassStatus;
  statusLabel: string;
  detail: string;
  canJoin: boolean;
}

/**
 * Calculates current real-time or simulated class status
 */
export function getClassStatus(c: VirtualClass, referenceDate: Date = new Date()): ClassStatusInfo {
  const [year, month, day] = c.date.split('-').map(Number);
  const [startH, startM] = c.startTime.split(':').map(Number);
  const [endH, endM] = c.endTime.split(':').map(Number);

  const startDateTime = new Date(year, month - 1, day, startH, startM, 0);
  const endDateTime = new Date(year, month - 1, day, endH, endM, 59);

  const nowMs = referenceDate.getTime();
  const startMs = startDateTime.getTime();
  const endMs = endDateTime.getTime();

  if (nowMs > endMs) {
    return {
      status: 'ended',
      statusLabel: 'Concluded',
      detail: `Ended at ${format12HourTime(c.endTime)}`,
      canJoin: false,
    };
  }

  if (nowMs >= startMs && nowMs <= endMs) {
    const diffMinutes = Math.max(1, Math.round((endMs - nowMs) / (1000 * 60)));
    return {
      status: 'live',
      statusLabel: 'Live Now',
      detail: `Ends in ${diffMinutes} min${diffMinutes === 1 ? '' : 's'}`,
      canJoin: true,
    };
  }

  // Upcoming
  const diffStartMinutes = Math.round((startMs - nowMs) / (1000 * 60));
  let detail = `Starts at ${format12HourTime(c.startTime)}`;
  if (diffStartMinutes > 0 && diffStartMinutes < 60) {
    detail = `Starts in ${diffStartMinutes}m`;
  } else if (diffStartMinutes >= 60 && diffStartMinutes < 1440) {
    const hours = Math.floor(diffStartMinutes / 60);
    const mins = diffStartMinutes % 60;
    detail = `Starts in ${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  }

  return {
    status: 'upcoming',
    statusLabel: 'Upcoming',
    detail,
    canJoin: false, // User requested: class join is accessible when in timing, disabled after
  };
}

export function format12HourTime(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

export const POPULAR_SUBJECTS = [
  'Mathematics',
  'Advanced Physics',
  'Chemistry',
  'Biology',
  'English Literature',
  'Arabic Language',
  'Computer Science',
  'Islamic Studies',
  'Social Studies',
  'Phonics & Reading',
  'Art & Creative Design',
  'Physical Education',
  'French Language',
  'Economics & Business',
];
