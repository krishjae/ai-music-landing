// File: pages/StemExtractor.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MultiTrackPlayer from "../components/MultiTrackPlayer";

export default function StemExtractor() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');
  const [processingStage, setProcessingStage] = useState('');

  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      console.log('🔍 Checking server status...');
      setServerStatus('checking');
      
      // Check if server is running
      const healthResponse = await fetch('http://localhost:5001/api/health');
      if (!healthResponse.ok) {
        throw new Error('Server not responding');
      }
      
      console.log('✅ Server is running, checking Demucs...');
      
      // Check Demucs installation
      const demucsResponse = await fetch('http://localhost:5001/api/check-demucs');
      const demucsData = await demucsResponse.json();
      
      console.log('📊 Demucs check result:', demucsData);
      
      if (demucsData.installed) {
        setServerStatus('ready');
        setError(null);
        console.log('🎉 Everything is ready!');
      } else {
        setServerStatus('no-demucs');
        setError(`❌ ${demucsData.message}`);
        console.error('❌ Demucs not installed:', demucsData.message);
      }
    } catch (err) {
      console.error('💥 Server check failed:', err);
      setServerStatus('offline');
      setError('❌ Backend server not available. Make sure to run: npm run server-real');
    }
  };

  const handleFileChange = (file) => {
    setSelectedFile(file);
    setError(null);
    setResults(null);
    setProgress(0);
    setProcessingStage('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const processAudio = async () => {
    if (!selectedFile || serverStatus !== 'ready') return;

    setProcessing(true);
    setProgress(0);
    setError(null);
    setProcessingStage('🔄 Initializing...');

    const formData = new FormData();
    formData.append('audio', selectedFile);

    // Enhanced progress stages
    const progressStages = [
      { progress: 5, stage: '📤 Uploading file...' },
      { progress: 15, stage: '🎼 Analyzing BPM, key & tempo...' },
      { progress: 25, stage: '🤖 Loading Demucs AI model...' },
      { progress: 35, stage: '🎤 Separating vocals...' },
      { progress: 50, stage: '🥁 Extracting drums...' },
      { progress: 65, stage: '🎸 Isolating bass...' },
      { progress: 80, stage: '🎵 Processing other instruments...' },
      { progress: 90, stage: '✨ Finalizing stems...' },
      { progress: 95, stage: '⚡ Preparing zero-latency playback...' }
    ];

    let currentStageIndex = 0;
    const progressInterval = setInterval(() => {
      if (currentStageIndex < progressStages.length) {
        const { progress: stageProgress, stage } = progressStages[currentStageIndex];
        setProgress(stageProgress);
        setProcessingStage(stage);
        currentStageIndex++;
      }
    }, 2500);

    try {
      const response = await fetch('http://localhost:5001/api/separate', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        setProgress(100);
        setProcessingStage('🎉 Complete!');
        setTimeout(() => {
          setResults(result);
          setProcessing(false);
          setProgress(0);
          setProcessingStage('');
        }, 1000);
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError(`💥 Processing failed: ${err.message}`);
      setProgress(0);
      setProcessingStage('');
      setProcessing(false);
    }
  };

  const downloadStem = (stemType, filePath) => {
    const link = document.createElement('a');
    link.href = `http://localhost:5001${filePath}`;
    link.download = `${selectedFile.name.replace(/\.[^/.]+$/, "")}_${stemType}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status display component
  const StatusDisplay = () => {
    if (serverStatus === 'checking') {
      return (
        <div className="flex items-center justify-center space-x-3 px-6 py-3 bg-blue-600/20 border border-blue-500/50 rounded-full text-blue-300">
          <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
          <span>🔍 Checking server status...</span>
        </div>
      );
    }
    
    if (serverStatus === 'offline') {
      return (
        <div className="px-6 py-3 bg-red-600/20 border border-red-500/50 rounded-full text-red-300">
          🔴 Server Offline - Run: npm run server-real
        </div>
      );
    }
    
    if (serverStatus === 'no-demucs') {
      return (
        <div className="px-6 py-3 bg-yellow-600/20 border border-yellow-500/50 rounded-full text-yellow-300">
          ⚠️ Demucs Not Installed
        </div>
      );
    }
    
    if (serverStatus === 'ready') {
      return (
        <div className="px-6 py-3 bg-green-600/20 border border-green-500/50 rounded-full text-green-300">
          ⚡ Zero Latency Ready • Real Audio Analysis • Professional Stems
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b1e] via-[#1a1b2e] to-[#16213e] text-white">
      <div className="relative pt-8 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-6 top-8 flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Home</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            AI Stem Extractor
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform your music with real-time BPM, key detection & professional AI stem separation
          </p>
          
          <div className="flex justify-center mb-8">
            <StatusDisplay />
          </div>
        </div>

        {/* Installation Help */}
        {serverStatus === 'no-demucs' && (
          <div className="mb-12 p-8 bg-gradient-to-r from-yellow-900/20 via-orange-900/20 to-red-900/20 border border-yellow-500/30 rounded-3xl">
            <h3 className="text-2xl font-bold text-yellow-300 mb-4 text-center">🔧 Installation Required</h3>
            <div className="space-y-4 text-gray-300">
              <p className="text-center mb-6">Run these commands in your terminal:</p>
              <div className="bg-black/50 rounded-2xl p-6 font-mono text-sm space-y-2">
                <div className="text-green-400"># 1. Install FFmpeg</div>
                <div className="text-white">brew install ffmpeg</div>
                <div className="text-green-400 mt-4"># 2. Install Demucs & audio libraries</div>
                <div className="text-white">/usr/bin/python3 -m pip install demucs librosa torch torchaudio numpy scipy</div>
                <div className="text-green-400 mt-4"># 3. Verify installation</div>
                <div className="text-white">/usr/bin/python3 -c "import demucs; print('✅ Success!')"</div>
              </div>
              <div className="text-center mt-6">
                <button 
                  onClick={checkServerStatus}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-8 py-3 rounded-full hover:from-yellow-700 hover:to-orange-700 transition-all transform hover:scale-105"
                >
                  🔄 Recheck Installation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        {serverStatus === 'ready' && (
          <div className="mb-12">
            <div
              className={`relative border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-purple-400 bg-purple-500/10 scale-105'
                  : 'border-gray-600 hover:border-purple-500 hover:bg-purple-500/5'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-8">
                <div className="flex justify-center">
                  <div className="p-8 bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-full">
                    <svg className="w-20 h-20 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-semibold mb-4">
                    {selectedFile ? selectedFile.name : "Drop your audio file here"}
                  </h3>
                  <p className="text-gray-400 mb-8 text-lg">
                    MP3, WAV, FLAC, M4A up to 100MB • Real BPM, Key & Tempo Detection
                  </p>
                  {selectedFile && (
                    <div className="text-sm text-gray-400 mb-6">
                      📁 File size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".mp3,.wav,.flac,.m4a"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    className="hidden"
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-5 rounded-full font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-2xl cursor-pointer inline-block text-lg"
                  >
                    🎵 Choose File
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing Section */}
        {selectedFile && serverStatus === 'ready' && (
          <div className="mb-12 text-center">
            <button
              onClick={processAudio}
              disabled={processing}
              className={`bg-gradient-to-r from-green-600 to-blue-600 text-white px-16 py-5 rounded-full font-semibold text-xl transition-all transform hover:scale-105 shadow-2xl ${
                processing ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-700 hover:to-blue-700'
              }`}
            >
              {processing ? '🎵 Analyzing & Extracting...' : '✨ Extract Stems'}
            </button>

            {processing && (
              <div className="mt-8 max-w-md mx-auto">
                <div className="bg-gray-800 rounded-full h-4 mb-4 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 h-4 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-300 text-lg font-medium">{processingStage}</p>
                  <p className="text-sm text-gray-500">
                    {progress}% complete • Real Analysis + Zero Latency Prep
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-6 bg-red-900/30 border border-red-500/50 rounded-2xl text-center">
            <h3 className="text-red-400 font-semibold mb-2">Error</h3>
            <p className="text-gray-300">{error}</p>
            <button onClick={() => setError(null)} className="mt-3 text-sm text-red-400 hover:text-red-300">
              Dismiss
            </button>
          </div>
        )}

        {/* Results with MultiTrack Player - Clean Version */}
        {results && results.showPlayer && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center space-x-4 px-6 py-3 bg-green-600/10 border border-green-500/30 rounded-full text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Separation Complete - {results.originalFile}</span>
                {results.audioAnalysis && (
                  <span className="text-gray-400">
                    • {results.audioAnalysis.bpm} BPM • {results.audioAnalysis.key}
                  </span>
                )}
              </div>
            </div>

            {/* Clean MultiTrack Player - No external buttons */}
            <MultiTrackPlayer 
              stems={results.stems} 
              originalFile={selectedFile ? URL.createObjectURL(selectedFile) : null}
              fileName={results.originalFile}
              audioAnalysis={results.audioAnalysis}
            />

            {/* Optional: Minimal download section (can be removed for cleaner look) */}
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Individual stems are ready for download within the player
              </p>
            </div>
          </div>
        )}

        {/* Legacy Results Display (fallback) */}
        {results && !results.showPlayer && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center space-x-4 px-6 py-3 bg-green-600/20 border border-green-500/50 rounded-full text-green-300">
                <span>✅ Separation Complete - {results.originalFile}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(results.stems).map(([stemType, filePath]) => (
                <div key={stemType} className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl p-6 text-center hover:from-gray-700/50 hover:to-gray-800/50 transition-all backdrop-blur-sm border border-gray-700/30">
                  <div className="text-5xl mb-4">
                    {stemType === 'vocals' ? '🎤' : 
                     stemType === 'drums' ? '🥁' : 
                     stemType === 'bass' ? '🎸' : '🎵'}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 capitalize text-white">{stemType}</h3>
                  <p className="text-sm text-gray-400 mb-4">AI separated track (.mp3)</p>
                  <button
                    onClick={() => downloadStem(stemType, filePath)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Download MP3
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
