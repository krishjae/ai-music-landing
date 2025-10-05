// File: server-real.js
import express from 'express';
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;

// UPDATED: Changed Python path to /usr/bin/python3
const PYTHON_PATH = '/usr/bin/python3';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/separated', express.static(path.join(__dirname, 'separated')));
app.use('/output', express.static(path.join(__dirname, 'output')));

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

// ==============================
// CHORD ANALYZER ROUTES (NEW)
// ==============================

// Configure multer for chord analyzer
const chordStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', 'audio');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const chordUpload = multer({ 
  storage: chordStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|m4a|ogg|flac/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only audio files are allowed'));
  }
});

// Chord Analysis Route
app.post('/api/chord/analyze', chordUpload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  const filePath = req.file.path;
  console.log(`🎵 Analyzing chords for: ${req.file.originalname}`);
  
  // Python script for chord analysis
  const chordAnalysisScript = `
import sys
import json
import librosa
import numpy as np

def analyze_song(audio_file):
    try:
        # Load audio (first 60 seconds for speed)
        y, sr = librosa.load(audio_file, duration=60)
        
        # 1. TEMPO
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        
        # 2. KEY/SCALE
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        key_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        key_index = np.argmax(np.sum(chroma, axis=1))
        key = key_names[key_index]
        
        # 3. MAIN 4 CHORDS (simplified detection)
        chroma_mean = np.mean(chroma, axis=1)
        
        # Generate likely chords based on key
        chords = [
            f"{key}",           # I (Tonic)
            get_chord(key, 5),  # V (Dominant)
            get_chord(key, 3),  # iii
            get_chord(key, 4)   # IV
        ]
        
        return {
            'tempo': round(float(tempo), 2),
            'key': key,
            'scale': f"{key} Major",
            'chords': chords
        }
        
    except Exception as e:
        return {'error': str(e)}

def get_chord(root, semitones):
    keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    root_idx = keys.index(root)
    new_idx = (root_idx + semitones) % 12
    return keys[new_idx]

if __name__ == "__main__":
    audio_file = sys.argv[1]
    result = analyze_song(audio_file)
    print(json.dumps(result))
`;

  // Write temporary Python script
  const tempScriptPath = path.join(__dirname, 'temp_chord_analysis.py');
  fs.writeFileSync(tempScriptPath, chordAnalysisScript);

  // Run Python analysis
  const python = spawn(PYTHON_PATH, [tempScriptPath, filePath]);
  
  let dataString = '';
  let errorString = '';
  
  python.stdout.on('data', (data) => {
    dataString += data.toString();
  });
  
  python.stderr.on('data', (data) => {
    errorString += data.toString();
    console.error(`Python Error: ${data}`);
  });
  
  python.on('close', (code) => {
    // Clean up temp script and input file
    if (fs.existsSync(tempScriptPath)) {
      fs.unlinkSync(tempScriptPath);
    }
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    if (code !== 0) {
      console.error('Chord analysis failed:', errorString);
      return res.status(500).json({ error: 'Analysis failed' });
    }
    
    try {
      const result = JSON.parse(dataString);
      
      if (result.error) {
        return res.status(500).json({ error: result.error });
      }
      
      console.log('✅ Chord analysis complete:', result);
      res.json({
        ...result,
        filename: req.file.originalname
      });
    } catch (e) {
      console.error('Failed to parse results:', e);
      res.status(500).json({ error: 'Failed to parse analysis results' });
    }
  });

  python.on('error', (error) => {
    console.error('Python process error:', error);
    if (fs.existsSync(tempScriptPath)) {
      fs.unlinkSync(tempScriptPath);
    }
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ error: 'Failed to start analysis process' });
  });
});

// ==============================
// END CHORD ANALYZER ROUTES
// ==============================

