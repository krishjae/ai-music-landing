import { useState } from 'react';
import axios from 'axios';
import ChordDisplay from './ChordDisplay';

const ChordAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      console.log('File selected:', selectedFile.name);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select an audio file');
      return;
    }

    const formData = new FormData();
    formData.append('audio', file);

    setLoading(true);
    setError('');

    try {
      console.log('Sending request to backend...');
      const res = await axios.post(
        'http://localhost:5001/api/chord/analyze',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('Response received:', res.data);
      setResult(res.data);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#090E24] via-[#140D26] to-[#0d1117] text-white pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            🎵 Chord Analyzer
          </h1>
          <p className="text-gray-400 text-lg">
            Detect tempo, key, scale, and main chords from any song
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl p-8 md:p-10 mb-8 shadow-2xl border border-gray-700/50">
          <h2 className="text-3xl font-bold mb-6 text-white">Upload Your Song</h2>
          
          <div className="mb-8">
            <label className="block text-gray-300 mb-4 text-lg font-semibold">
              Select Audio File
            </label>
            
            {/* Custom File Upload Area */}
            <div className="relative">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                id="file-upload"
              />
              <label 
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-purple-500/50 rounded-xl cursor-pointer bg-gray-800/50 hover:bg-gray-700/50 transition-all hover:border-purple-400"
              >
                <div className="text-center">
                  <svg className="mx-auto h-16 w-16 text-purple-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-xl text-gray-300 mb-2">
                    {file ? '✓ ' + file.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-gray-500">
                    MP3, WAV, M4A, OGG, FLAC (Max 100MB)
                  </p>
                </div>
              </label>
            </div>
            
            {file && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 font-semibold flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Ready to analyze: {file.name}
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/20 border-2 border-red-500 text-red-200 px-6 py-4 rounded-xl mb-6 flex items-start">
              <svg className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <div>
                <p className="font-semibold text-lg">Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || !file}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-5 px-8 rounded-xl text-xl shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-[1.02] disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Analyzing Your Song...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                🎸 Analyze Chords
              </span>
            )}
          </button>
        </div>

        {/* Results Section */}
        {result && !result.error && (
          <ChordDisplay result={result} />
        )}
      </div>
    </div>
  );
};

export default ChordAnalyzer;
