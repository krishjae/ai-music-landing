// File: server.js
import express from 'express';
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.mp3', '.wav', '.flac', '.m4a'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Middleware - Add CORS support
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/output', express.static(path.join(__dirname, 'separated')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date().toISOString(),
    mode: 'mock' 
  });
});

// Mock Demucs separation endpoint
app.post('/api/separate', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false,
      error: 'No audio file uploaded' 
    });
  }

  console.log('Mock processing file:', req.file.originalname);
  const sessionId = Date.now().toString();
  
  // Simulate processing delay
  setTimeout(() => {
    // Clean up uploaded file
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.log('Could not delete temp file:', err.message);
    }

    // Create mock separated stems URLs
    const baseName = path.basename(req.file.originalname, path.extname(req.file.originalname));
    const stems = {
      vocals: `/mock-stems/vocals_${baseName}.wav`,
      drums: `/mock-stems/drums_${baseName}.wav`,
      bass: `/mock-stems/bass_${baseName}.wav`,
      other: `/mock-stems/other_${baseName}.wav`
    };

    res.json({
      success: true,
      sessionId: sessionId,
      stems: stems,
      message: 'Mock separation completed successfully! (No actual processing - UI testing mode)'
    });
  }, 2000); // 2 second delay to simulate processing
});

// Progress endpoint
app.get('/api/progress/:sessionId', (req, res) => {
  // Mock progress response
  res.json({ 
    progress: Math.floor(Math.random() * 100), 
    status: 'processing' 
  });
});

app.listen(5000, () => {
  console.log('Mock Demucs server running on port 5000');
  console.log('This is a testing version - no actual Demucs processing');
  console.log('Install demucs with: pip3 install demucs torch torchaudio');
});
