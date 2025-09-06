// File: server-real.js
import express from 'express';
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/separated', express.static(path.join(__dirname, 'separated')));

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
    cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.mp3', '.wav', '.flac', '.m4a'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload MP3, WAV, FLAC, or M4A files.'), false);
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Real Demucs server running', 
    timestamp: new Date().toISOString(),
    mode: 'production' 
  });
});

// Check Demucs installation
app.get('/api/check-demucs', async (req, res) => {
  try {
    const checkProcess = spawn('python3', ['-c', 'import demucs; print("OK")']);
    
    checkProcess.on('close', (code) => {
      if (code === 0) {
        res.json({ installed: true, message: 'Demucs is properly installed' });
      } else {
        res.json({ installed: false, message: 'Demucs not found' });
      }
    });

    checkProcess.on('error', () => {
      res.json({ installed: false, message: 'Python3 or Demucs not available' });
    });
  } catch (error) {
    res.json({ installed: false, message: error.message });
  }
});

// Real Demucs separation endpoint
app.post('/api/separate', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false,
      error: 'No audio file uploaded' 
    });
  }

  const inputFile = req.file.path;
  const outputDir = path.join(__dirname, 'separated');
  const sessionId = Date.now().toString();
  
  console.log('Processing file:', req.file.originalname);
  console.log('File size:', (req.file.size / (1024 * 1024)).toFixed(2), 'MB');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // First verify Demucs is available
    const checkDemucs = spawn('python3', ['-c', 'import demucs; print("Demucs ready")']);
    
    checkDemucs.on('error', (error) => {
      console.error('Demucs check failed:', error);
      fs.unlinkSync(inputFile); // Clean up
      return res.status(500).json({
        success: false,
        error: 'Demucs not installed. Run: pip3 install demucs torch torchaudio'
      });
    });

    checkDemucs.on('close', (checkCode) => {
      if (checkCode !== 0) {
        fs.unlinkSync(inputFile); // Clean up
        return res.status(500).json({
          success: false,
          error: 'Demucs not properly installed or configured'
        });
      }

      // Start Demucs separation process
      console.log('Starting Demucs separation...');
      
      const demucsArgs = [
        '-m', 'demucs.separate',
        '--name', 'htdemucs',           // Use hybrid transformer model
        '--out', outputDir,             // Output directory
        '--mp3',                        // Output as MP3
        '--mp3-bitrate', '320',         // High quality MP3
        '--jobs', '4',                  // Use 4 CPU cores
        inputFile
      ];

      const demucsProcess = spawn('python3', demucsArgs);

      let stderr = '';
      let stdout = '';

      // Capture output for debugging
      demucsProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log('Demucs stdout:', data.toString().trim());
      });

      demucsProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        console.log('Demucs stderr:', data.toString().trim());
      });

      // Handle process completion
      demucsProcess.on('close', (code) => {
        console.log(`Demucs process finished with code: ${code}`);

        // Clean up input file
        try {
          fs.unlinkSync(inputFile);
          console.log('Input file cleaned up');
        } catch (err) {
          console.log('Could not delete input file:', err.message);
        }

        if (code === 0) {
          // Success - find the separated files
          const baseName = path.basename(inputFile, path.extname(inputFile));
          const separatedDir = path.join(outputDir, 'htdemucs', baseName);
          
          console.log('Looking for separated files in:', separatedDir);

          // Check if separation was successful
          const stemFiles = {
            vocals: path.join(separatedDir, 'vocals.mp3'),
            drums: path.join(separatedDir, 'drums.mp3'),
            bass: path.join(separatedDir, 'bass.mp3'),
            other: path.join(separatedDir, 'other.mp3')
          };

          // Verify all files exist and create download URLs
          const stems = {};
          let missingFiles = [];

          for (const [stemType, filePath] of Object.entries(stemFiles)) {
            if (fs.existsSync(filePath)) {
              // Convert to URL path
              const relativePath = path.relative(path.join(__dirname, 'separated'), filePath);
              stems[stemType] = `/separated/${relativePath.replace(/\\/g, '/')}`;
              
              // Log file size for verification
              const stats = fs.statSync(filePath);
              console.log(`${stemType}: ${(stats.size / (1024 * 1024)).toFixed(2)}MB`);
            } else {
              missingFiles.push(stemType);
              console.error(`Missing stem file: ${filePath}`);
            }
          }

          if (Object.keys(stems).length === 4) {
            // All stems generated successfully
            res.json({
              success: true,
              sessionId: sessionId,
              stems: stems,
              message: 'Separation completed successfully!',
              originalFile: req.file.originalname,
              processingTime: 'Variable based on file length'
            });
          } else {
            // Some files missing
            res.status(500).json({
              success: false,
              error: `Missing stems: ${missingFiles.join(', ')}`,
              details: `Expected files in: ${separatedDir}`,
              generatedStems: Object.keys(stems)
            });
          }
        } else {
          // Demucs failed
          console.error('Demucs separation failed');
          console.error('stdout:', stdout);
          console.error('stderr:', stderr);
          
          res.status(500).json({ 
            success: false,
            error: 'Audio separation failed', 
            details: stderr || 'Unknown error occurred during processing',
            exitCode: code
          });
        }
      });

      // Handle process errors
      demucsProcess.on('error', (error) => {
        console.error('Error spawning Demucs process:', error);
        fs.unlinkSync(inputFile); // Clean up
        res.status(500).json({
          success: false,
          error: 'Failed to start separation process',
          details: error.message
        });
      });
    });

  } catch (error) {
    console.error('Unexpected error during separation:', error);
    try {
      fs.unlinkSync(inputFile); // Clean up
    } catch (cleanupError) {
      console.error('Could not clean up input file:', cleanupError.message);
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Download endpoint for separated files
app.get('/api/download/:sessionId/:stemType', (req, res) => {
  const { sessionId, stemType } = req.params;
  
  // In a real implementation, you'd track sessions and file locations
  // For now, we'll just serve from the separated directory
  res.json({ message: 'Download endpoint - implementation depends on your file storage strategy' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎵 Real Demucs server running on http://localhost:${PORT}`);
  console.log('✅ Ready for actual stem separation processing');
  console.log('🔧 Make sure Demucs is installed: pip3 install demucs torch torchaudio');
});
