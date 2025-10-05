import React, { useState } from "react";
import { motion } from "framer-motion";

const bubbles = [
    { size: 80, top: "10%", left: "8%", delay: 0 },
    { size: 50, top: "80%", left: "15%", delay: 0.5 },
    { size: 100, top: "20%", left: "85%", delay: 1 },
    { size: 60, top: "70%", left: "80%", delay: 1.5 },
    { size: 40, top: "50%", left: "95%", delay: 0.8 },
    { size: 30, top: "90%", left: "60%", delay: 1.2 },
];

export default function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Hardcoded demo user
    const TEMP_EMAIL = "user@example.com";
    const TEMP_PASSWORD = "password123";

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email === TEMP_EMAIL && password === TEMP_PASSWORD) {
            if (onLogin) onLogin(email, password);
        } else {
            alert("Invalid credentials.\n\nTry:\nEmail: user@example.com\nPassword: password123");
        }
    };

    return (
        <section className="relative flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-[#090E24] to-[#140D26] px-4 overflow-hidden">
            {/* Bubbles */}
            {bubbles.map((bubble, i) => (
                <motion.div
                    key={i}
                    initial={{ y: 0, opacity: 0.6 }}
                    animate={{ y: [0, -30, 0], opacity: [0.6, 1, 0.6] }}
                    transition={{
                        duration: 6 + bubble.delay,
                        repeat: Infinity,
                        delay: bubble.delay,
                        ease: "easeInOut",
                    }}
                    style={{
                        width: bubble.size,
                        height: bubble.size,
                        top: bubble.top,
                        left: bubble.left,
                        zIndex: 1,
                    }}
                    className="absolute rounded-full bg-white/20 blur-md pointer-events-none"
                />
            ))}

            {/* Glassmorphic Login Container */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/30 shadow-2xl rounded-2xl p-8 w-full max-w-md"
                style={{
                    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                }}
            >
                <div className="mb-6 text-center">
                    <div className="bg-white/10 rounded-full px-4 py-1 text-sm mb-2 inline-block border border-white/20">
                        Welcome Back
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
                    <p className="text-white/70">
                        Access your AI-powered music dashboard
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="email"
                        required
                        placeholder="Email"
                        className="bg-white/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-white/20"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        required
                        placeholder="Password"
                        className="bg-white/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-white/20"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <a href="#" className="text-sm text-green-300 hover:underline">Forgot password?</a>
                    </div>
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-purple-600 to-green-400 text-white py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition transform duration-200"
                    >
                        Login
                    </button>
                </form>

                <div className="my-4 flex items-center">
                    <div className="flex-grow h-px bg-white/20"></div>
                    <span className="mx-3 text-white/50 text-sm">or</span>
                    <div className="flex-grow h-px bg-white/20"></div>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        className="flex items-center justify-center gap-3 bg-white/20 hover:bg-white/30 text-white py-2 rounded-full font-medium border border-white/20 transition"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                        Sign in with Google
                    </button>
                    <button
                        type="button"
                        className="flex items-center justify-center gap-3 bg-white/20 hover:bg-white/30 text-white py-2 rounded-full font-medium border border-white/20 transition"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.68 7.94c-1.01 0-2.27-.7-3.38-.7-1.13 0-2.41.68-3.38.68-.98 0-2.06-.66-3.4-.66C3.1 7.26 0 9.6 0 14.02c0 3.44 2.7 7.98 6.02 7.98 1.09 0 1.98-.7 3.38-.7 1.39 0 2.18.7 3.38.7 3.33 0 6.02-4.48 6.02-7.92 0-4.44-3.1-6.78-5.12-6.78zm-2.1-3.7c.62-.76 1.04-1.82.92-2.89-1.01.04-2.23.68-2.95 1.5-.65.74-1.13 1.8-.93 2.85 1.12.09 2.28-.57 2.96-1.46z"/>
                        </svg>
                        Sign in with Apple
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <span className="text-white/60">Don't have an account?</span>
                    <a href="#" className="text-green-400 ml-2 hover:underline">Sign Up</a>
                </div>
                <div className="mt-6 text-xs text-center text-white/50">
                    <strong>Demo Login:</strong> user@example.com · password123
                </div>
            </motion.div>
        </section>
    );
}