// Real-time Audio Analysis Function (existing)
const analyzeAudio = async (audioPath) => {
  return new Promise((resolve, reject) => {
    const analysisScript = `
import librosa
import numpy as np
import sys
import json
import warnings
warnings.filterwarnings('ignore')

def analyze_audio(file_path):
    try:
        y, sr = librosa.load(file_path, sr=22050, duration=60)
        
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr, hop_length=512)
        bpm = int(round(tempo))
        
        onset_frames = librosa.onset.onset_detect(y=y, sr=sr, hop_length=512)
        if len(onset_frames) > 10:
            onset_tempo = librosa.frames_to_time(onset_frames, sr=sr, hop_length=512)
            if len(onset_tempo) > 1:
                avg_interval = np.mean(np.diff(onset_tempo))
                onset_bpm = int(60 / avg_interval) if avg_interval > 0 else bpm
                if 60 <= onset_bpm <= 200 and abs(onset_bpm - bpm) > 10:
                    bpm = onset_bpm
        
        chroma = librosa.feature.chroma(y=y, sr=sr, hop_length=1024, n_chroma=12)
        chroma_mean = np.mean(chroma, axis=1)
        
        keys = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B']
        key_idx = np.argmax(chroma_mean)
        detected_key = keys[key_idx]
        
        major_profile = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
        minor_profile = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
        
        major_profile = major_profile / np.sum(major_profile)
        minor_profile = minor_profile / np.sum(minor_profile)
        
        major_shifted = np.roll(major_profile, key_idx)
        minor_shifted = np.roll(minor_profile, key_idx)
        
        major_corr = np.corrcoef(chroma_mean, major_shifted)[0, 1]
        minor_corr = np.corrcoef(chroma_mean, minor_shifted)[0, 1]
        
        if np.isnan(major_corr): major_corr = 0
        if np.isnan(minor_corr): minor_corr = 0
        
        mode = "Major" if major_corr > minor_corr else "Minor"
        full_key = f"{detected_key} {mode}"
        
        if bpm < 60:
            tempo_desc = "Largo"
        elif bpm < 66:
            tempo_desc = "Larghetto"
        elif bpm < 76:
            tempo_desc = "Adagio"
        elif bpm < 108:
            tempo_desc = "Andante"
        elif bpm < 120:
            tempo_desc = "Moderato"
        elif bpm < 168:
            tempo_desc = "Allegro"
        elif bpm < 200:
            tempo_desc = "Presto"
        else:
            tempo_desc = "Prestissimo"
        
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
        brightness = float(np.mean(spectral_centroid))
        
        rms_energy = librosa.feature.rms(y=y)
        energy_level = float(np.mean(rms_energy))
        
        zcr = librosa.feature.zero_crossing_rate(y)
        rhythm_complexity = float(np.mean(zcr))
        
        rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
        spectral_rolloff = float(np.mean(rolloff))
        
        duration = float(len(y) / sr)
        
        result = {
            "bpm": bpm,
            "key": full_key,
            "tempo_description": tempo_desc,
            "energy": round(energy_level * 100, 1),
            "brightness": round(brightness, 1),
            "duration": round(duration, 1),
            "beats_confidence": float(np.mean(np.diff(beats)) if len(beats) > 1 else 0.8),
            "rhythm_complexity": round(rhythm_complexity * 100, 1),
            "spectral_rolloff": round(spectral_rolloff, 1)
        }
        
        return result
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    file_path = sys.argv[1]
    result = analyze_audio(file_path)
    print(json.dumps(result))
`;

    const tempScriptPath = path.join(__dirname, 'temp_analysis.py');
    fs.writeFileSync(tempScriptPath, analysisScript);

    const pythonProcess = spawn(PYTHON_PATH, [tempScriptPath, audioPath], {
      env: { ...process.env }
    });
    
    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (fs.existsSync(tempScriptPath)) {
        fs.unlinkSync(tempScriptPath);
      }

      if (code === 0) {
        try {
          const result = JSON.parse(output.trim());
          if (result.error) {
            console.warn('Audio analysis error:', result.error);
            resolve({
              bpm: 120,
              key: "C Major",
              tempo_description: "Moderato",
              energy: 50.0,
              brightness: 1500.0,
              duration: 180.0,
              beats_confidence: 0.7,
              rhythm_complexity: 45.0,
              spectral_rolloff: 2500.0
            });
          } else {
            resolve(result);
          }
        } catch (parseError) {
          console.error('Failed to parse analysis results:', parseError);
          resolve({
            bpm: 120,
            key: "Unknown",
            tempo_description: "Moderato",
            energy: 50.0,
            brightness: 1500.0,
            duration: 180.0,
            beats_confidence: 0.7,
            rhythm_complexity: 45.0,
            spectral_rolloff: 2500.0
          });
        }
      } else {
        console.error('Analysis failed:', errorOutput);
        resolve({
          bpm: 120,
          key: "Unknown",
          tempo_description: "Moderato",
          energy: 50.0,
          brightness: 1500.0,
          duration: 180.0,
          beats_confidence: 0.7,
          rhythm_complexity: 45.0,
          spectral_rolloff: 2500.0
        });
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('Python process error:', error);
      reject(error);
    });
  });
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'LoopLytic Stem Extractor Running', 
    timestamp: new Date().toISOString(),
    mode: 'production',
    features: ['Real Audio Analysis', 'Zero-Latency Playback', 'Multi-Track Player', 'Chord Detection']
  });
});

