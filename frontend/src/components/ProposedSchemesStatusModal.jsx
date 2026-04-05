import { useState, useEffect } from 'react';
import { getProposedSchemes } from '../services/api';

export default function ProposedSchemesStatusModal({ onClose }) {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchemes = async () => {
            try {
                const res = await getProposedSchemes();
                // Force react to see it as a new array to prevent stale state issues
                setSchemes([...(res.data || [])]);
            } catch (err) {
                console.error("Failed to fetch proposed schemes", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSchemes();
        
        // Let's add an interval so it auto-refreshes if they keep the popup open!
        const interval = setInterval(fetchSchemes, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
            <div
                className="absolute inset-0 z-0 cursor-pointer"
                onClick={onClose}
                aria-label="Close popup background"
            ></div>

            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl relative z-10 flex flex-col scale-100 fade-in m-auto transform -translate-y-4 sm:-translate-y-0">

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 bg-white/95 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shadow-inner border border-indigo-100/50">
                            📝
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Track Submissions</h2>
                            <p className="text-sm text-slate-500 font-medium mt-0.5">Live status of your submitted schemes</p>
                        </div>
                    </div>
                    {/* Primary Close Button */}
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 bg-slate-50 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all duration-300"
                        title="Close popup"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 relative custom-scrollbar bg-slate-50/50">
                    {loading && schemes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                            <p className="mt-4 text-sm font-bold text-slate-500 animate-pulse uppercase tracking-wider">Syncing Data...</p>
                        </div>
                    ) : schemes.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <span className="text-5xl mb-4 block opacity-80">📄</span>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No Submissions Found</h3>
                            <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium leading-relaxed">
                                You haven't submitted any missing schemes yet.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 relative z-10">
                            {schemes.map((scheme, i) => (
                                <div key={scheme.id}
                                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all relative overflow-hidden group"
                                    style={{ animationDelay: `${(i % 5) * 100}ms` }}>

                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                                        <div className="flex-1 pr-4">
                                            <h3 className="font-bold text-slate-800 text-lg mb-2.5 leading-snug group-hover:text-indigo-600 transition-colors uppercase">{scheme.scheme_name}</h3>
                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                <span className="bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1 rounded-md text-xs font-semibold">{scheme.sector}</span>
                                                <span className="bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1 rounded-md text-xs font-semibold">{scheme.category}</span>
                                                <span className="bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1 rounded-md text-xs font-semibold">{scheme.state}</span>
                                            </div>
                                            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 uppercase tracking-wide">
                                                <span>⏱️ submitted:</span>
                                                <span className="text-slate-400">{new Date(scheme.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="shrink-0 flex items-start sm:justify-end">
                                            {scheme.status === 'pending' && (
                                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-200 bg-amber-50 shadow-sm">
                                                    <div className="relative flex h-2.5 w-2.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                                    </div>
                                                    <span className="text-amber-700 font-bold text-xs uppercase tracking-wide">Verifying</span>
                                                </div>
                                            )}
                                            {scheme.status === 'approved' && (
                                                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 shadow-sm">
                                                    <span className="text-emerald-500 text-sm">✅</span>
                                                    <span className="text-emerald-700 font-bold text-xs uppercase tracking-wide">Added</span>
                                                </div>
                                            )}
                                            {scheme.status === 'rejected' && (
                                                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-rose-200 bg-rose-50 shadow-sm">
                                                    <span className="text-rose-500 text-sm">❌</span>
                                                    <span className="text-rose-700 font-bold text-xs uppercase tracking-wide">Declined</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status specific message */}
                                    <div className="mt-4 text-sm border-t border-slate-100 pt-3.5 relative z-10 w-full text-slate-600">
                                        {scheme.status === 'pending' && <p className="font-semibold flex items-center gap-1.5"><span className="animate-spin text-sm">⏳</span> Currently verifying details online...</p>}
                                        {scheme.status === 'approved' && <p className="font-semibold flex items-center gap-1.5 text-emerald-600"><span>✨</span> Successfully verified and added to dataset.</p>}
                                        {scheme.status === 'rejected' && <p className="font-semibold flex items-center gap-1.5 text-rose-600"><span>⚠️</span> Could not verify scheme or quote limit reached.</p>}
                                    </div>
                                    
                                    {/* Subtle background glow based on status */}
                                    {scheme.status === 'approved' && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />}
                                    {scheme.status === 'rejected' && <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />}
                                    {scheme.status === 'pending' && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
