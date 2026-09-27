export type SchoolStage = 'all' | 'kindergarten' | 'elementary' | 'middle' | 'high';

export interface GradeDefinition {
  id: string; // e.g. "KG1", "Grade 10"
  label: string; // e.g. "Kindergarten 1", "Grade 10"
  stage: SchoolStage;
  numericOrder: number;
  description: string;
}

export const ALL_GRADES: GradeDefinition[] = [
  { id: 'KG 1', label: 'KG 1', stage: 'kindergarten', numericOrder: 0, description: 'KG 1' },
  { id: 'KG 2', label: 'KG 2', stage: 'kindergarten', numericOrder: 1, description: 'KG 2' },
  { id: 'KG 3', label: 'KG 3', stage: 'kindergarten', numericOrder: 2, description: 'KG 3' },
  { id: 'Grade 1', label: 'Grade 1', stage: 'elementary', numericOrder: 3, description: 'Grade 1' },
  { id: 'Grade 2', label: 'Grade 2', stage: 'elementary', numericOrder: 4, description: 'Grade 2' },
  { id: 'Grade 3', label: 'Grade 3', stage: 'elementary', numericOrder: 5, description: 'Grade 3' },
  { id: 'Grade 4', label: 'Grade 4', stage: 'elementary', numericOrder: 6, description: 'Grade 4' },
  { id: 'Grade 5', label: 'Grade 5', stage: 'elementary', numericOrder: 7, description: 'Grade 5' },
  { id: 'Grade 6', label: 'Grade 6', stage: 'middle', numericOrder: 8, description: 'Grade 6' },
  { id: 'Grade 7', label: 'Grade 7', stage: 'middle', numericOrder: 9, description: 'Grade 7' },
  { id: 'Grade 8', label: 'Grade 8', stage: 'middle', numericOrder: 10, description: 'Grade 8' },
  { id: 'Grade 9', label: 'Grade 9', stage: 'high', numericOrder: 11, description: 'Grade 9' },
  { id: 'Grade 10', label: 'Grade 10', stage: 'high', numericOrder: 12, description: 'Grade 10' },
  { id: 'Grade 11', label: 'Grade 11', stage: 'high', numericOrder: 13, description: 'Grade 11' },
  { id: 'Grade 12', label: 'Grade 12', stage: 'high', numericOrder: 14, description: 'Grade 12' },
  { id: 'Pure AP', label: 'Pure AP', stage: 'high', numericOrder: 15, description: 'Pure AP' },
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
  isWithin10Minutes: boolean;
  unlockTimeFormatted?: string;
  minutesUntilStart?: number;
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
  const tenMinutesMs = 10 * 60 * 1000;

  if (nowMs > endMs) {
    return {
      status: 'ended',
      statusLabel: 'Concluded',
      detail: `Ended at ${format12HourTime(c.endTime)}`,
      canJoin: false,
      isWithin10Minutes: false,
    };
  }

  if (nowMs >= startMs && nowMs <= endMs) {
    const diffMinutes = Math.max(1, Math.round((endMs - nowMs) / (1000 * 60)));
    return {
      status: 'live',
      statusLabel: 'Live Now',
      detail: `Ends in ${diffMinutes} min${diffMinutes === 1 ? '' : 's'}`,
      canJoin: true,
      isWithin10Minutes: true,
    };
  }

  // Upcoming
  const diffStartMs = startMs - nowMs;
  const diffStartMinutes = Math.max(0, Math.round(diffStartMs / (1000 * 60)));
  const isWithin10Minutes = diffStartMs <= tenMinutesMs && diffStartMs >= 0;

  // Calculate 10 minutes prior to start time
  const unlockDate = new Date(startDateTime.getTime() - tenMinutesMs);
  const unlockH = String(unlockDate.getHours()).padStart(2, '0');
  const unlockM = String(unlockDate.getMinutes()).padStart(2, '0');
  const unlockTimeFormatted = format12HourTime(`${unlockH}:${unlockM}`);

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
    canJoin: isWithin10Minutes, // Active ONLY 10 minutes before start time
    isWithin10Minutes,
    unlockTimeFormatted,
    minutesUntilStart: diffStartMinutes,
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

export function convertTo24Hour(
  hour12: string | number,
  minute: string | number,
  period: 'AM' | 'PM'
): string {
  let h = typeof hour12 === 'number' ? hour12 : parseInt(hour12, 10);
  if (isNaN(h) || h < 1 || h > 12) h = 12;
  const m = typeof minute === 'number' ? minute : parseInt(minute, 10);
  const mStr = isNaN(m) ? '00' : String(m).padStart(2, '0');

  if (period === 'AM') {
    if (h === 12) h = 0;
  } else {
    // PM
    if (h !== 12) h += 12;
  }

  return `${String(h).padStart(2, '0')}:${mStr}`;
}

export function parseFrom24Hour(time24: string): { hour: string; minute: string; period: 'AM' | 'PM' } {
  if (!time24 || !time24.includes(':')) {
    return { hour: '09', minute: '00', period: 'AM' };
  }
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  if (isNaN(h)) h = 9;
  const m = parseInt(mStr, 10);
  const minute = isNaN(m) ? '00' : String(m).padStart(2, '0');

  const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;

  return {
    hour: String(hour12).padStart(2, '0'),
    minute,
    period,
  };
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
  'AP Calculus BC',
  'AP Calculus AB',
  'AP Physics',
  'AP Chemistry',
  'AP Biology',
  'AP Computer Science',
  'AP Macroeconomics',
];