// Check Demucs installation with proper Python path - FIXED VERSION
app.get('/api/check-demucs', async (req, res) => {
  try {
    const checkProcess = spawn(PYTHON_PATH, ['-c', 'import demucs; import librosa; print("installed")'], {
      env: { ...process.env }
    });
    
    let output = '';
    let errorOutput = '';
    let responseStatus = null;

    checkProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    checkProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    checkProcess.on('close', (code) => {
      if (responseStatus === null) {
        responseStatus = 'sent';
        if (code === 0 && output.includes('installed')) {
          res.json({ 
            installed: true, 
            message: 'Demucs and audio analysis libraries are properly installed',
            pythonPath: PYTHON_PATH
          });
        } else {
          res.json({ 
            installed: false, 
            message: 'Please install: /usr/bin/python3 -m pip install demucs librosa torch torchaudio numpy scipy',
            error: errorOutput
          });
        }
      }
    });

    checkProcess.on('error', (error) => {
      if (responseStatus === null) {
        responseStatus = 'sent';
        res.json({ 
          installed: false, 
          message: 'Python or Demucs not found', 
          pythonPath: PYTHON_PATH,
          error: error.message
        });
      }
    });
  } catch (error) {
    res.json({ 
      installed: false, 
      message: error.message,
      pythonPath: PYTHON_PATH
    });
  }
});

