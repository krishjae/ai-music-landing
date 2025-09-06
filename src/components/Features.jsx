// File: components/Features.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "./Card";

const features = [
  {
    title: "Chord Tutor Module",
    description:
      "Detects chords from any song and displays real-time fretboard and piano diagrams with GPT-powered learning tips.",
    path: "/chord-tutor"
  },
  {
    title: "Stem & Vocal Extractor",
    description:
      "Isolate vocals, drums, and instruments from audio files using Spleeter and Demucs — perfect for practice and remixing.",
    path: "/stem-extractor"
  }
];

export default function Features() {
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <section className="w-full py-20 px-4" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-center mb-12" style={{ color: '#e6e6ef' }}>
          Key Features
        </h2>
        <div className="grid md:grid-cols-2 gap-10">
          {features.map((feature, idx) => (
            <Card 
              key={idx}
              title={feature.title} 
              description={feature.description}
              isClickable={true}
              onClick={() => handleCardClick(feature.path)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
