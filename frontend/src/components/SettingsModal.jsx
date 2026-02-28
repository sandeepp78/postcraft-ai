// c:/Users/sande/OneDrive/Desktop/Linkedin - project/postcraft-ai/frontend/src/components/SettingsModal.jsx
import React, { useEffect } from 'react';
import { X, Settings, ShieldAlert, Palette } from 'lucide-react';

export default function SettingsModal({ onClose }) {
  useEffect(() => {
    // Init theme from localStorage
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Persistent Dark Mode toggle
  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#333] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#333]">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings size={20} className="text-linkedin-blue" />
            PostCraft Settings
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow p-6 overflow-y-auto">

          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mb-8 flex items-start gap-3">
            <ShieldAlert size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-bold text-gray-900 dark:text-gray-100 mb-1">API Keys configured via Environment file</p>
              <p>For improved security and convenience, PostCraft AI now reads API keys securely from the backend `.env` file directly. You no longer need to enter them in the UI.</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-[#333]">
            <h3 className="text-lg font-bold mb-4">Display Preferences</h3>
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-[#333] rounded-xl bg-gray-50 dark:bg-[#252525]">
              <span className="font-medium">Toggle Global Theme (Dark/Light)</span>
              <button
                onClick={toggleDarkMode}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg text-sm font-semibold shadow-md transition-all transform hover:-translate-y-0.5"
              >
                Toggle Theme
              </button>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            You can close this window and start generating posts right away.
          </div>
        </div>
      </div>
    </div>
  );
}
