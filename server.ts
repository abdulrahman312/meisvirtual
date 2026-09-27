import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'classes.json');
const STUDENTS_FILE = path.resolve(DATA_DIR, 'students.json');
const SHEET_CONFIG_FILE = path.resolve(DATA_DIR, 'sheet-config.json');
const TEACHERS_FILE = path.resolve(DATA_DIR, 'teachers.json');
const TEACHER_SHEET_CONFIG_FILE = path.resolve(DATA_DIR, 'teacher-sheet-config.json');

// Interface
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
  createdAt: string;
}

export interface StudentRecord {
  name: string;
  iqama: string;
  grade: string;
  section: string;
}

export interface SheetConfig {
  sheetUrl: string;
  lastSynced: string | null;
  studentCount: number;
}

export interface TeacherRecord {
  name: string;
  username: string;
}

export interface TeacherSheetConfig {
  sheetUrl: string;
  lastSynced: string | null;
  teacherCount: number;
}

// Default seed teachers from Google Sheet
function getDefaultTeachers(): Record<string, TeacherRecord> {
  return {
    "aft116t0001": { "name": "Riman Mohammed Kamel Al Bassaleh", "username": "aft116t0001" },
    "aft116t0009": { "name": "Fatena Mohamad Al Dawoud", "username": "aft116t0009" },
    "aft116t0010": { "name": "Areej Nael Zaidan", "username": "aft116t0010" },
    "aft117t0020": { "name": "Nour Khamis", "username": "aft117t0020" },
    "aft116t0018": { "name": "Asma Mohammed Alasmari", "username": "aft116t0018" },
    "aft116t0019": { "name": "Seetah Zaid Al Huntushi", "username": "aft116t0019" },
    "rwd15t0001": { "name": "Alaa Kamal Elahmady Azab", "username": "RWD15t0001" },
    "aft116t0034": { "name": "Alanoud Faihan Alatawi", "username": "aft116t0034" },
    "aft116t0035": { "name": "Mona Saud Alotaibi", "username": "aft116t0035" },
    "aft190t0011": { "name": "Esraa Hanafy Ahmed", "username": "aft190t0011" },
    "aft116t0053": { "name": "Marwa Hassan Abdelalim", "username": "aft116t0053" },
    "aft116t0046": { "name": "Mashael Al Qahtani", "username": "aft116t0046" },
    "aft116t0049": { "name": "Eman Saleh Ali", "username": "aft116t0049" },
    "aft116t0054": { "name": "Tasneem Jamal", "username": "aft116t0054" },
    "aft116t0061": { "name": "Ghazal Tabbakha", "username": "aft116t0061" },
    "aft116t0062": { "name": "Hadeel Abu Sarhan", "username": "aft116t0062" },
    "aft116t0063": { "name": "Alaa Obaid", "username": "aft116t0063" },
    "aft116t0064": { "name": "Salam Hammoud", "username": "aft116t0064" },
    "aft120t0010": { "name": "Abdul Rahman Salahuddin Khan", "username": "aft120t0010" },
    "aft120t0011": { "name": "Alaa Abd Hameed Mohammed", "username": "aft120t0011" }
  };
}

// Teacher database helpers
function readTeachersDatabase(): Record<string, TeacherRecord> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(TEACHERS_FILE)) {
      const initial = getDefaultTeachers();
      fs.writeFileSync(TEACHERS_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(TEACHERS_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === 'object' ? parsed : getDefaultTeachers();
  } catch (err) {
    console.error('Error reading teachers file:', err);
    return getDefaultTeachers();
  }
}

function writeTeachersDatabase(teachers: Record<string, TeacherRecord>): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TEACHERS_FILE, JSON.stringify(teachers, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing teachers file:', err);
  }
}

