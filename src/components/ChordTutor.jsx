// File: pages/ChordTutor.jsx
import React from "react";

export default function ChordTutor() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Chord Tutor Module
        </h1>
        
        <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 
                        backdrop-blur-sm border border-purple-500/20 
                        rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">
            AI-Powered Chord Recognition & Learning
          </h2>
          
          <div className="space-y-6 text-gray-300">
            <p className="text-lg leading-relaxed">
              Upload any song and instantly unlock its chord progressions with our advanced 
              AI analysis. Get real-time visual feedback through interactive fretboard and 
              piano diagrams.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-purple-800/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">
                  Smart Recognition
                </h3>
                <p>Advanced AI detects chords with 95%+ accuracy across all genres</p>
              </div>
              
              <div className="bg-blue-800/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-300 mb-3">
                  Visual Learning
                </h3>
                <p>Interactive fretboard and piano displays for visual learners</p>
              </div>
            </div>
          </div>
          
          <button className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 
                           text-white px-8 py-3 rounded-full font-semibold 
                           hover:from-purple-700 hover:to-blue-700 transition-all">
            Try Chord Tutor
          </button>
        </div>
      </div>
    </div>
  );
}