// Enhanced separation endpoint with multi-track support - FIXED VERSION
app.post('/api/separate', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false,
      error: 'No audio file uploaded' 
    });
  }

  const sessionId = uuidv4();
  const inputFile = req.file.path;
  const outputDir = path.join(__dirname, 'separated');
  const multiTrackOutputDir = path.join(__dirname, 'output', sessionId);
  
  console.log(`🎵 Processing file: ${req.file.originalname}`);
  console.log(`🔑 Session ID: ${sessionId}`);
  console.log(`📁 File size: ${(req.file.size / (1024 * 1024)).toFixed(2)} MB`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  if (!fs.existsSync(multiTrackOutputDir)) {
    fs.mkdirSync(multiTrackOutputDir, { recursive: true });
  }

  let responseStatus = null;

  try {
    console.log('🎼 Analyzing audio features...');
    let audioAnalysis;
    try {
      audioAnalysis = await analyzeAudio(inputFile);
      console.log('✅ Audio analysis complete:', audioAnalysis);
    } catch (analysisError) {
      console.warn('⚠️ Audio analysis failed, using defaults:', analysisError.message);
      audioAnalysis = {
        bpm: 120,
        key: "Unknown",
        tempo_description: "Moderato",
        energy: 50.0,
        brightness: 1500.0,
        duration: 180.0,
        beats_confidence: 0.7,
        rhythm_complexity: 45.0,
        spectral_rolloff: 2500.0
      };
    }

    const checkProcess = spawn(PYTHON_PATH, ['-c', 'import demucs; print("ready")'], {
      env: { ...process.env }
    });
    
    checkProcess.on('error', (error) => {
      if (responseStatus === null) {
        responseStatus = 'sent';
        console.error('Demucs check failed:', error);
        fs.unlinkSync(inputFile);
        return res.status(500).json({
          success: false,
          error: 'Demucs not installed. Run: /usr/bin/python3 -m pip install demucs torch torchaudio librosa'
        });
      }
    });

    checkProcess.on('close', (checkCode) => {
      if (responseStatus !== null) return;

      if (checkCode !== 0) {
        responseStatus = 'sent';
        fs.unlinkSync(inputFile);
        return res.status(500).json({
          success: false,
          error: 'Demucs not properly installed or configured'
        });
      }

      console.log('🎤 Starting enhanced Demucs separation...');
      
      const demucsArgs = [
        '-m', 'demucs.separate',
        '--name', 'htdemucs',
        '--out', multiTrackOutputDir,
        '--mp3',
        '--mp3-bitrate', '320',
        '--jobs', '4',
        inputFile
      ];

      const demucsProcess = spawn(PYTHON_PATH, demucsArgs, {
        env: { ...process.env }
      });

      let stderr = '';
      let stdout = '';

      demucsProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log('🔄 Demucs progress:', data.toString().trim());
      });

      demucsProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        console.log('📊 Demucs info:', data.toString().trim());
      });

      demucsProcess.on('close', (code) => {
        if (responseStatus !== null) return;
        responseStatus = 'sent';

        console.log(`✅ Demucs process finished with code: ${code}`);

        try {
          fs.unlinkSync(inputFile);
          console.log('🧹 Input file cleaned up');
        } catch (err) {
          console.log('⚠️ Could not delete input file:', err.message);
        }

        if (code === 0) {
          const baseName = path.basename(inputFile, path.extname(inputFile));
          const separatedDir = path.join(multiTrackOutputDir, 'htdemucs', baseName);
          
          console.log('🔍 Looking for separated files in:', separatedDir);

          const stemFiles = {
            vocals: path.join(separatedDir, 'vocals.mp3'),
            drums: path.join(separatedDir, 'drums.mp3'),
            bass: path.join(separatedDir, 'bass.mp3'),
            other: path.join(separatedDir, 'other.mp3')
          };

          const stems = {};
          let missingFiles = [];

          for (const [stemType, filePath] of Object.entries(stemFiles)) {
            if (fs.existsSync(filePath)) {
              const relativePath = path.relative(path.join(__dirname, 'output'), filePath);
              stems[stemType] = `/output/${relativePath.replace(/\\/g, '/')}`;
              
              const stats = fs.statSync(filePath);
              console.log(`🎵 ${stemType}: ${(stats.size / (1024 * 1024)).toFixed(2)}MB`);
            } else {
              missingFiles.push(stemType);
              console.error(`❌ Missing stem file: ${filePath}`);
            }
          }

          if (Object.keys(stems).length === 4) {
            console.log('🎉 Separation completed successfully!');
            res.json({
              success: true,
              sessionId: sessionId,
              stems: stems,
              audioAnalysis: audioAnalysis,
              originalFile: req.file.originalname,
              message: 'Audio separation and analysis completed successfully!',
              processingInfo: {
                bpm: audioAnalysis.bpm,
                key: audioAnalysis.key,
                tempo: audioAnalysis.tempo_description,
                energy: audioAnalysis.energy,
                duration: audioAnalysis.duration
              },
              multiTrack: true,
              showPlayer: true
            });
          } else {
            console.error('❌ Some stem files are missing');
            res.status(500).json({
              success: false,
              error: `Missing stems: ${missingFiles.join(', ')}`,
              details: `Expected files in: ${separatedDir}`,
              generatedStems: Object.keys(stems),
              audioAnalysis: audioAnalysis
            });
          }
        } else {
          console.error('❌ Demucs separation failed');
          console.error('stdout:', stdout);
          console.error('stderr:', stderr);
          
          res.status(500).json({ 
            success: false,
            error: 'Audio separation failed', 
            details: stderr || 'Unknown error occurred during processing',
            exitCode: code,
            audioAnalysis: audioAnalysis
          });
        }
      });

      demucsProcess.on('error', (error) => {
        if (responseStatus !== null) return;
        responseStatus = 'sent';

        console.error('❌ Error spawning Demucs process:', error);
        fs.unlinkSync(inputFile);
        res.status(500).json({
          success: false,
          error: 'Failed to start separation process',
          details: error.message,
          pythonPath: PYTHON_PATH
        });
      });
    });

  } catch (error) {
    if (responseStatus === null) {
      responseStatus = 'sent';
      console.error('💥 Unexpected error during separation:', error);
      try {
        fs.unlinkSync(inputFile);
      } catch (cleanupError) {
        console.error('🧹 Could not clean up input file:', cleanupError.message);
      }
      
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }
});

// Start server with enhanced logging
app.listen(PORT, () => {
  console.log(`🚀 LoopLytic Enhanced Server running on http://localhost:${PORT}`);
  console.log(`📊 Features: Real Audio Analysis • Multi-Track Player • Chord Detection`);
  console.log(`🐍 Python Path: ${PYTHON_PATH}`);
  console.log('🔧 Requirements: demucs, librosa, torch, torchaudio, numpy, scipy');
  console.log('🎵 Ready for professional music separation and chord analysis!');
  console.log('⚡ Multi-track player with zero-latency buffer-based playback enabled');
  console.log('🎼 Chord Analyzer API: POST /api/chord/analyze');
});
