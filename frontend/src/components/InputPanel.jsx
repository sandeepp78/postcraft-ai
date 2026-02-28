import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, ChevronDown, SlidersHorizontal } from 'lucide-react';
import axios from 'axios';

export default function InputPanel({
    rawInput, setRawInput,
    selectedModel, setSelectedModel,
    lengthType, setLengthType,
    toneValue, setToneValue,
    ctaStyles, setCtaStyles,
    hookMode, setHookMode,
    analogMode, setAnalogMode,
    onGenerated,
    onError
}) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const [showToneDropdown, setShowToneDropdown] = useState(false);
    const [showLengthDropdown, setShowLengthDropdown] = useState(false);
    const [showCtaDropdown, setShowCtaDropdown] = useState(false);
    const textareaRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset height
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
        }
    }, [rawInput]);

    const ctaOptions = ['Question CTA', 'Opinion Poll CTA', 'Call to Action CTA', 'Story End CTA', 'Curiosity Hook CTA'];

    const toggleCta = (cta) => {
        if (ctaStyles.includes(cta)) {
            setCtaStyles(ctaStyles.filter(c => c !== cta));
        } else {
            setCtaStyles([...ctaStyles, cta]);
        }
    };

    const handleGenerate = async () => {
        if (!rawInput.trim()) return;
        setIsGenerating(true);
        if (onError) onError(null); // Clear previous errors
        try {
            const res = await axios.post('http://localhost:3001/api/generate', {
                rawInput, length: lengthType, tone: toneValue, ctaStyles, hookMode, analogMode, modelOverride: selectedModel === 'Auto' ? null : selectedModel
            });
            onGenerated(res.data);
            setRawInput(''); // Clear on submit to feel more like a chat
        } catch (err) {
            if (onError) onError(err.response?.data?.error || 'Failed to generate post');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleKeyDown = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            handleGenerate();
        }
    };

    return (
        <div className="w-full flex flex-col items-center mt-2 group">
            <div className="w-full flex flex-col relative bg-white/70 dark:bg-[#ffffff0d] backdrop-blur-xl rounded-[24px] border border-gray-200/50 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] focus-within:border-[var(--accent-primary)] focus-within:shadow-[0_0_25px_rgba(124,58,237,0.3)] transition-all duration-300 p-3">

                <textarea
                    ref={textareaRef}
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message PostCraft AI..."
                    className="w-full bg-transparent border-none focus:ring-0 resize-none min-h-[48px] px-2 pt-2 pb-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 font-medium text-[16px] leading-relaxed custom-scrollbar outline-none"
                    rows={1}
                />

                {/* Bottom Row underneath the input box text */}
                <div className="pt-3 mt-1 flex items-end justify-between w-full border-t border-transparent transition-all">

                    {/* Left side actions/toggles (wrapping automatically) */}
                    <div className="flex flex-wrap items-center gap-2 max-w-[calc(100%-50px)]">

                        {/* Model Dropdown */}
                        <div className="relative font-sans tracking-tight">
                            <button
                                onClick={() => { setShowModelDropdown(!showModelDropdown); setShowToneDropdown(false); setShowLengthDropdown(false); setShowCtaDropdown(false); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 border border-purple-400 hover:from-purple-600 hover:to-pink-600 shadow-[0_4px_10px_rgba(168,85,247,0.3)] hover:shadow-[0_6px_15px_rgba(168,85,247,0.5)] rounded-full cursor-pointer transition-all transform hover:-translate-y-0.5"
                            >
                                Model: {selectedModel}
                                <ChevronDown size={14} className={`transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showModelDropdown && (
                                <div className="absolute bottom-full mb-2 left-0 w-36 bg-white/95 dark:bg-[#2d1b38]/95 backdrop-blur-xl border border-purple-200 dark:border-purple-500/30 rounded-xl shadow-[0_8px_32px_rgba(168,85,247,0.2)] z-[60] py-2 animate-[fadeInUp_0.2s_ease-out]">
                                    {['Auto', 'Claude', 'GPT-4o', 'Grok', 'Gemini', 'Perplexity'].map(mod => (
                                        <button
                                            key={mod}
                                            onClick={() => { setSelectedModel(mod); setShowModelDropdown(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-purple-50 dark:hover:bg-purple-500/10 ${selectedModel === mod ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}
                                        >
                                            {mod}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Tone Dropdown */}
                        <div className="relative font-serif">
                            <button
                                onClick={() => { setShowToneDropdown(!showToneDropdown); setShowModelDropdown(false); setShowLengthDropdown(false); setShowCtaDropdown(false); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500 border border-indigo-400 hover:from-blue-600 hover:to-indigo-600 shadow-[0_4px_10px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_15px_rgba(59,130,246,0.5)] rounded-full cursor-pointer transition-all transform hover:-translate-y-0.5"
                            >
                                Tone: {[
                                    { label: 'Professional', value: 15 },
                                    { label: 'Balanced', value: 50 },
                                    { label: 'Conversational', value: 85 }
                                ].find(t => Math.abs(t.value - toneValue) < 20)?.label || 'Balanced'}
                                <ChevronDown size={14} className={`transition-transform ${showToneDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showToneDropdown && (
                                <div className="absolute bottom-full mb-2 left-0 w-44 bg-white/95 dark:bg-[#1a1c29]/95 backdrop-blur-xl border border-indigo-200 dark:border-indigo-500/30 rounded-xl shadow-[0_8px_32px_rgba(59,130,246,0.2)] z-[60] py-2 animate-[fadeInUp_0.2s_ease-out]">
                                    {[
                                        { label: 'Professional', value: 15 },
                                        { label: 'Balanced', value: 50 },
                                        { label: 'Conversational', value: 85 }
                                    ].map(tone => (
                                        <button
                                            key={tone.label}
                                            onClick={() => { setToneValue(tone.value); setShowToneDropdown(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-500/10 ${Math.abs(toneValue - tone.value) < 20 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}
                                        >
                                            {tone.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Length Dropdown */}
                        <div className="relative font-mono tracking-tight">
                            <button
                                onClick={() => { setShowLengthDropdown(!showLengthDropdown); setShowModelDropdown(false); setShowToneDropdown(false); setShowCtaDropdown(false); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 border border-emerald-400 hover:from-emerald-600 hover:to-teal-600 shadow-[0_4px_10px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_15px_rgba(16,185,129,0.5)] rounded-full cursor-pointer transition-all transform hover:-translate-y-0.5"
                            >
                                Length: {lengthType}
                                <ChevronDown size={14} className={`transition-transform ${showLengthDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showLengthDropdown && (
                                <div className="absolute bottom-full mb-2 left-0 w-36 bg-white/95 dark:bg-[#182a22]/95 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/30 rounded-xl shadow-[0_8px_32px_rgba(16,185,129,0.2)] z-[60] py-2 animate-[fadeInUp_0.2s_ease-out]">
                                    {['Medium', 'Long', 'Deep Long'].map(len => (
                                        <button
                                            key={len}
                                            onClick={() => { setLengthType(len); setShowLengthDropdown(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-500/10 ${lengthType === len ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}
                                        >
                                            {len}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* CTA Dropdown */}
                        <div className="relative">
                            <button onClick={() => { setShowCtaDropdown(!showCtaDropdown); setShowModelDropdown(false); setShowToneDropdown(false); setShowLengthDropdown(false); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 bg-white/50 border border-gray-200/50 hover:bg-white dark:text-gray-300 dark:bg-white/5 dark:border-white/10 hover:text-[var(--accent-primary)] dark:hover:text-[var(--accent-primary)] dark:hover:bg-[var(--accent-primary)]/10 rounded-full cursor-pointer transition-all">
                                CTAs {ctaStyles.length > 0 && <span className="bg-[var(--accent-primary)] text-white px-1.5 rounded-full">{ctaStyles.length}</span>}
                                <ChevronDown size={14} className={`transition-transform ${showCtaDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showCtaDropdown && (
                                <div className="absolute bottom-full mb-2 left-0 w-48 bg-white/90 dark:bg-[#1f1f2e]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] z-[60] py-2 animate-[fadeInUp_0.2s_ease-out]">
                                    {ctaOptions.map(cta => (
                                        <label key={cta} className="flex items-center gap-2 px-4 py-2 hover:bg-purple-50 dark:hover:bg-white/5 cursor-pointer text-sm transition-colors">
                                            <input type="checkbox" checked={ctaStyles.includes(cta)} onChange={() => toggleCta(cta)} className="rounded text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] bg-transparent border-gray-300 dark:border-gray-600" />
                                            <span className="font-medium">{cta}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Special Toggles */}
                        <button onClick={() => setHookMode(!hookMode)} className={`px-3 py-1.5 text-xs font-bold rounded-full border cursor-pointer transition-all duration-300 ${hookMode ? 'bg-gradient-to-r from-pink-500 to-rose-500 border-pink-500 text-white shadow-[0_4px_15px_rgba(236,72,153,0.4)] transform scale-105' : 'bg-white/50 dark:bg-white/5 border-transparent hover:border-pink-300 dark:hover:border-pink-800 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-500/20 text-gray-700 dark:text-gray-300'}`}>
                            Hooks
                        </button>
                    </div>

                    {/* Generate / Send Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!rawInput.trim() || isGenerating}
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer mb-1 ${rawInput.trim() && !isGenerating
                            ? 'bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white shadow-[0_4px_15px_rgba(124,58,237,0.5)] hover:scale-105 hover:shadow-[0_6px_20px_rgba(124,58,237,0.6)]'
                            : 'bg-gray-200 text-gray-400 dark:bg-[#3e3f41] dark:text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {isGenerating ? (
                            <div className="flex gap-0.5 items-center">
                                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        ) : (
                            <ArrowUp size={20} strokeWidth={2.5} />
                        )}
                    </button>

                </div>
            </div >

            <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium opacity-80 mix-blend-difference dark:mix-blend-normal">
                PostCraft AI can make mistakes. Consider verifying important information.
            </div>
        </div >
    );
}
