// c:/Users/sande/OneDrive/Desktop/Linkedin - project/postcraft-ai/frontend/src/components/HookSelector.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function HookSelector({ hooks, rawInput, preferences, onGenerated }) {
    const [selectedHook, setSelectedHook] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateFull = async () => {
        if (!selectedHook) return;
        setIsGenerating(true);

        try {
            const res = await axios.post('http://localhost:3001/api/generate', {
                rawInput,
                length: preferences.lengthType,
                tone: preferences.toneValue,
                ctaStyles: preferences.ctaStyles,
                hookMode: false, // Turn off for final generation to save direct post
                analogMode: preferences.analogMode,
                selectedHook: selectedHook
            });
            onGenerated(res.data);
        } catch (err) {
            alert('Failed to generate full post');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-linkedin-blue/30 rounded-xl p-6 shadow-sm mb-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-bold">Choose your opening hook</h3>
        <span className="px-2 py-0.5 bg-linkedin-blue/10 text-linkedin-blue text-xs font-bold rounded-full uppercase tracking-wider">Step 1 of 2</span>
      </div>
      
      <p className="text-sm text-gray-500 mb-6">Your hook determines 80% of your post's success. Select the one that best fits your target audience.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {hooks.map((hook, idx) => (
          <div 
            key={idx}
            onClick={() => setSelectedHook(hook)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all transform duration-200 hover:-translate-y-1 ${
              selectedHook === hook 
                ? 'border-linkedin-blue bg-linkedin-blue/5 shadow-md shadow-linkedin-blue/20 scale-[1.02]' 
                : 'border-gray-200 dark:border-[#333] hover:border-gray-300 dark:hover:border-[#444] bg-gray-50 dark:bg-[#1f1f1f]'
            }`}
            style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-extrabold text-gray-400">OPTION {idx + 1}</span>
              {selectedHook === hook && (
                <div className="w-5 h-5 rounded-full bg-linkedin-blue flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
            </div>
            <p className="font-medium text-gray-900 dark:text-gray-100 italic leading-relaxed">"{hook}"</p>
          </div>
        ))}
      </div>

      <button
        onClick={handleGenerateFull}
        disabled={!selectedHook || isGenerating}
        className={`w-full py-3 rounded-xl font-bold transition-all shadow-sm flex justify-center items-center gap-2 ${
          selectedHook && !isGenerating 
            ? 'bg-linkedin-blue text-white hover:bg-linkedin-blueHover hover:shadow-md' 
            : 'bg-gray-200 dark:bg-[#2a2a2a] text-gray-400 cursor-not-allowed'
        }`}
      >
        {isGenerating ? 'Writing Full Post...' : 'Generate Full Post With Selected Hook'}
      </button>
    </div>
  );
}
