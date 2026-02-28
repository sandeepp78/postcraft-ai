import React, { useState } from 'react';
import { Plus, LayoutTemplate, History, Settings, LogOut, X, ChevronDown, ChevronRight, PenSquare, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function Sidebar({ user, isOpen, setIsOpen, onNewPost, onOpenSettings, history, drafts, onLogout, refreshHistory, refreshDrafts, loadPost }) {
  const [draftsOpen, setDraftsOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleDeleteDraft = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this draft?')) {
      await axios.delete(`http://localhost:3001/api/drafts/${id}`);
      refreshDrafts();
    }
  };

  const handleDeleteHistory = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this post from history?')) {
      await axios.delete(`http://localhost:3001/api/posts/${id}`);
      refreshHistory();
    }
  };

  const clearAllHistory = async () => {
    await axios.delete('http://localhost:3001/api/posts');
    refreshHistory();
    setShowClearConfirm(false);
  };

  const loadHistoryItem = async (id) => {
    try {
      const res = await axios.get(`http://localhost:3001/api/posts/${id}`);
      const { post } = res.data;
      // Reconstruct payload for OutputPanel
      loadPost({
        result: {
          post: post.generated_post,
          viral_score: post.viral_score,
          viral_breakdown: post.viral_breakdown,
          hashtags: post.hashtags,
          model_used: post.model_used,
          best_time: post.best_time,
          best_time_reason: post.best_time_reason
        },
        rawInputOverride: (post.raw_input && post.raw_input !== "Generated from prompt") ? post.raw_input : "",
        postId: post.id
      });
    } catch (err) {
      console.error(err);
    }
  };

  const loadDraftItem = (d) => {
    // A Draft doesn't have the full Generation metadata (like true viral score), 
    // but it has the text content and model used.
    loadPost({
      result: {
        post: d.post_content,
        model_used: d.model_used || "Unknown",
        // Load saved draft metadata or use defaults if not present
        viral_score: d.settings?.viral_score || 0,
        viral_breakdown: d.settings?.viral_breakdown || {},
        hashtags: d.settings?.hashtags || [],
        best_time: null,
        best_time_reason: null
      },
      // Important to pass rawInput mapping so it repopulates. If it says "Generated from prompt", intercept it.
      rawInputOverride: (d.raw_input && d.raw_input !== "Generated from prompt") ? d.raw_input : "",
      draftId: d.id
    });
  };

  return (
    <div className="h-full flex flex-col pt-4 bg-gradient-to-b from-white to-slate-100 dark:from-[#121220] dark:to-[#0e0e1a] text-gray-800 dark:text-gray-100">
      {/* Top Header */}
      <div className="px-5 flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-xl flex items-center justify-center shadow-[0_4px_15px_rgba(124,58,237,0.4)]">
            <LayoutTemplate size={20} className="text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight hidden md:block lg:block">PostCraft <span className="text-[var(--accent-primary)] font-black">AI</span></span>
        </div>
        <button onClick={() => setIsOpen(false)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-white/10 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* New Post Button */}
      <div className="px-4 mb-6">
        <button
          onClick={onNewPost}
          className="w-full bg-white/60 dark:bg-white/5 hover:bg-[var(--accent-primary)]/10 dark:hover:bg-[var(--accent-primary)]/20 border border-gray-200/50 dark:border-white/10 text-[var(--accent-primary)] font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:shadow-[0_0_15px_rgba(124,58,237,0.2)]"
        >
          <Plus size={20} strokeWidth={3} />
          New Draft
        </button>
      </div>

      {/* Scrollable Lists */}
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        {/* Drafts Section */}
        <div className="mb-8">
          <button
            className="flex items-center justify-between w-full text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-3 hover:text-[var(--accent-primary)] transition-colors"
            onClick={() => setDraftsOpen(!draftsOpen)}
          >
            <div className="flex items-center gap-1">
              {draftsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Saved Drafts ({drafts.length})
            </div>
          </button>

          {draftsOpen && (
            <div className="space-y-1.5">
              {drafts.length === 0 ? (
                <div className="text-sm text-gray-400 dark:text-gray-600 italic px-2 font-medium">No drafts yet</div>
              ) : (
                drafts.map(d => (
                  <div key={d.id} onClick={() => loadDraftItem(d)} className="group flex items-center justify-between p-2.5 rounded-lg bg-transparent hover:bg-[var(--accent-primary)]/10 dark:hover:bg-[var(--accent-primary)]/20 cursor-pointer text-sm font-medium transition-all duration-200 hover:pl-3">
                    <div className="flex items-center gap-3 truncate opacity-80 group-hover:opacity-100 group-hover:text-[var(--accent-primary)] dark:group-hover:text-white">
                      <PenSquare size={16} className="flex-shrink-0 text-[var(--accent-secondary)]" />
                      <span className="truncate">{d.title || d.raw_input.substring(0, 30)}</span>
                    </div>
                    <button onClick={(e) => handleDeleteDraft(e, d.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-white hover:bg-red-500 rounded-md transition-colors" title="Delete Draft">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* History Section */}
        <div>
          <button
            className="flex items-center justify-between w-full text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-3 hover:text-[var(--accent-primary)] transition-colors"
            onClick={() => setHistoryOpen(!historyOpen)}
          >
            <div className="flex items-center gap-1">
              {historyOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Generation History ({history.length})
            </div>
          </button>

          {historyOpen && (
            <div className="space-y-2">
              {history.length === 0 ? (
                <div className="text-sm text-gray-400 dark:text-gray-600 italic px-2 font-medium">No past generations</div>
              ) : (
                history.map(h => (
                  <div
                    key={h.id}
                    onClick={() => loadHistoryItem(h.id)}
                    className="group flex flex-col p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-transparent hover:border-[var(--accent-primary)]/30 hover:bg-[var(--accent-primary)]/5 dark:hover:bg-[var(--accent-primary)]/10 cursor-pointer transition-all duration-200 hover:shadow-[0_4px_12px_rgba(124,58,237,0.1)] hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-bold leading-tight line-clamp-2 w-5/6 text-gray-800 dark:text-gray-200 group-hover:text-[var(--accent-primary)] dark:group-hover:text-white transition-colors">
                        {h.title || 'Untitled Post'}
                      </span>
                      <button onClick={(e) => handleDeleteHistory(e, h.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-500 hover:text-white rounded-md transition-colors flex-shrink-0" title="Delete Result">
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider">
                      <span className="bg-gray-200 dark:bg-black/30 px-2 py-0.5 rounded-full text-[var(--accent-secondary)]">{h.model_used}</span>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                        ★ {h.viral_score}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer actions */}
      <div className="p-4 border-t border-gray-200/50 dark:border-white/10 space-y-2 bg-white/40 dark:bg-black/20 backdrop-blur-md">
        {history.length > 0 && (
          <div className="mb-4">
            {showClearConfirm ? (
              <div className="flex flex-col gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/50">
                <span className="text-xs text-red-600 dark:text-red-400 font-bold text-center">Delete all history forever?</span>
                <div className="flex gap-2">
                  <button onClick={clearAllHistory} className="flex-1 bg-red-500 text-white text-xs font-bold py-1.5 rounded hover:bg-red-600 transition-colors">Yes</button>
                  <button onClick={() => setShowClearConfirm(false)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-xs font-bold py-1.5 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">No</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full text-left text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center gap-2 px-2 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <Trash2 size={14} /> Clear All History
              </button>
            )}
          </div>
        )}

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-3 w-full p-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-[var(--accent-primary)]/10 dark:hover:bg-[var(--accent-primary)]/20 hover:text-[var(--accent-primary)] dark:hover:text-white rounded-lg transition-colors"
        >
          <Settings size={18} />
          Settings
        </button>

        <div className="flex items-center justify-between w-full p-2.5 mt-2 bg-white/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 overflow-hidden">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="User" className="w-9 h-9 rounded-full border-2 border-white dark:border-gray-700 shadow-sm" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {user?.name?.substring(0, 2) || 'ME'}
              </div>
            )}
            <div className="text-sm font-bold truncate w-24 dark:text-gray-200">
              {user?.name || 'User'}
            </div>
          </div>
          <button onClick={onLogout} title="Log Out" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
