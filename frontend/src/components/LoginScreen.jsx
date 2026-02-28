// c:/Users/sande/OneDrive/Desktop/Linkedin - project/postcraft-ai/frontend/src/components/LoginScreen.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        if (!email.trim() || !email.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            // Using withCredentials to ensure session cookie is set
            await axios.post('http://localhost:3001/api/auth/login',
                { email: email.trim(), password: 'noop' },
                { withCredentials: true }
            );
            window.location.href = '/dashboard';
        } catch (err) {
            setError('Failed to log in. Ensure backend is running.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Subtle background glow effect */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-linkedin-blue blur-[150px] opacity-20"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600 blur-[150px] opacity-20"></div>
            </div>

            <div className="z-10 flex flex-col items-center max-w-md w-full animate-[fadeIn_0.5s_ease-out]">
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 w-full shadow-2xl flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-linkedin-blue to-blue-400 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2">PostCraft AI</h1>
                    <p className="text-gray-400 mb-8 font-medium">Turn your thoughts into viral LinkedIn posts</p>

                    <form onSubmit={handleEmailLogin} className="w-full flex flex-col gap-4">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-[#252525] border border-[#333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-linkedin-blue focus:border-transparent transition-all"
                            required
                        />
                        {error && <p className="text-red-500 text-sm text-left px-1">{error}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex items-center justify-center gap-3 bg-linkedin-blue hover:bg-linkedin-blueHover text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Logging in...' : 'Enter Dashboard'}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-gray-500 text-sm">
                    Simple local authentication
                </div>
            </div>
        </div>
    );
}
