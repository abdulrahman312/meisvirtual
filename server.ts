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
