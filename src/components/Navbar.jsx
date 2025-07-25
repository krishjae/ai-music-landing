
import React from "react";
import { Link } from "react-router-dom";

export default function Navbar({ isSignedIn, setIsSignedIn }) {
  return (
    <nav className="fixed top-0 left-0 right-0 w-full flex justify-between items-center px-8 py-4 bg-[#090E24]/80 backdrop-blur-sm text-white font-light z-50">
      <div className="text-lg font-semibold tracking-wide text-white/80">
        <Link to="/">Looplytic</Link>
      </div>
      <div className="flex items-center gap-6">
        <ul className="hidden md:flex gap-6 text-sm tracking-wide text-white/60">
          <li>
            <Link to="/ai-offering" className="hover:text-white transition">
              AI Offering
            </Link>
          </li>
          <li>
            <Link to="/agent-platform" className="hover:text-white transition">
              Agent Platform
            </Link>
          </li>
          <li>
            <Link to="/ai-solutions" className="hover:text-white transition">
              AI Solutions
            </Link>
          </li>
          <li>
            <Link to="/resources" className="hover:text-white transition">
              Resources
            </Link>
          </li>
          <li>
            <Link to="/company" className="hover:text-white transition">
              Company
            </Link>
          </li>
          <li>
            <Link to="/academy" className="hover:text-white transition">
              Academy
            </Link>
          </li>
        </ul>
        {isSignedIn ? (
          <div className="bg-green-500/20 text-green-400 border border-green-400 px-4 py-1 rounded-full text-sm">
            Signed in
          </div>
        ) : (
          <button
            onClick={() => setIsSignedIn(true)}
            className="bg-gradient-to-r from-purple-600 to-green-400 text-white py-2 px-4 rounded-full text-sm shadow hover:scale-105 transition"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
