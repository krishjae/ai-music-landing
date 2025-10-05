import { useState } from 'react';
import Chord from '@tombatossals/react-chords/lib/Chord';

const ChordDisplay = ({ result }) => {
  const [viewMode, setViewMode] = useState('guitar');

  const guitarChords = {
    'C': { frets: [0, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
    'C#': { frets: [-1, 4, 6, 6, 6, 4], fingers: [0, 1, 3, 4, 5, 2] },
    'D': { frets: [-1, 0, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
    'D#': { frets: [-1, -1, 1, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3] },
    'E': { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
    'F': { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barres: [1] },
    'F#': { frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], barres: [2] },
    'G': { frets: [3, 2, 0, 0, 0, 3], fingers: [3, 2, 0, 0, 0, 4] },
    'G#': { frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], barres: [4] },
    'A': { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
    'A#': { frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 3, 4, 5, 1], barres: [1] },
    'B': { frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 3, 4, 5, 2] }
  };

  const instrument = {
    strings: 6,
    fretsOnChord: 4,
    name: 'Guitar',
    keys: [],
    tunings: { standard: ['E', 'A', 'D', 'G', 'B', 'E'] }
  };

  const pianoChords = {
    'C': [0, 4, 7], 'C#': [1, 5, 8], 'D': [2, 6, 9], 'D#': [3, 7, 10],
    'E': [4, 8, 11], 'F': [5, 9, 0], 'F#': [6, 10, 1], 'G': [7, 11, 2],
    'G#': [8, 0, 3], 'A': [9, 1, 4], 'A#': [10, 2, 5], 'B': [11, 3, 6]
  };

  const PianoChord = ({ chordName }) => {
    const keys = pianoChords[chordName] || [0, 4, 7];
    const whiteKeys = [0, 2, 4, 5, 7, 9, 11];

    return (
      <div className="relative h-48 w-full bg-gray-900 rounded-lg p-4">
        <div className="flex h-full">
          {whiteKeys.map((keyIndex) => (
            <div
              key={keyIndex}
              className={`flex-1 border-2 border-gray-600 rounded-b-lg transition-all ${
                keys.includes(keyIndex) 
                  ? 'bg-gradient-to-b from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50' 
                  : 'bg-white'
              }`}
            />
          ))}
        </div>
        <div className="absolute top-4 left-4 w-[calc(100%-2rem)] h-3/5 flex pointer-events-none">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const blackKeyIndex = [1, 3, -1, 6, 8, 10][i];
            if (blackKeyIndex === -1) return <div key={i} className="flex-1" />;
            return (
              <div key={i} className="flex-1 flex justify-end pr-1">
                <div
                  className={`w-2/3 h-full rounded-b-lg shadow-xl transition-all ${
                    keys.includes(blackKeyIndex) 
                      ? 'bg-gradient-to-b from-purple-500 to-purple-700 shadow-purple-500/50' 
                      : 'bg-black'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Song Details */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700/50">
        <h2 className="text-4xl font-bold mb-8 text-center text-white">📊 Song Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-8 rounded-xl border-2 border-yellow-500/40 hover:border-yellow-400 transition-all hover:scale-105">
            <div className="text-6xl font-bold text-yellow-400 mb-3">{result.tempo}</div>
            <div className="text-gray-300 text-lg font-semibold uppercase tracking-wide">BPM (Tempo)</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-8 rounded-xl border-2 border-green-500/40 hover:border-green-400 transition-all hover:scale-105">
            <div className="text-6xl font-bold text-green-400 mb-3">{result.key}</div>
            <div className="text-gray-300 text-lg font-semibold uppercase tracking-wide">Key</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-8 rounded-xl border-2 border-blue-500/40 hover:border-blue-400 transition-all hover:scale-105">
            <div className="text-4xl font-bold text-blue-400 mb-3">{result.scale}</div>
            <div className="text-gray-300 text-lg font-semibold uppercase tracking-wide">Scale</div>
          </div>
        </div>
      </div>

      {/* Chord Diagrams */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700/50">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-4xl font-bold text-white">🎼 Main Chords</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode('guitar')}
              className={`px-8 py-3 rounded-full font-bold text-lg transition-all ${
                viewMode === 'guitar'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-110'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🎸 Guitar
            </button>
            <button
              onClick={() => setViewMode('piano')}
              className={`px-8 py-3 rounded-full font-bold text-lg transition-all ${
                viewMode === 'piano'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-110'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🎹 Piano
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {result.chords.map((chord, index) => (
            <div 
              key={index} 
              className="bg-gray-700/50 p-8 rounded-2xl border-2 border-gray-600 hover:border-purple-500 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
            >
              <h3 className="text-4xl font-bold text-center mb-6 text-purple-300">
                {chord}
              </h3>
              <div className="bg-white p-6 rounded-xl shadow-xl">
                {viewMode === 'guitar' ? (
                  <Chord
                    chord={guitarChords[chord] || guitarChords['C']}
                    instrument={instrument}
                    lite={false}
                  />
                ) : (
                  <PianoChord chordName={chord} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChordDisplay;
