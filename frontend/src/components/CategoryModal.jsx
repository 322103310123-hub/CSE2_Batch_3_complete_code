import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
    { id: 'health', label: 'Health', icon: '🏥', color: 'from-rose-500 to-pink-600', bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400' },
    { id: 'job', label: 'Job / Business', icon: '💼', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
    { id: 'education', label: 'Education', icon: '🎓', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
    { id: 'legal', label: 'Legal', icon: '⚖️', color: 'from-slate-400 to-gray-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-300' },
    { id: 'banking', label: 'Banking', icon: '🏦', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
];

export default function CategoryModal({ onClose, onSelect }) {
    const navigate = useNavigate();
    const recent = JSON.parse(localStorage.getItem('recentCategories') || '[]');

    const handleSelect = (cat) => {
        const updated = [cat.id, ...recent.filter(r => r !== cat.id)].slice(0, 3);
        localStorage.setItem('recentCategories', JSON.stringify(updated));
        if (onSelect) onSelect(cat.id);
        onClose();
        navigate(`/recommendations?category=${cat.id}`);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay backdrop-blur-sm"
            style={{ background: 'rgba(15, 23, 42, 0.8)' }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-slate-900 border border-slate-700/60 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-lg overflow-hidden modal-content relative">
                {/* Background glow inside modal */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

                {/* Header */}
                <div className="px-8 pt-8 pb-6 border-b border-slate-800 relative z-10">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700 hover:border-slate-500"
                    >
                        ✕
                    </button>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight">Explore Schemes</h2>
                    <p className="text-slate-400 text-sm mt-1">Select a category to find relevant Government schemes</p>
                </div>

                <div className="p-8 relative z-10">
                    {/* Categories grid */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleSelect(cat)}
                                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border ${cat.bg} ${cat.border} hover:bg-slate-800 hover:scale-105 hover:shadow-lg transition-all group`}
                            >
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl shadow-lg group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-shadow`}>
                                    {cat.icon}
                                </div>
                                <span className={`text-sm font-bold ${cat.text}`}>{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Recently Viewed */}
                    {recent.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-slate-800">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                                🕐 Recently Viewed
                            </p>
                            <div className="flex flex-wrap gap-2.5">
                                {recent.map(id => {
                                    const cat = CATEGORIES.find(c => c.id === id);
                                    if (!cat) return null;
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => handleSelect(cat)}
                                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border ${cat.border} ${cat.bg} ${cat.text} text-sm font-semibold hover:bg-slate-800 transition-colors`}
                                        >
                                            <span className="text-base">{cat.icon}</span> {cat.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* All Schemes button */}
                    <button
                        onClick={() => {
                            if (onSelect) onSelect('');
                            onClose();
                            navigate('/recommendations');
                        }}
                        className="w-full mt-8 py-3.5 rounded-xl border border-slate-700 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-all flex items-center justify-center gap-2"
                    >
                        Browse All Schemes
                        <span className="text-slate-500">→</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