const DEFAULT_TEACHER_GOOGLE_SHEET_ID = '1APNmErZKmD2xL_ncCanGnbJBi0sDiptU6hvzl1qj8f4';
const DEFAULT_TEACHER_GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_TEACHER_GOOGLE_SHEET_ID}/edit`;

function readTeacherSheetConfig(): TeacherSheetConfig {
  try {
    if (fs.existsSync(TEACHER_SHEET_CONFIG_FILE)) {
      const content = fs.readFileSync(TEACHER_SHEET_CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && parsed.sheetUrl) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading teacher sheet config:', err);
  }
  const count = Object.keys(readTeachersDatabase()).length;
  return { sheetUrl: DEFAULT_TEACHER_GOOGLE_SHEET_URL, lastSynced: new Date().toISOString(), teacherCount: count };
}

function writeTeacherSheetConfig(config: TeacherSheetConfig): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TEACHER_SHEET_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing teacher sheet config:', err);
  }
}

// Default seed students
function getDefaultStudents(): Record<string, StudentRecord> {
  return {
    "2447960507": {
      "name": "Omar Al-Mansoor",
      "iqama": "2447960507",
      "grade": "Grade 4",
      "section": "B"
    },
    "2339158970": {
      "name": "Zaid Al-Harbi",
      "iqama": "2339158970",
      "grade": "Grade 10",
      "section": "A"
    },
    "2339158971": {
      "name": "Fatima Al-Zahrani",
      "iqama": "2339158971",
      "grade": "Grade 10",
      "section": "No Section"
    },
    "2274924626": {
      "name": "Sara Al-Otaibi",
      "iqama": "2274924626",
      "grade": "Grade 12",
      "section": "No Section"
    },
    "2551029384": {
      "name": "Yousef Al-Ghamdi",
      "iqama": "2551029384",
      "grade": "Grade 7",
      "section": "A"
    },
    "2118392019": {
      "name": "Leen Al-Khatib",
      "iqama": "2118392019",
      "grade": "Grade 1",
      "section": "C"
    },
    "2991048271": {
      "name": "Hamza Al-Dosari",
      "iqama": "2991048271",
      "grade": "KG 2",
      "section": "A"
    },
    "2348192048": {
      "name": "Maryam Al-Shehri",
      "iqama": "2348192048",
      "grade": "Grade 10",
      "section": "B"
    }
  };
}

// Student database helpers
function readStudentsDatabase(): Record<string, StudentRecord> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STUDENTS_FILE)) {
      const initial = getDefaultStudents();
      fs.writeFileSync(STUDENTS_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(STUDENTS_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === 'object' ? parsed : getDefaultStudents();
  } catch (err) {
    console.error('Error reading students file:', err);
    return getDefaultStudents();
  }
}

function writeStudentsDatabase(students: Record<string, StudentRecord>): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing students file:', err);
  }
}

const DEFAULT_GOOGLE_SHEET_ID = '1ABOUxIdBBw0WU9sGoYL3rmvFlJ5R7metUUF2btyeyLM';
const DEFAULT_GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_GOOGLE_SHEET_ID}/edit`;

function readSheetConfig(): SheetConfig {
  try {
    if (fs.existsSync(SHEET_CONFIG_FILE)) {
      const content = fs.readFileSync(SHEET_CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && parsed.sheetUrl) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading sheet config:', err);
  }
  const count = Object.keys(readStudentsDatabase()).length;
  return { sheetUrl: DEFAULT_GOOGLE_SHEET_URL, lastSynced: new Date().toISOString(), studentCount: count };
}

function writeSheetConfig(config: SheetConfig): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SHEET_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing sheet config:', err);
  }
}

// CSV Parser handling quotes and linebreaks
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(cell.trim());
      if (row.some((c) => c.length > 0)) {
        rows.push(row);
      }
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some((c) => c.length > 0)) {
      rows.push(row);
    }
  }
  return rows;
}

// Grade Normalizer
function normalizeGrade(raw: string): string {
  const g = raw.trim();
  if (!g) return 'Grade 10';
  if (/^pure\s*ap$/i.test(g) || /^ap$/i.test(g)) {
    return 'Pure AP';
  }
  if (/^kg\s*1$/i.test(g) || /^kg1$/i.test(g) || /^kindergarten\s*1$/i.test(g)) {
    return 'KG 1';
  }
  if (/^kg\s*2$/i.test(g) || /^kg2$/i.test(g) || /^kindergarten\s*2$/i.test(g)) {
    return 'KG 2';
  }
  if (/^kg\s*3$/i.test(g) || /^kg3$/i.test(g) || /^kindergarten\s*3$/i.test(g)) {
    return 'KG 3';
  }
  // Matches "10", "Grade 10", "Gr 10", "G 10", "G10"
  const numMatch = g.match(/\d+/);
  if (numMatch) {
    const num = parseInt(numMatch[0], 10);
    if (num >= 1 && num <= 12) {
      return `Grade ${num}`;
    }
  }
  return g;
}

