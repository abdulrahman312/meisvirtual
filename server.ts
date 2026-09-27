import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'classes.json');

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

// Generate realistic default classes based on current date
function getDefaultSeedClasses(): VirtualClass[] {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  // Tomorrow's date
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  // Helper to format HH:MM
  const formatTime = (h: number, m: number) => {
    const hh = String(h % 24).padStart(2, '0');
    const mm = String(Math.max(0, Math.min(59, m))).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  // Create an active LIVE class right now
  const liveStart = formatTime(currentHour, Math.max(0, currentMin - 15));
  const liveEnd = formatTime(currentHour + 1, currentMin + 25);

  // Create an upcoming class starting soon
  const upcomingStart = formatTime(currentHour + 1, currentMin + 30);
  const upcomingEnd = formatTime(currentHour + 2, currentMin + 15);

  // Create an ended class from earlier today
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
    },
    {
      id: 'cls-111',
      grade: 'Grade 8',
      section: 'B',
      subject: 'Arabic Language',
      teacherName: 'Ustadh Ahmad Al-Nuaimi',
      date: todayStr,
      startTime: upcomingStart,
      endTime: upcomingEnd,
      zoomUrl: 'https://zoom.us/j/81290384721',
      meetingId: '812 9038 4721',
      passcode: 'Arabic8B',
      topic: 'قواعد النحو: إعراب الفاعل والمفعول به وتطبيقات نصوص',
      notes: 'الرجاء فتح كتاب اللغة العربية صفحة ٧٨.',
      colorTheme: 'emerald',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cls-112',
      grade: 'Grade 6',
      section: 'C',
      subject: 'Social Studies',
      teacherName: 'Ms. Fatima Noor',
      date: todayStr,
      startTime: endedStart,
      endTime: endedEnd,
      zoomUrl: 'https://zoom.us/j/69201948291',
      meetingId: '692 0194 8291',
      passcode: 'Social6C',
      topic: 'Ancient Mesopotamian Civilizations & The Fertile Crescent',
      notes: 'Class finished. Map activity worksheet submitted.',
      colorTheme: 'orange',
      createdAt: new Date().toISOString(),
    }
  ];
}

// Read database
function readDatabase(): VirtualClass[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial = getDefaultSeedClasses();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = getDefaultSeedClasses();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading database file, resetting to seed:', err);
    const initial = getDefaultSeedClasses();
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    } catch {}
    return initial;
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

  // 5. Teacher authentication endpoint
  app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    // Password requested: "Meis13579"
    const validPassword = 'Meis13579';

    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }

    if (password.trim() === validPassword) {
      return res.json({
        success: true,
        user: {
          role: 'teacher_admin',
          name: 'Faculty & Teacher Administration',
          authenticatedAt: new Date().toISOString(),
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid password. Please enter the authorized faculty access code.',
    });
  });

  // 6. Reset database to seed
  app.post('/api/reset-data', (req, res) => {
    const seed = getDefaultSeedClasses();
    writeDatabase(seed);
    res.json({ success: true, message: 'Database reset to initial school schedule', data: seed });
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`School Portal Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
