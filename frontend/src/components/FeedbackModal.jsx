import { useState } from 'react';

const SECTORS = [
    'Agriculture', 'Banking & Finance', 'Defence', 'Education',
    'Employment', 'Energy', 'Health', 'Housing', 'Infrastructure',
    'Legal Aid', 'Social Welfare', 'Technology', 'Women & Child',
];

export default function FeedbackModal({ onClose }) {
    const [sector, setSector] = useState('');
    const [suggestion, setSuggestion] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!sector) return;
        // Store feedback locally
        const fb = { sector, suggestion, timestamp: Date.now() };
        const existing = JSON.parse(localStorage.getItem('feedbackList') || '[]');
        localStorage.setItem('feedbackList', JSON.stringify([...existing, fb]));
        localStorage.setItem('feedbackGiven', Date.now().toString());
        setSubmitted(true);
        setTimeout(onClose, 2000);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 modal-overlay backdrop-blur-sm"
            style={{ background: 'rgba(15, 23, 42, 0.8)' }}
        >
            <div className="bg-slate-900 border border-slate-700/60 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-md modal-content overflow-hidden relative">
                {/* Subtle glow */}
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />

                {submitted ? (
                    <div className="p-10 text-center relative z-10 fade-in-up">
                        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
                            <span className="text-4xl">✅</span>
                        </div>
                        <h3 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Thank You!</h3>
                        <p className="text-emerald-400 font-medium text-sm">Your feedback helps us improve SAHAAY.</p>
                    </div>
                ) : (
                    <div className="relative z-10">
                        {/* Header */}
                        <div className="px-8 pt-8 pb-6 border-b border-slate-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-extrabold text-white tracking-tight">Quick Feedback</h3>
                                    <p className="text-slate-400 text-sm mt-1 font-medium">Help us serve you better</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700 hover:border-slate-500"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
                            {/* Q1 */}
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">
                                    1. Which sector schemes do you prefer? <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={sector}
                                        onChange={(e) => setSector(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white appearance-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                                    >
                                        <option value="" className="text-slate-500">Select a sector...</option>
                                        {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</div>
                                </div>
                            </div>

                            {/* Q2 */}
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">
                                    2. Any suggestions to improve?
                                </label>
                                <textarea
                                    value={suggestion}
                                    onChange={(e) => setSuggestion(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white resize-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-500"
                                />
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 text-sm font-bold text-slate-400 border border-slate-700 rounded-xl hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all"
                                >
                                    Skip
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-indigo-500/25 border border-indigo-500/50"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