// Section Normalizer
function normalizeSection(raw: string): string {
  const s = raw.trim();
  if (!s || /^no\s*section$/i.test(s) || /^(none|-|n\/a|all)$/i.test(s)) {
    return 'No Section';
  }
  // If "Section A", extract "A"
  const secMatch = s.match(/(?:section\s*)?([A-Za-z])/i);
  if (secMatch) {
    return secMatch[1].toUpperCase();
  }
  return s.toUpperCase();
}

// Sync from Google Sheet URL
async function fetchAndParseGoogleSheet(urlOrId: string): Promise<Record<string, StudentRecord>> {
  const trimmed = urlOrId.trim();
  if (!trimmed) {
    throw new Error('Google Sheet URL or ID is required.');
  }

  let exportUrls: string[] = [];

  // Check if it's already a pub?output=csv URL
  if (trimmed.includes('pub?output=csv') || trimmed.endsWith('.csv')) {
    exportUrls.push(trimmed);
  } else if (trimmed.includes('/pubhtml')) {
    exportUrls.push(trimmed.replace('/pubhtml', '/pub?output=csv'));
  } else {
    // Extract Spreadsheet ID
    let sheetId = trimmed;
    let gid: string | undefined = undefined;

    const idMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (idMatch && idMatch[1]) {
      sheetId = idMatch[1];
    }

    const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
    if (gidMatch && gidMatch[1]) {
      gid = gidMatch[1];
    }

    const gidParam = gid ? `&gid=${gid}` : '';
    exportUrls.push(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`);
    exportUrls.push(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${gidParam}`);
  }

  let csvContent = '';
  let lastError: any = null;

  for (const url of exportUrls) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MEIS-Portal/1.0',
        },
      });

      if (response.ok) {
        csvContent = await response.text();
        if (csvContent && !csvContent.includes('<!DOCTYPE html>')) {
          break;
        }
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (!csvContent || csvContent.includes('<!DOCTYPE html>')) {
    throw new Error(
      'Could not access the Google Sheet. Please make sure the sheet is shared as "Anyone with the link can view", or publish it via File > Share > Publish to web > CSV.'
    );
  }

  const rows = parseCSV(csvContent);
  if (rows.length === 0) {
    throw new Error('The Google Sheet appears to be empty.');
  }

  const studentsMap: Record<string, StudentRecord> = {};

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 2) continue;

    // Detect and skip header row
    const cell0 = (row[0] || '').toLowerCase();
    const cell1 = (row[1] || '').toLowerCase();
    if (
      cell0.includes('name') ||
      cell1.includes('iqama') ||
      cell1.includes('id') ||
      cell1.includes('student') ||
      cell0.includes('student')
    ) {
      continue;
    }

    // Specification:
    // Column A (index 0): Student Name
    // Column B (index 1): ID / Iqama
    // Column C (index 2): Grade
    // Column D (index 3): Section
    const rawIqama = (row[1] || '').trim().replace(/[-\s'"]/g, '');
    if (!rawIqama || rawIqama.length < 3) {
      continue;
    }

    const name = (row[0] || '').trim() || `Student ${rawIqama}`;
    const grade = normalizeGrade(row[2] || '');
    const section = normalizeSection(row[3] || '');

    const record: StudentRecord = {
      name,
      iqama: rawIqama,
      grade,
      section,
    };

    studentsMap[rawIqama] = record;
  }

  if (Object.keys(studentsMap).length === 0) {
    throw new Error(
      'No student records could be parsed. Please check that Column B contains the Student ID/Iqama, Column C contains the Grade, and Column D contains the Section.'
    );
  }

  return studentsMap;
}

