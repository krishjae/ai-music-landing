import React from 'react';
import AboutCard from './AboutCard';

const About = () => {
  return (
    <div className="px-6 py-20 max-w-6xl mx-auto text-center">
      {/* Section Title */}
      <h2 className="text-4xl font-bold mb-6">About Our Platform</h2>

      {/* Main Description */}
      <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-3xl mx-auto">
        Our platform, <strong>AI-Powered Chord Tutor & Music Analyzer</strong>, revolutionizes how learners and creators interact with music.
        Upload any track to extract instrumentals, detect chords, and visualize how to play them on guitar or piano —
        all powered by intelligent AI.
      </p>

      {/* Cards Section */}
      <div className="flex flex-wrap justify-center gap-8">
        <AboutCard
          title="Visual Chord Guides"
          emoji="🎸"
          frontText="Learn guitar & piano chords visually from any song."
          backText="Displays real-time fretboard or keyboard diagrams, helping self-taught musicians understand how to play their favorite songs instantly."
        />
        <AboutCard
          title="AI Music Tutor"
          emoji="🤖"
          frontText="Instant feedback and learning support using GPT."
          backText="Our AI tutor gives you contextual practice advice, learning tips, and insights — tailored to your progress and goals."
        />
        <AboutCard
          title="Stem Separation"
          emoji="🎧"
          frontText="Extract vocals, drums, and instruments easily."
          backText="Great for content creators and remixers. Split a song into its musical layers using advanced audio source separation."
        />
      </div>

      {/* Closing statement */}
      <p className="mt-12 text-white/60 text-base max-w-2xl mx-auto">
        Whether you're a beginner, hobbyist, or creator, our platform enhances traditional music education through
        intelligent interaction — supporting both <strong>visual</strong> and <strong>auditory</strong> learning styles.
      </p>
    </div>
  );
};

export default About;
