import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Setup directories
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const MARKDOWN_DIR = path.join(process.cwd(), 'markdown_db');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(MARKDOWN_DIR)) fs.mkdirSync(MARKDOWN_DIR, { recursive: true });

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// API Routes
app.post('/api/upload', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1 }]), (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const audioUrl = files['audio'] ? `/uploads/${files['audio'][0].filename}` : null;
    const imageUrl = files['image'] ? `/uploads/${files['image'][0].filename}` : null;
    
    res.json({ success: true, audioUrl, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

app.post('/api/report', (req, res) => {
  try {
    const { id, worker, role, shift, tags, audioUrl, imageUrl, rawTranscript, summary } = req.body;
    
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toISOString().split('T')[1].split('.')[0];
    
    const markdownContent = `---
id: ${id}
mitarbeiter: ${worker}
rolle: ${role}
datum: ${date}
zeit: ${time}
schicht: ${shift}
tags: [${tags.join(', ')}]
audio_url: ${audioUrl || ''}
image_urls: [${imageUrl || ''}]
---

## Original Transkript
${rawTranscript}

## Übersetzt & Bereinigt
${summary}
`;

    const filePath = path.join(MARKDOWN_DIR, `${id}.md`);
    fs.writeFileSync(filePath, markdownContent);
    
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save report' });
  }
});

app.get('/api/reports', (req, res) => {
  try {
    const files = fs.readdirSync(MARKDOWN_DIR).filter(f => f.endsWith('.md'));
    const reports = files.map(file => {
      const content = fs.readFileSync(path.join(MARKDOWN_DIR, file), 'utf-8');
      // Simple frontmatter parser for MVP
      const match = content.match(/---\n([\s\S]*?)\n---/);
      if (match) {
        const frontmatter = match[1];
        const data: any = {};
        frontmatter.split('\n').forEach(line => {
          const [key, ...rest] = line.split(':');
          if (key && rest.length) {
            let value: any = rest.join(':').trim();
            if (value.startsWith('[')) value = value.replace(/[\[\]]/g, '').split(',').map((s: string) => s.trim());
            data[key.trim()] = value;
          }
        });
        return data;
      }
      return null;
    }).filter(Boolean);
    
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch reports' });
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