// Sync teachers from Google Sheet URL
async function fetchAndParseTeacherSheet(urlOrId: string): Promise<Record<string, TeacherRecord>> {
  const trimmed = urlOrId.trim();
  if (!trimmed) {
    throw new Error('Teacher Google Sheet URL or ID is required.');
  }

  let exportUrls: string[] = [];

  if (trimmed.includes('pub?output=csv') || trimmed.endsWith('.csv')) {
    exportUrls.push(trimmed);
  } else if (trimmed.includes('/pubhtml')) {
    exportUrls.push(trimmed.replace('/pubhtml', '/pub?output=csv'));
  } else {
    let sheetId = trimmed;
    let gid: string | undefined = undefined;

    const idMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (idMatch && idMatch[1]) {
      sheetId = idMatch[1];
    }

    const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
    if (gidMatch && gidMatch[1]) {
      gid = gidMatch[1];
    }

    const gidParam = gid ? `&gid=${gid}` : '';
    exportUrls.push(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`);
    exportUrls.push(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${gidParam}`);
  }

  let csvContent = '';
  for (const url of exportUrls) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MEIS-Portal/1.0',
        },
      });

      if (response.ok) {
        csvContent = await response.text();
        if (csvContent && !csvContent.includes('<!DOCTYPE html>')) {
          break;
        }
      }
    } catch {}
  }

  if (!csvContent || csvContent.includes('<!DOCTYPE html>')) {
    throw new Error(
      'Could not access the Teacher Google Sheet. Please make sure the sheet is shared as "Anyone with the link can view", or published to web as CSV.'
    );
  }

  const rows = parseCSV(csvContent);
  if (rows.length === 0) {
    throw new Error('The Teacher Google Sheet appears to be empty.');
  }

  const teachersMap: Record<string, TeacherRecord> = {};

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 2) continue;

    // Detect and skip header row
    const cell0 = (row[0] || '').toLowerCase();
    const cell1 = (row[1] || '').toLowerCase();
    if (
      cell0.includes('name') ||
      cell1.includes('username') ||
      cell0.includes('teacher') ||
      cell1.includes('user')
    ) {
      continue;
    }

    // Column A: Full Name, Column B: Username
    const fullName = (row[0] || '').trim();
    const rawUsername = (row[1] || '').trim();
    if (!rawUsername || !fullName) continue;

    const normalizedKey = rawUsername.toLowerCase();
    teachersMap[normalizedKey] = {
      name: fullName,
      username: rawUsername,
    };
  }

  if (Object.keys(teachersMap).length === 0) {
    throw new Error(
      'No teacher records could be parsed. Please check that Column A contains Full Name and Column B contains Username.'
    );
  }

  return teachersMap;
}

// Generate realistic default classes based on current date
function getDefaultSeedClasses(): VirtualClass[] {
  return [];
}

// Read database
function readDatabase(): VirtualClass[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
      return [];
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading database file:', err);
    return [];
  }
}

