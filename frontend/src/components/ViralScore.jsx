// c:/Users/sande/OneDrive/Desktop/Linkedin - project/postcraft-ai/frontend/src/components/ViralScore.jsx
import React, { useEffect, useState } from 'react';

export default function ViralScore({ score, breakdown }) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const [animatedBreakdown, setAnimatedBreakdown] = useState({});

    useEffect(() => {
        // Animate overall score
        let start = 0;
        const end = parseInt(score, 10) || 0;
        if (start === end) {
            setAnimatedScore(end);
        } else {
            const duration = 1000;
            const incrementTime = (duration / end);

            const timer = setInterval(() => {
                start += 1;
                setAnimatedScore(start);
                if (start === end) clearInterval(timer);
            }, incrementTime);
            return () => clearInterval(timer);
        }
    }, [score]);

    useEffect(() => {
        // Stagger animate breakdown bars
        if (!breakdown) return;

        const timers = [];
        Object.keys(breakdown).forEach((key, index) => {
            timers.push(
                setTimeout(() => {
                    setAnimatedBreakdown(prev => ({ ...prev, [key]: breakdown[key] }));
                }, index * 100) // 100ms stagger
            );
        });

        return () => timers.forEach(t => clearTimeout(t));
    }, [breakdown]);

    const getColor = (val) => {
        if (val < 41) return '#ef4444'; // red
        if (val < 66) return '#f97316'; // orange
        if (val < 80) return '#eab308'; // yellow
        return '#22c55e'; // green
    };

    const getLabel = (val) => {
        if (val < 41) return 'Needs Work';
        if (val < 66) return 'Good Start';
        if (val < 80) return 'Strong';
        return 'Viral Potential';
    };

    // SVG Arc Calculations
    const radius = 40;
    const strokeWidth = 8;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    // Arc only goes 180 degrees (half circle)
    const arcLength = circumference / 2;
    const strokeDashoffset = arcLength - ((animatedScore / 100) * arcLength);

    return (
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-6 flex flex-col items-center">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 w-full text-left">Viral Potential</h3>

            {/* Gauge */}
            <div className="relative flex flex-col items-center justify-center w-full max-w-[200px] aspect-[2/1] overflow-hidden mb-6">
                <svg height="100%" width="100%" viewBox="0 0 100 50" preserveAspectRatio="xMidYMax meet" className="overflow-visible">
                    {/* Background Arc */}
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="8"
                        className="text-gray-200 dark:text-gray-700"
                    />
                    {/* Foreground Arc */}
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke={getColor(animatedScore)}
                        strokeLinecap="round"
                        strokeWidth="8"
                        strokeDasharray={`${arcLength} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-300 ease-out"
                    />
                </svg>
                <div className="absolute bottom-0 flex flex-col items-center">
                    <span className="text-3xl font-bold" style={{ color: getColor(animatedScore) }}>
                        {animatedScore}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 mt-1">{getLabel(animatedScore)}</span>
                </div>
            </div>

            {/* Breakdown Bars */}
            {breakdown && (
                <div className="w-full space-y-3 mt-4">
                    {Object.entries(breakdown).map(([key, value]) => {
                        const label = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                        const animatedVal = animatedBreakdown[key] || 0;

                        return (
                            <div key={key} className="flex flex-col gap-1 w-full">
                                <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400">
                                    <span>{label}</span>
                                    <span>{value}/100</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-800 ease-out"
                                        style={{
                                            width: `${animatedVal}%`,
                                            backgroundColor: getColor(value)
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
