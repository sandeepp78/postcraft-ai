// c:/Users/sande/OneDrive/Desktop/Linkedin - project/postcraft-ai/frontend/src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import SettingsModal from './components/SettingsModal';

axios.defaults.withCredentials = true; // Send cookies with requests

function Dashboard({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // App State
  const [drafts, setDrafts] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentPost, setCurrentPost] = useState(null); // The generated result object
  const [generationError, setGenerationError] = useState(null);

  // Input State
  const [rawInput, setRawInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('Auto');
  const [lengthType, setLengthType] = useState('Medium');
  const [toneValue, setToneValue] = useState(50);
  const [ctaStyles, setCtaStyles] = useState([]);
  const [hookMode, setHookMode] = useState(false);
  const [analogMode, setAnalogMode] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/posts');
      setHistory(res.data.posts || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchDrafts = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/drafts');
      setDrafts(res.data.drafts || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    fetchDrafts();
  }, [fetchHistory, fetchDrafts]);

  const handleNewPost = () => {
    setCurrentPost(null);
    setGenerationError(null);
    setRawInput('');
    setSelectedModel('Auto');
    setLengthType('Medium');
    setToneValue(50);
    setCtaStyles([]);
    setHookMode(false);
    setAnalogMode(false);
  };

  return (
    <div className="relative flex h-screen text-gray-900 dark:text-gray-100 overflow-hidden font-sans">
      {/* Background Video Layer */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-[-1] opacity-90 dark:opacity-60 pointer-events-none"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 z-[-1] bg-white/40 dark:bg-[#0f0f1a]/60 pointer-events-none mix-blend-overlay"></div>

      {/* Sidebar - Mobile Drawer or Desktop Panel */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      transition-transform duration-300 md:translate-x-0 md:relative fixed z-30
      ${sidebarOpen ? 'w-72' : 'w-0'} flex-shrink-0 bg-white/70 dark:bg-black/40 backdrop-blur-xl border-r border-gray-200/50 dark:border-white/10 h-full shadow-[4px_0_24px_rgba(0,0,0,0.05)]`}>
        <Sidebar
          user={user}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onNewPost={handleNewPost}
          onOpenSettings={() => setShowSettings(true)}
          history={history}
          drafts={drafts}
          onLogout={onLogout}
          refreshHistory={fetchHistory}
          refreshDrafts={fetchDrafts}
          loadPost={(postData) => {
            setCurrentPost(postData);
            if (postData.rawInputOverride !== undefined) {
              setRawInput(postData.rawInputOverride);
            }
          }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col h-full overflow-hidden relative z-10 w-full min-h-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-12 md:pb-24 custom-scrollbar">
          <button
            className="md:hidden absolute top-4 left-4 z-20 p-2 bg-gray-200/80 dark:bg-gray-800/80 backdrop-blur-md rounded-md"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          <div className="max-w-4xl mx-auto mt-10 md:mt-0">
            {currentPost ? (
              <OutputPanel
                postData={currentPost}
                rawInput={rawInput}
                preferences={{ lengthType, toneValue, ctaStyles, hookMode, analogMode }}
                onRegenerate={(updatedPost) => {
                  setCurrentPost(updatedPost);
                  fetchHistory();
                }}
                onSaveDraft={fetchDrafts}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center opacity-90">
                <h2 className="text-3xl font-bold mb-4 drop-shadow-sm">What's on your professional mind?</h2>
                <p className="text-gray-700 dark:text-gray-300 max-w-lg mb-8 font-medium drop-shadow-sm">
                  Paste a rough idea, an article link, or bullet points. PostCraft AI will analyze your intent and choose the perfect LLM to ghostwrite it.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  {generationError ? (
                    <div className="col-span-1 md:col-span-2 p-6 bg-red-50/90 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-left animate-[fadeIn_0.3s_ease-out]">
                      <h3 className="text-red-800 dark:text-red-400 font-bold text-lg mb-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Generation Failed
                      </h3>
                      <p className="text-red-700 dark:text-red-300 font-medium">{generationError}</p>
                    </div>
                  ) : (
                    <>
                      {[
                        { text: 'I just got promoted after 5 years', color: 'bg-emerald-50/80 border-emerald-200 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 dark:bg-emerald-900/40 dark:border-emerald-700/50 dark:text-emerald-300 dark:hover:bg-emerald-800/60' },
                        { text: 'Lessons from my biggest professional failure', color: 'bg-rose-50/80 border-rose-200 text-rose-800 hover:bg-rose-100 hover:border-rose-400 dark:bg-rose-900/40 dark:border-rose-700/50 dark:text-rose-300 dark:hover:bg-rose-800/60' },
                        { text: 'My honest take on AI replacing jobs', color: 'bg-indigo-50/80 border-indigo-200 text-indigo-800 hover:bg-indigo-100 hover:border-indigo-400 dark:bg-indigo-900/40 dark:border-indigo-700/50 dark:text-indigo-300 dark:hover:bg-indigo-800/60' },
                        { text: 'How I went from burnout to balance', color: 'bg-amber-50/80 border-amber-200 text-amber-800 hover:bg-amber-100 hover:border-amber-400 dark:bg-amber-900/40 dark:border-amber-700/50 dark:text-amber-300 dark:hover:bg-amber-800/60' }
                      ].map(prompt => (
                        <div
                          key={prompt.text}
                          onClick={() => setRawInput(prompt.text)}
                          className={`p-4 border backdrop-blur-md rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-1 font-medium ${prompt.color}`}
                        >
                          "{prompt.text}"
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Input Panel at bottom */}
        <div className="flex-shrink-0 border-t border-gray-200/30 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl z-20 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(124,58,237,0.05)]">
          <div className="max-w-4xl mx-auto">
            <InputPanel
              rawInput={rawInput} setRawInput={setRawInput}
              selectedModel={selectedModel} setSelectedModel={setSelectedModel}
              lengthType={lengthType} setLengthType={setLengthType}
              toneValue={toneValue} setToneValue={setToneValue}
              ctaStyles={ctaStyles} setCtaStyles={setCtaStyles}
              hookMode={hookMode} setHookMode={setHookMode}
              analogMode={analogMode} setAnalogMode={setAnalogMode}
              onError={(err) => {
                setGenerationError(err);
                setCurrentPost(null); // Hide output panel on error
              }}
              onGenerated={(result) => {
                setGenerationError(null);
                setCurrentPost(result);
                fetchHistory();
              }}
            />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth status
    axios.get('http://localhost:3001/api/auth/me')
      .then(res => {
        setUser(res.data.user);
        setLoading(false);
      })
      .catch(err => {
        console.log("Not authenticated", err.response?.data);
        setUser(null);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0f0f0f] text-white">Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginScreen />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