// Write database
function writeDatabase(classes: VirtualClass[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(classes, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to database file:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // 1. Get all classes (optional query params: grade, section, date)
  app.get('/api/classes', (req, res) => {
    let classes = readDatabase();
    const { grade, section, date } = req.query;

    if (grade && typeof grade === 'string') {
      classes = classes.filter((c) => c.grade.toLowerCase() === grade.toLowerCase());
    }
    if (section && typeof section === 'string') {
      classes = classes.filter((c) => c.section.toUpperCase() === section.toUpperCase());
    }
    if (date && typeof date === 'string') {
      classes = classes.filter((c) => c.date === date);
    }

    // Sort by date, then startTime
    classes.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.startTime.localeCompare(b.startTime);
    });

    res.json({ success: true, count: classes.length, data: classes });
  });

  // 2. Create a new virtual class
  app.post('/api/classes', (req, res) => {
    const {
      grade,
      section,
      subject,
      teacherName,
      date,
      startTime,
      endTime,
      zoomUrl,
      meetingId,
      passcode,
      topic,
      notes,
      colorTheme,
    } = req.body;

    if (!grade || !section || !subject || !teacherName || !date || !startTime || !endTime || !zoomUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields (grade, section, subject, teacherName, date, startTime, endTime, zoomUrl)',
      });
    }

    const classes = readDatabase();
    const newClass: VirtualClass = {
      id: `cls-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      grade: String(grade).trim(),
      section: String(section).trim().toUpperCase(),
      subject: String(subject).trim(),
      teacherName: String(teacherName).trim(),
      date: String(date).trim(),
      startTime: String(startTime).trim(),
      endTime: String(endTime).trim(),
      zoomUrl: String(zoomUrl).trim(),
      meetingId: meetingId ? String(meetingId).trim() : undefined,
      passcode: passcode ? String(passcode).trim() : undefined,
      topic: topic ? String(topic).trim() : undefined,
      notes: notes ? String(notes).trim() : undefined,
      colorTheme: colorTheme ? String(colorTheme).trim() : 'blue',
      createdAt: new Date().toISOString(),
    };

    classes.push(newClass);
    writeDatabase(classes);

    res.status(201).json({ success: true, data: newClass });
  });

  // 3. Update an existing class
  app.put('/api/classes/:id', (req, res) => {
    const { id } = req.params;
    const classes = readDatabase();
    const index = classes.findIndex((c) => c.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    const updatedClass: VirtualClass = {
      ...classes[index],
      ...req.body,
      id: classes[index].id, // protect id
      createdAt: classes[index].createdAt, // protect createdAt
    };

    classes[index] = updatedClass;
    writeDatabase(classes);

    res.json({ success: true, data: updatedClass });
  });

  // 4. Delete a class
  app.delete('/api/classes/:id', (req, res) => {
    const { id } = req.params;
    let classes = readDatabase();
    const exists = classes.some((c) => c.id === id);

    if (!exists) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    classes = classes.filter((c) => c.id !== id);
    writeDatabase(classes);

    res.json({ success: true, message: 'Class deleted successfully' });
  });

  // 5. Teacher authentication endpoint (supports Classera Username)
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    // Check Classera username if provided
    if (username && typeof username === 'string') {
      const cleanInput = username.trim();
      const normalizedKey = cleanInput.toLowerCase();
      let teachersMap = readTeachersDatabase();

      let matched: TeacherRecord | undefined = teachersMap[normalizedKey] || Object.values(teachersMap).find(
        (t) => t.username.toLowerCase() === normalizedKey
      );

      // If not matched, try live sync
      if (!matched) {
        const config = readTeacherSheetConfig();
        if (config.sheetUrl) {
          try {
            const fresh = await fetchAndParseTeacherSheet(config.sheetUrl);
            writeTeachersDatabase(fresh);
            teachersMap = fresh;
            matched = fresh[normalizedKey] || Object.values(fresh).find(
              (t) => t.username.toLowerCase() === normalizedKey
            );
          } catch {}
        }
      }

      if (matched) {
        return res.json({
          success: true,
          user: {
            role: 'teacher_admin',
            name: matched.name,
            username: matched.username,
            authenticatedAt: new Date().toISOString(),
          },
        });
      }

      return res.status(404).json({
        success: false,
        error: `No faculty record found for Classera username "${cleanInput}". Please check your username or contact school administration.`,
      });
    }

    // Fallback master password
    const validPassword = 'Meis13579';
    if (password && typeof password === 'string' && password.trim() === validPassword) {
      return res.json({
        success: true,
        user: {
          role: 'teacher_admin',
          name: 'Faculty & Teacher Administration',
          username: 'faculty_admin',
          authenticatedAt: new Date().toISOString(),
        },
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Please enter your Classera Username.',
    });
  });

  // 5b. Teacher verification by Classera Username endpoint
  app.post('/api/teachers/verify', async (req, res) => {
    const { username } = req.body;
    if (!username || typeof username !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please enter your Classera Username.',
      });
    }

    const cleanInput = username.trim();
    const normalizedKey = cleanInput.toLowerCase();
    let teachersMap = readTeachersDatabase();

    let matched: TeacherRecord | undefined = teachersMap[normalizedKey] || Object.values(teachersMap).find(
      (t) => t.username.toLowerCase() === normalizedKey
    );

    // If not matched, try live sync from Google Sheet
    if (!matched) {
      const config = readTeacherSheetConfig();
      if (config.sheetUrl) {
        try {
          const freshTeachers = await fetchAndParseTeacherSheet(config.sheetUrl);
          writeTeachersDatabase(freshTeachers);
          teachersMap = freshTeachers;
          matched = freshTeachers[normalizedKey] || Object.values(freshTeachers).find(
            (t) => t.username.toLowerCase() === normalizedKey
          );
        } catch {}
      }
    }

    if (matched) {
      return res.json({
        success: true,
        teacher: matched,
      });
    }

    return res.status(404).json({
      success: false,
      error: `No faculty record found for Classera username "${cleanInput}". Please check your Classera username or contact school administration.`,
    });
  });

  // 5c. Teacher Google Sheet Configuration & Status
  app.get('/api/teacher-sheet/config', (req, res) => {
    const config = readTeacherSheetConfig();
    const teachers = readTeachersDatabase();
    config.teacherCount = Object.keys(teachers).length;
    res.json({ success: true, ...config });
  });

  // 5d. Update Teacher Google Sheet URL & Sync
  app.post('/api/teacher-sheet/config', async (req, res) => {
    const { sheetUrl } = req.body;
    if (!sheetUrl || typeof sheetUrl !== 'string') {
      return res.status(400).json({ success: false, error: 'Please provide a valid Google Sheet URL or ID.' });
    }

    try {
      const parsedTeachers = await fetchAndParseTeacherSheet(sheetUrl);
      const teacherCount = Object.keys(parsedTeachers).length;

      writeTeachersDatabase(parsedTeachers);
      const newConfig: TeacherSheetConfig = {
        sheetUrl: sheetUrl.trim(),
        lastSynced: new Date().toISOString(),
        teacherCount,
      };
      writeTeacherSheetConfig(newConfig);

      res.json({
        success: true,
        message: `Successfully synchronized ${teacherCount} faculty members from Google Sheet!`,
        teacherCount,
        lastSynced: newConfig.lastSynced,
      });
    } catch (err: any) {
      console.error('Error connecting Teacher Google Sheet:', err);
      res.status(400).json({
        success: false,
        error: err.message || 'Failed to sync teacher Google Sheet. Please check sheet permissions.',
      });
    }
  });

  // 5e. Manual Sync for Teachers Sheet
  app.post('/api/teacher-sheet/sync', async (req, res) => {
    const config = readTeacherSheetConfig();
    try {
      const parsedTeachers = await fetchAndParseTeacherSheet(config.sheetUrl);
      const teacherCount = Object.keys(parsedTeachers).length;

      writeTeachersDatabase(parsedTeachers);
      const updatedConfig: TeacherSheetConfig = {
        ...config,
        lastSynced: new Date().toISOString(),
        teacherCount,
      };
      writeTeacherSheetConfig(updatedConfig);

      res.json({
        success: true,
        message: `Synchronized ${teacherCount} teachers from Google Sheet.`,
        teacherCount,
        lastSynced: updatedConfig.lastSynced,
      });
    } catch (err: any) {
      console.error('Error syncing teacher Google Sheet:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to sync teacher Google Sheet.',
      });
    }
  });

  // 5f. List all teachers
  app.get('/api/teachers', (req, res) => {
    const teachersMap = readTeachersDatabase();
    res.json({
      success: true,
      count: Object.keys(teachersMap).length,
      data: Object.values(teachersMap),
    });
  });

  // 6. Reset database to seed
  app.post('/api/reset-data', (req, res) => {
    const seed = getDefaultSeedClasses();
    writeDatabase(seed);
    res.json({ success: true, message: 'Database reset to initial school schedule', data: seed });
  });

  // 7. Get Google Sheet configuration & status
  app.get('/api/sheet/config', (req, res) => {
    const config = readSheetConfig();
    const students = readStudentsDatabase();
    config.studentCount = Object.keys(students).length;
    res.json({ success: true, ...config });
  });

  // 8. Connect / Update Google Sheet URL and immediately sync
  app.post('/api/sheet/config', async (req, res) => {
    const { sheetUrl } = req.body;
    if (!sheetUrl || typeof sheetUrl !== 'string') {
      return res.status(400).json({ success: false, error: 'Please provide a valid Google Sheet URL or ID.' });
    }

    try {
      const parsedStudents = await fetchAndParseGoogleSheet(sheetUrl);
      const studentCount = Object.keys(parsedStudents).length;

      // Persist students and config
      writeStudentsDatabase(parsedStudents);
      const newConfig: SheetConfig = {
        sheetUrl: sheetUrl.trim(),
        lastSynced: new Date().toISOString(),
        studentCount,
      };
      writeSheetConfig(newConfig);

      res.json({
        success: true,
        message: `Successfully synchronized ${studentCount} students from Google Sheet!`,
        studentCount,
        lastSynced: newConfig.lastSynced,
      });
    } catch (err: any) {
      console.error('Error connecting Google Sheet:', err);
      res.status(400).json({
        success: false,
        error: err.message || 'Failed to fetch and parse Google Sheet. Please check sheet permissions.',
      });
    }
  });

  // 9. Manual Sync from Google Sheet
  app.post('/api/sheet/sync', async (req, res) => {
    const config = readSheetConfig();
    if (!config.sheetUrl) {
      return res.status(400).json({
        success: false,
        error: 'No Google Sheet URL has been configured yet. Please configure the URL in the Teacher Panel first.',
      });
    }

    try {
      const parsedStudents = await fetchAndParseGoogleSheet(config.sheetUrl);
      const studentCount = Object.keys(parsedStudents).length;

      writeStudentsDatabase(parsedStudents);
      const updatedConfig: SheetConfig = {
        ...config,
        lastSynced: new Date().toISOString(),
        studentCount,
      };
      writeSheetConfig(updatedConfig);

      res.json({
        success: true,
        message: `Synchronized ${studentCount} students from Google Sheet.`,
        studentCount,
        lastSynced: updatedConfig.lastSynced,
      });
    } catch (err: any) {
      console.error('Error syncing Google Sheet:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to sync from Google Sheet.',
      });
    }
  });

  // 10. List all students (for Teacher / Admin view)
  app.get('/api/students', (req, res) => {
    const studentsMap = readStudentsDatabase();
    const students = Object.values(studentsMap);
    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  });

  // 11. Student Verification by ID / Iqama
  app.post('/api/students/verify', async (req, res) => {
    const { iqama } = req.body;
    if (!iqama || typeof iqama !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid Student ID or Iqama Number.',
      });
    }

    const cleanInput = iqama.trim().replace(/[-\s]/g, '');
    let studentsMap = readStudentsDatabase();

    // Look up directly
    let matched: StudentRecord | undefined = studentsMap[cleanInput];

    // Look up without leading zeroes if not matched
    if (!matched) {
      matched = Object.values(studentsMap).find(
        (s) =>
          s.iqama === cleanInput ||
          s.iqama.replace(/^0+/, '') === cleanInput.replace(/^0+/, '')
      );
    }

    // If still not matched, and sheet is configured, try live sync
    if (!matched) {
      const config = readSheetConfig();
      if (config.sheetUrl) {
        try {
          const freshStudents = await fetchAndParseGoogleSheet(config.sheetUrl);
          writeStudentsDatabase(freshStudents);
          studentsMap = freshStudents;
          matched = freshStudents[cleanInput] || Object.values(freshStudents).find(
            (s) =>
              s.iqama === cleanInput ||
              s.iqama.replace(/^0+/, '') === cleanInput.replace(/^0+/, '')
          );
        } catch {}
      }
    }

    if (matched) {
      return res.json({
        success: true,
        student: matched,
      });
    }

    return res.status(404).json({
      success: false,
      error: `No enrolled student record found for ID / Iqama "${cleanInput}". Please check the number or contact your teacher.`,
    });
  });

  // In production, serve built frontend from dist
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In dev, use Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  // Attempt background sync for configured Google Sheets
  const teacherConfig = readTeacherSheetConfig();
  if (teacherConfig.sheetUrl) {
    fetchAndParseTeacherSheet(teacherConfig.sheetUrl)
      .then((parsed) => {
        writeTeachersDatabase(parsed);
        const count = Object.keys(parsed).length;
        writeTeacherSheetConfig({
          ...teacherConfig,
          lastSynced: new Date().toISOString(),
          teacherCount: count,
        });
        console.log(`Teacher directory synchronized: ${count} teachers loaded.`);
      })
      .catch(() => {
        console.log(`Using cached teacher directory (${Object.keys(readTeachersDatabase()).length} teachers).`);
      });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`School Portal Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
