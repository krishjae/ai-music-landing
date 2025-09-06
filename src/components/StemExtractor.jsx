// File: pages/StemExtractor.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function StemExtractor() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');
  const [demucsAvailable, setDemucsAvailable] = useState(false);

  // Check server and Demucs status on component mount
  useEffect(() => {
    checkServerAndDemucsStatus();
  }, []);

  const checkServerAndDemucsStatus = async () => {
    try {
      // Check if backend server is running
      const healthResponse = await fetch('http://localhost:5001/api/health');
      
      if (!healthResponse.ok) {
        setServerStatus('offline');
        return;
      }

      const healthData = await healthResponse.json();
      console.log('Server status:', healthData);

      // Check if Demucs is installed
      const demucsResponse = await fetch('http://localhost:5001/api/check-demucs');
      const demucsData = await demucsResponse.json();
      
      console.log('Demucs status:', demucsData);

      if (demucsData.installed) {
        setServerStatus('ready');
        setDemucsAvailable(true);
      } else {
        setServerStatus('no-demucs');
        setDemucsAvailable(false);
        setError(`Demucs not installed: ${demucsData.message}`);
      }
    } catch (err) {
      console.error('Server check failed:', err);
      setServerStatus('offline');
      setError('Backend server not available. Please start the server first.');
    }
  };

  const handleFileChange = (file) => {
    setSelectedFile(file);
    setError(null);
    setResults(null);
    setProgress(0);
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

  // Real Demucs processing function
  const processAudio = async () => {
    if (!selectedFile) return;

    // Check server status before processing
    if (serverStatus !== 'ready') {
      setError('Server not ready. Please check server status.');
      return;
    }

    setProcessing(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('audio', selectedFile);

    try {
      console.log('Starting real Demucs processing for:', selectedFile.name);
      console.log('File size:', (selectedFile.size / (1024 * 1024)).toFixed(2), 'MB');

      // Show initial progress
      setProgress(5);

      // Start processing
      const response = await fetch('http://localhost:5001/api/separate', {
        method: 'POST',
        body: formData,
      });

      // Show upload complete
      setProgress(15);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Processing result:', result);

      if (result.success) {
        // Processing completed successfully
        setProgress(100);
        setResults(result);
        console.log('Demucs separation completed successfully');
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (err) {
      console.error('Processing error:', err);
      setError(`Processing failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Download function for real files
  const downloadStem = async (stemType, filePath) => {
    try {
      console.log('Downloading stem:', stemType, filePath);
      
      // Create download link
      const link = document.createElement('a');
      link.href = `http://localhost:5001${filePath}`;
      link.download = `${selectedFile.name.replace(/\.[^/.]+$/, "")}_${stemType}.mp3`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Download initiated for:', stemType);
    } catch (err) {
      console.error('Download error:', err);
      alert(`Download failed: ${err.message}`);
    }
  };

  // Retry server connection
  const retryServerConnection = () => {
    setServerStatus('checking');
    setError(null);
    checkServerAndDemucsStatus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#090E24] to-[#140D26] text-white">
      {/* Header */}
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

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            AI Stem Extractor
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Professional audio separation powered by Facebook's Demucs
          </p>
          
          {/* Server Status Indicator */}
          <div className="flex justify-center mb-6">
            {serverStatus === 'checking' && (
              <div className="px-4 py-2 bg-blue-600/20 border border-blue-500/50 rounded-lg">
                <span className="text-blue-300 text-sm">🔍 Checking server status...</span>
              </div>
            )}
            {serverStatus === 'ready' && (
              <div className="px-4 py-2 bg-green-600/20 border border-green-500/50 rounded-lg">
                <span className="text-green-300 text-sm">🚀 Real Demucs Processing Ready</span>
              </div>
            )}
            {serverStatus === 'no-demucs' && (
              <div className="px-4 py-2 bg-yellow-600/20 border border-yellow-500/50 rounded-lg">
                <span className="text-yellow-300 text-sm">⚠️ Server Online - Demucs Not Installed</span>
              </div>
            )}
            {serverStatus === 'offline' && (
              <div className="px-4 py-2 bg-red-600/20 border border-red-500/50 rounded-lg">
                <span className="text-red-300 text-sm">🔴 Server Offline</span>
              </div>
            )}
          </div>
        </div>

        {/* Server Status Actions */}
        {serverStatus === 'offline' && (
          <div className="mb-8 p-6 bg-red-900/30 border border-red-500/50 rounded-2xl text-center">
            <h3 className="text-red-400 font-semibold mb-3">Backend Server Not Available</h3>
            <p className="text-gray-300 mb-4">Please start the backend server to enable real processing.</p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>1. Open a terminal in your project directory</p>
              <p>2. Run: <code className="bg-gray-700 px-2 py-1 rounded">npm run server-real</code></p>
              <p>3. Make sure the server starts on port 5001</p>
            </div>
            <button 
              onClick={retryServerConnection}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {serverStatus === 'no-demucs' && (
          <div className="mb-8 p-6 bg-yellow-900/30 border border-yellow-500/50 rounded-2xl text-center">
            <h3 className="text-yellow-400 font-semibold mb-3">Demucs Not Installed</h3>
            <p className="text-gray-300 mb-4">Install Demucs to enable real audio processing.</p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Run in terminal:</p>
              <code className="bg-gray-700 px-3 py-2 rounded block">pip3 install demucs torch torchaudio</code>
            </div>
            <button 
              onClick={retryServerConnection}
              className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-full transition-colors"
            >
              Check Again
            </button>
          </div>
        )}

        {/* Upload Section */}
        {serverStatus === 'ready' && (
          <div className="mb-12">
            <div
              className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-purple-400 bg-purple-500/10'
                  : 'border-gray-600 hover:border-purple-500 hover:bg-purple-500/5'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="p-6 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-full">
                    <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">
                    {selectedFile ? selectedFile.name : "Drop your audio file here"}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Support for MP3, WAV, FLAC, M4A files up to 100MB
                  </p>
                  {selectedFile && (
                    <div className="text-sm text-gray-400 mb-4">
                      File size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
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
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg cursor-pointer inline-block"
                  >
                    Choose File
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
              className={`bg-gradient-to-r from-green-600 to-blue-600 text-white px-12 py-4 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg ${
                processing ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-700 hover:to-blue-700'
              }`}
            >
              {processing ? 'Processing with Demucs...' : 'Extract Stems with AI'}
            </button>

            {processing && (
              <div className="mt-8">
                <div className="bg-gray-800 rounded-full h-4 mb-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-300">
                    Processing your audio with Facebook's Demucs AI...
                  </p>
                  <p className="text-sm text-gray-500">
                    This may take 2-5 minutes depending on file length and system performance
                  </p>
                  <div className="text-xs text-gray-600">
                    Progress: {progress}% - Do not close this tab
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && serverStatus === 'ready' && (
          <div className="mb-8 p-6 bg-red-900/30 border border-red-500/50 rounded-2xl">
            <h3 className="text-red-400 font-semibold mb-2">Processing Error</h3>
            <p className="text-gray-300">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-3 text-sm text-red-400 hover:text-red-300"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">
              AI Separated Stems
            </h2>
            
            <div className="text-center mb-6">
              <span className="px-4 py-2 bg-green-600/20 border border-green-500/50 rounded-full text-green-300 text-sm">
                ✅ Real Processing Complete
              </span>
            </div>
            
            <div className="text-center mb-6 text-gray-400">
              <div>Original: {results.originalFile}</div>
              <div className="text-sm mt-1">Processed with Demucs Hybrid Transformer</div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(results.stems).map(([stemType, filePath]) => (
                <div key={stemType} className="bg-gray-800/50 rounded-2xl p-6 text-center hover:bg-gray-700/50 transition-all">
                  <div className="text-4xl mb-3">
                    {stemType === 'vocals' ? '🎤' : 
                     stemType === 'drums' ? '🥁' : 
                     stemType === 'bass' ? '🎸' : '🎵'}
                  </div>
                  <h3 className="text-lg font-semibold mb-3 capitalize text-white">{stemType}</h3>
                  <div className="text-xs text-gray-400 mb-3">AI separated track (.mp3)</div>
                  <button
                    onClick={() => downloadStem(stemType, filePath)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
                  >
                    Download MP3
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                ✨ {results.message}
              </p>
            </div>
          </div>
        )}

        {/* Technology Info */}
        <div className="mt-16 text-center">
          <div className="bg-gray-800/30 rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-4 text-white">
              {serverStatus === 'ready' ? 'Real Demucs Processing Active' : 'Powered by Facebook Demucs'}
            </h3>
            <p className="text-gray-400 mb-4">
              Using state-of-the-art Hybrid Transformer Demucs (v4) for highest quality stem separation
            </p>
            {serverStatus !== 'ready' && (
              <div className="text-sm text-gray-500">
                Ready to process when server is available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
