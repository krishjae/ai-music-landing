// File: components/Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer className="w-full text-center text-white/40 text-sm py-8 border-t border-white/10">
      © {new Date().getFullYear()} AI Music Companion. All rights reserved.
    </footer>
  );
}
