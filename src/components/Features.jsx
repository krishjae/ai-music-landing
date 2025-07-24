
// File: components/Features.jsx
import React from "react";
import Card from "./Card";

const features = [
  {
    title: "Chord Tutor Module",
    description:
      "Detects chords from any song and displays real-time fretboard and piano diagrams with GPT-powered learning tips."
  },
  {
    title: "Stem & Vocal Extractor",
    description:
      "Isolate vocals, drums, and instruments from audio files using Spleeter and Demucs — perfect for practice and remixing."
  }
];

export default function Features() {
  return (
    <section className="w-full py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-10">
          {features.map((feature, idx) => (
            <Card key={idx} title={feature.title} description={feature.description} />
          ))}
        </div>
      </div>
    </section>
  );
}
