const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const auth = require('../middleware/auth'); // Adjust path if needed

const storage = multer.diskStorage({
  destination: './uploads/audio/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|m4a|ogg|flac/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only audio files are allowed'));
  }
});

router.post('/analyze', auth, upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  const filePath = req.file.path;
  const python = spawn('python3', ['python/chord_analyzer.py', filePath]);
  
  let dataString = '';
  
  python.stdout.on('data', (data) => {
    dataString += data.toString();
  });
  
  python.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });
  
  python.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: 'Analysis failed' });
    }
    
    try {
      const result = JSON.parse(dataString);
      
      if (result.error) {
        return res.status(500).json({ error: result.error });
      }
      
      res.json({
        ...result,
        audioUrl: `/${filePath}`,
        filename: req.file.originalname
      });
    } catch (e) {
      res.status(500).json({ error: 'Failed to parse analysis results' });
    }
  });
});

module.exports = router;
