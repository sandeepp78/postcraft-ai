import React, { useState, useEffect } from 'react';
import { Copy, Save, RefreshCw, FileText, Check, Clock, Info, PenSquare, Edit2, X, CheckSquare } from 'lucide-react';
import axios from 'axios';
import ViralScore from './ViralScore';
import HookSelector from './HookSelector';

export default function OutputPanel({ postData, rawInput, preferences, onRegenerate, onSaveDraft }) {
  const { result, postId } = postData;
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  // AI Refine State
  const [showImprove, setShowImprove] = useState(false);
  const [improveInstruction, setImproveInstruction] = useState('');

  // Manual Edit State
  const [isEditingText, setIsEditingText] = useState(false);
  const [editedText, setEditedText] = useState('');

  // Sync edited text with incoming results
  useEffect(() => {
    if (result.post) {
      setEditedText(result.post.replace(/\\n/g, '\n'));
    }
  }, [result.post]);

  const handleCopy = () => {
    const textToCopy = `${isEditingText ? editedText : result.post.replace(/\\n/g, '\n')}\n\n${(result.hashtags || []).map(t => '#' + t).join(' ')}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      try { document.execCommand('copy'); } catch (err) { }
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveDraft = async () => {
    try {
      await axios.post('http://localhost:3001/api/drafts', {
        title: rawInput ? (rawInput.substring(0, 40) + '...') : ((isEditingText ? editedText : result.post).substring(0, 40) + '...'),
        raw_input: rawInput || "",
        post_content: isEditingText ? editedText : result.post,
        model_used: result.model_used,
        settings: {
          ...preferences,
          viral_score: result.viral_score,
          viral_breakdown: result.viral_breakdown,
          hashtags: result.hashtags
        }
      });
      if (onSaveDraft) onSaveDraft();
      alert('Saved to drafts! You can view it in the sidebar.');
    } catch (err) {
      alert('Failed to save draft');
    }
  };

  const handleRegenerateModel = async () => {
    setIsRegenerating(true);
    try {
      const res = await axios.post('http://localhost:3001/api/generate', {
        rawInput,
        length: preferences.lengthType,
        tone: preferences.toneValue,
        ctaStyles: preferences.ctaStyles,
        hookMode: preferences.hookMode,
        analogMode: preferences.analogMode,
        triedModels: [result.model_used]
      });
      onRegenerate(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to regenerate with new model');
    } finally {
      setIsRegenerating(false);
      setIsEditingText(false);
    }
  };

  const handleImprove = async () => {
    if (!improveInstruction.trim()) return;
    setIsRegenerating(true);
    try {
      const res = await axios.post('http://localhost:3001/api/generate', {
        rawInput: `Original Text: ${isEditingText ? editedText : result.post}\\n\\nInstruction: ${improveInstruction}`,
        length: preferences.lengthType,
        tone: preferences.toneValue,
        ctaStyles: preferences.ctaStyles,
        hookMode: false,
        analogMode: preferences.analogMode,
        modelOverride: result.model_used
      });
      onRegenerate(res.data);
      setShowImprove(false);
      setImproveInstruction('');
      setIsEditingText(false);
    } catch (err) {
      alert('Failed to improve post');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveManualEdit = () => {
    // In a full app, you might want to save this back to the backend DB immediately.
    // For now, we update the local state so it's ready to be copied or saved as a draft.
    setIsEditingText(false);
    // Note: To fully persist, you'd trigger an API call to update the post by its ID.
  };

  const modelColors = {
    'Claude': 'bg-purple-500 shadow-[0_0_10px_theme(colors.purple.500)]',
    'GPT-4o': 'bg-green-500 shadow-[0_0_10px_theme(colors.green.500)]',
    'Grok': 'bg-red-500 shadow-[0_0_10px_theme(colors.red.500)]',
    'Gemini': 'bg-blue-500 shadow-[0_0_10px_theme(colors.blue.500)]',
    'Perplexity': 'bg-teal-500 shadow-[0_0_10px_theme(colors.teal.500)]'
  };

  return (
    <div className="w-full animate-[fadeInUp_0.4s_ease-out]">
      {/* 1. Model Banner */}
      <div className="flex items-center justify-between bg-white/70 dark:bg-black/40 backdrop-blur-xl p-3 rounded-xl border border-gray-200/50 dark:border-white/10 mb-6 shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_4px_20px_rgba(124,58,237,0.1)] transition-all">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold tracking-tight text-gray-800 dark:text-gray-100">
            <span className={`w-3 h-3 rounded-full ${modelColors[result.model_used] || 'bg-gray-500'}`}></span>
            Generated by {result.model_used}
          </div>
          <div className="group relative cursor-help flex items-center">
            <Info size={16} className="text-gray-400 hover:text-[var(--accent-primary)] transition-colors" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900/95 backdrop-blur-sm border border-gray-700 text-white text-xs rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 animate-[fadeInUp_0.2s_ease-out]">
              <p className="font-bold mb-1 border-b border-gray-700 pb-1 text-[var(--accent-primary)]">Why this model?</p>
              <p className="mt-1 leading-relaxed">{result.model_reason || "Selected based on input classification rules."}</p>
              <div className="absolute left-1/2 -ml-2 -bottom-2 border-4 border-transparent border-t-gray-900/95"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hook Selector (if hooks exist and no main post) */}
      {result.hooks && result.hooks.length > 0 && !result.post && (
        <HookSelector hooks={result.hooks} rawInput={rawInput} preferences={preferences} onGenerated={onRegenerate} />
      )}

      {/* Main Results Grid */}
      {result.post && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">

            {/* 4. Post Card */}
            <div className="bg-white/80 dark:bg-[#ffffff0a] backdrop-blur-2xl rounded-2xl border border-gray-200/50 dark:border-white/10 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_40px_rgba(124,58,237,0.15)] flex flex-col">

              <div className="p-4 border-b border-gray-200/50 dark:border-white/10 flex flex-wrap justify-between items-center bg-gray-50/50 dark:bg-[#1a1a2e]/40 gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
                  <div className="p-1.5 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-lg shadow-sm">
                    <FileText size={16} className="text-white" />
                  </div>
                  Draft Ready
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex bg-white/60 dark:bg-white/5 rounded-md px-2.5 py-1 text-xs font-mono font-bold text-gray-500 dark:text-gray-400 border border-gray-200/50 dark:border-white/5">
                    {(isEditingText ? editedText : result.post).split(/\s+/).length} words
                  </div>

                  {/* Manual Edit Toggle Button */}
                  {isEditingText ? (
                    <button onClick={handleSaveManualEdit} className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg shadow-sm transition-all text-xs transform hover:scale-105">
                      <CheckSquare size={14} /> Done
                    </button>
                  ) : (
                    <button onClick={() => setIsEditingText(true)} className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white/50 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200/50 dark:border-white/10 text-gray-700 dark:text-gray-200 font-bold rounded-lg shadow-sm transition-all text-xs">
                      <Edit2 size={14} className="text-[var(--accent-primary)]" /> Edit
                    </button>
                  )}

                  {/* AI Refine Button */}
                  <button onClick={() => setShowImprove(!showImprove)} className={`flex items-center justify-center gap-1.5 py-1.5 px-3 border border-gray-200/50 dark:border-white/10 text-gray-700 dark:text-gray-200 font-bold rounded-lg shadow-sm transition-all text-xs ${showImprove ? 'bg-[var(--accent-primary)] text-white border-transparent' : 'bg-white/50 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10'}`}>
                    <PenSquare size={14} className={showImprove ? "text-white" : "text-blue-500"} /> AI Refine
                  </button>

                  <button onClick={handleSaveDraft} className="flex items-center justify-center gap-1.5 py-1.5 px-3 border border-gray-200/50 dark:border-white/10 bg-white/50 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 font-bold rounded-lg shadow-sm transition-all text-xs">
                    <Save size={14} className="text-emerald-500" /> Save
                  </button>

                  <button onClick={handleCopy} className="flex items-center justify-center gap-1.5 py-1.5 px-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:opacity-90 text-white font-bold rounded-lg shadow-[0_4px_12px_rgba(124,58,237,0.4)] transition-all text-xs transform hover:scale-105">
                    {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Inline AI Improve Box */}
              {showImprove && (
                <div className="p-4 border-b border-[var(--accent-primary)]/20 bg-[var(--accent-primary)]/5 dark:bg-[var(--accent-primary)]/10 animate-[fadeInDown_0.2s_ease-out]">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs font-extrabold text-[var(--accent-primary)] uppercase tracking-wider flex items-center gap-2">
                      ✨ Prompt AI to Edit
                    </p>
                    <button onClick={() => setShowImprove(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex gap-2 relative">
                    <input
                      type="text"
                      value={improveInstruction}
                      onChange={e => setImproveInstruction(e.target.value)}
                      placeholder="e.g., Make the opening punchier, add a corporate joke..."
                      className="flex-1 pl-4 pr-24 py-3 bg-white/80 dark:bg-black/40 backdrop-blur-md border border-gray-300/50 dark:border-white/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--accent-primary)] outline-none shadow-inner"
                    />
                    <button onClick={handleImprove} disabled={isRegenerating || !improveInstruction.trim()} className="absolute right-1.5 top-1.5 bottom-1.5 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white px-4 rounded-lg text-sm font-bold hover:shadow-[0_0_15px_rgba(124,58,237,0.5)] transition-all disabled:opacity-50">
                      {isRegenerating ? <RefreshCw size={14} className="animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                </div>
              )}

              {/* Text Area Content */}
              <div className="relative flex-grow flex flex-col overflow-y-auto custom-scrollbar max-h-[500px]">
                {isEditingText ? (
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full h-full min-h-[300px] p-6 bg-yellow-50/30 dark:bg-yellow-900/10 text-gray-900 dark:text-gray-100 font-medium leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-colors"
                  />
                ) : (
                  <div className="p-6 text-gray-800 dark:text-gray-200 leading-relaxed font-medium whitespace-pre-wrap">
                    {editedText}
                  </div>
                )}
              </div>
            </div>

            {/* 5. Hashtag Pills */}
            {result.hashtags && result.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center bg-white/40 dark:bg-black/20 p-3 rounded-xl border border-gray-200/50 dark:border-white/5 backdrop-blur-sm shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mr-2 flex items-center gap-1.5">
                  <CheckSquare size={14} className="text-[var(--accent-primary)]" />
                  Suggested Tags
                </span>
                {result.hashtags.map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      navigator.clipboard.writeText('#' + tag);
                      alert(`Copied #${tag}`);
                    }}
                    className="px-3 py-1.5 bg-white/70 dark:bg-white/5 hover:bg-[var(--accent-primary)] hover:text-white dark:hover:bg-[var(--accent-primary)] border border-gray-200/50 dark:border-white/10 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 transition-all cursor-pointer shadow-sm transform hover:-translate-y-0.5"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

          </div>

          <div className="md:col-span-1 space-y-6">
            {/* 3. Viral Score Gauge - UNTOUCHED DESIGN */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-gray-200 dark:border-[#2a2a2a] p-1">
              <ViralScore score={result.viral_score} breakdown={result.viral_breakdown} />
            </div>

            {/* 6. Best Time Card */}
            {result.best_time && (
              <div className="bg-white/70 dark:bg-[#ffffff0a] backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_40px_rgba(124,58,237,0.15)] transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 shadow-[0_4px_12px_rgba(249,115,22,0.3)] flex items-center justify-center transform rotate-12">
                    <Clock size={20} className="text-white transform -rotate-12" />
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-800 dark:text-gray-200 uppercase tracking-widest">When to Post</h3>
                </div>
                <div className="p-3 bg-orange-50/50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800/50 mb-3 block">
                  <p className="font-bold text-lg text-gray-900 dark:text-gray-100 text-center">{result.best_time}</p>
                </div>
                <div className="border-l-4 border-orange-400 pl-4 py-1 block">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic block pb-2">
                    {result.best_time_reason}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


