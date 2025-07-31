// File: components/Hero.jsx
import React from "react";
import { Link } from "react-router-dom";
import BlurText from "./BlurText";


const handleAnimationComplete = () => {
  console.log('Animation completed!');
};

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center min-h-screen w-full px-4 pt-20">
      <div className="bg-white/10 rounded-full px-4 py-1 text-sm mb-4">
        AI-Powered Music Intelligence
      </div>
      <BlurText
        text="Effortless Music Learning Starts Here."
        delay={150}
        animateBy="words"
        direction="top"
        onAnimationComplete={handleAnimationComplete}
        className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
      />
      <p className="text-lg md:text-xl text-white/70 max-w-2xl mb-8 leading-relaxed">
        Upload any song and instantly unlock chords, stems, and interactive instrument guides powered by AI.
      </p>
      <Link
        to="/login"
        className="bg-gradient-to-r from-purple-600 to-green-400 text-white py-3 px-6 rounded-full shadow-lg hover:scale-105 transition transform duration-200"
      >
        Get Started
      </Link>
    </section>
  );
}