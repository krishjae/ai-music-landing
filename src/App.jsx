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
import ChordAnalyzer from "./components/ChordAnalyzer"; // NEW IMPORT
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <Router>
      <div className="bg-gradient-to-br from-[#090E24] to-[#140D26] w-screen max-w-full overflow-x-hidden text-white font-sans scroll-smooth">
        <Navbar isSignedIn={isSignedIn} setIsSignedIn={setIsSignedIn} />
        <Routes>
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
          <Route path="/resources" element={
            <>
              <ResourcePage />
              <Footer />
            </>
          } />
          <Route path="/Login" element={<Login onLogin={() => setIsSignedIn(true)} />} />
          <Route path="/chord-tutor" element={
            <ProtectedRoute isSignedIn={isSignedIn}>
              <ChordTutor />
            </ProtectedRoute>
          } />
          <Route path="/stem-extractor" element={
            <ProtectedRoute isSignedIn={isSignedIn}>
              <StemExtractor />
            </ProtectedRoute>
          } />
          {/* NEW ROUTE - Chord Analyzer */}
          <Route path="/chord-analyzer" element={
            <ProtectedRoute isSignedIn={isSignedIn}>
              <ChordAnalyzer />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}
