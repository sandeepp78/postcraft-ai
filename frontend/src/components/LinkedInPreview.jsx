// c:/Users/sande/OneDrive/Desktop/Linkedin - project/postcraft-ai/frontend/src/components/LinkedInPreview.jsx
import React, { useState } from 'react';
import { ThumbsUp, MessageSquareText, Repeat2, Send, Globe2, MoreHorizontal } from 'lucide-react';

export default function LinkedInPreview({ postText, user }) {
    const [expanded, setExpanded] = useState(false);

    // Parse text for 'see more' truncation
    const lines = postText ? postText.split('\\n') : [];
    const isLong = lines.length > 3 || (postText && postText.length > 200);

    const displayLines = expanded ? lines : lines.slice(0, 3);

    return (
        <div className="w-full h-full bg-[#f3f2ef] dark:bg-[#000000] p-4 flex justify-center sticky top-0 custom-scrollbar">
            <div className="bg-white dark:bg-[#1d2226] border border-gray-200 dark:border-[#38434f] rounded-lg shadow-sm w-[350px] max-w-full flex flex-col my-4 h-max">

                {/* Header */}
                <div className="flex items-start justify-between p-4 pb-2">
                    <div className="flex items-center gap-2">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="Profile" className="w-12 h-12 rounded-full hidden md:block" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-linkedin-blue text-white flex items-center justify-center font-bold text-lg cursor-pointer">
                                {user?.name?.substring(0, 2) || 'ME'}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-1 group cursor-pointer hover:underline text-black dark:text-white">
                                <span className="font-bold text-sm">{user?.name || "Your Name"}</span>
                                <span className="text-gray-500 text-xs font-normal">• 1st</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-[#b0b0b0]">LinkedIn Builder • Thought Leader</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-[#b0b0b0]">
                                <span>Just now</span>
                                <span>•</span>
                                <Globe2 size={12} />
                            </div>
                        </div>
                    </div>
                    <button className="text-gray-500 hover:bg-gray-100 dark:hover:bg-[#38434f] p-1.5 rounded-full transition-colors cursor-pointer">
                        <MoreHorizontal size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-4 py-2 text-sm text-[#000000e6] dark:text-[#e9e9e9] leading-6 font-normal break-words">
                    {!postText && (
                        <div className="h-24 bg-gray-100 dark:bg-[#2d333a] rounded-md animate-pulse"></div>
                    )}
                    {postText && (
                        <>
                            {displayLines.map((line, i) => (
                                <div key={i} className={`${line.trim() === '' ? 'h-3' : ''}`}>
                            {line}
                            {(i === 2 && !expanded && isLong) && (
                                <span className="text-gray-500">...
                                    <button onClick={() => setExpanded(true)} className="hover:underline hover:text-linkedin-blue font-semibold text-gray-500 dark:text-[#b0b0b0] cursor-pointer ml-1">
                                        see more
                                    </button>
                                </span>
                            )}
                        </div>
              ))}

                    {(expanded || !isLong) && (
                        <div className="mt-4 text-linkedin-blue hover:underline cursor-pointer font-semibold text-xs">
                            #postcraftai #linkedin #growth
                        </div>
                    )}
                </>
          )}
            </div>

            {/* Social Proof Bar */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-[#38434f] text-xs text-gray-500 dark:text-[#b0b0b0]">
                <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                        <span className="bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] z-20 border border-white">👍</span>
                        <span className="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] z-10 border border-white">❤️</span>
                        <span className="bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] border border-white">👏</span>
                    </div>
                    <span className="ml-1 hover:text-linkedin-blue cursor-pointer hover:underline">1,024</span>
                </div>
                <div className="flex gap-2">
                    <span className="hover:text-linkedin-blue cursor-pointer hover:underline">88 comments</span>
                    <span>•</span>
                    <span className="hover:text-linkedin-blue cursor-pointer hover:underline">12 reposts</span>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="px-2 py-1 flex justify-between items-center text-sm font-semibold text-gray-600 dark:text-[#b0b0b0]">
                <button className="flex items-center gap-1.5 p-3 hover:bg-gray-100 dark:hover:bg-[#38434f] rounded-lg transition-colors flex-1 justify-center cursor-pointer">
                    <ThumbsUp size={20} className="scale-x-[-1]" />
                    <span className="hidden sm:block">Like</span>
                </button>
                <button className="flex items-center gap-1.5 p-3 hover:bg-gray-100 dark:hover:bg-[#38434f] rounded-lg transition-colors flex-1 justify-center cursor-pointer">
                    <MessageSquareText size={20} className="scale-x-[-1]" />
                    <span className="hidden sm:block">Comment</span>
                </button>
                <button className="flex items-center gap-1.5 p-3 hover:bg-gray-100 dark:hover:bg-[#38434f] rounded-lg transition-colors flex-1 justify-center cursor-pointer">
                    <Repeat2 size={20} />
                    <span className="hidden sm:block">Repost</span>
                </button>
                <button className="flex items-center gap-1.5 p-3 hover:bg-gray-100 dark:hover:bg-[#38434f] rounded-lg transition-colors flex-1 justify-center cursor-pointer">
                    <Send size={20} className="scale-y-[-1] -rotate-45" />
                    <span className="hidden sm:block">Send</span>
                </button>
            </div>
        </div>
    </div >
  );
}
