import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import About from "./components/About";
import Footer from "./components/Footer";
import ResourcePage from './components/ResourcePage';
import Login from "./components/Login";
import ChordTutor from "./components/ChordTutor";
import StemExtractor from "./components/StemExtractor";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500); // simulate loading
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <Router>
      <div className="bg-gradient-to-br from-[#090E24] to-[#140D26] w-screen max-w-full overflow-x-hidden text-white font-sans scroll-smooth">
        <Navbar isSignedIn={isSignedIn} setIsSignedIn={setIsSignedIn} />
        <Routes>
          {/* Main page route */}
          <Route path="/" element={
            <>
              <section id="hero" className="min-h-screen flex items-center justify-center snap-start transition-transform duration-700 ease-in-out scale-100 hover:scale-[1.03]">
                <Hero />
              </section>
              <section id="features" className="min-h-screen flex items-center justify-center snap-start transition-transform duration-700 ease-in-out scale-100 hover:scale-[1.03]">
                <Features />
              </section>
              <section id="about" className="min-h-screen flex items-center justify-center snap-start">
                <About />
              </section>
              <Footer />
            </>
          } />
          {/* Resource page route */}
          <Route path="/resources" element={
            <>
              <ResourcePage />
              <Footer />
            </>
          } />
          {/* Login page route */}
          <Route path="/Login" element={<Login onLogin={() => setIsSignedIn(true)} />} />
          {/* Chord Tutor route */}
          <Route path="/chord-tutor" element={<ChordTutor />} />
          {/* Stem Extractor route */}
          <Route path="/stem-extractor" element={<StemExtractor />} />
        </Routes>
      </div>
    </Router>
  );
}
