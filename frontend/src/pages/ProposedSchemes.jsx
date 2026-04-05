import { useState, useEffect } from 'react';
import { getProposedSchemes } from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProposedSchemes() {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSchemes();
    }, []);

    const fetchSchemes = async () => {
        try {
            const res = await getProposedSchemes();
            setSchemes(res.data || []);
        } catch (err) {
            setError('Failed to load proposed schemes.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <Navbar />

            {/* Background embellishments */}
            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 relative z-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        Status of Proposed Schemes
                    </h1>
                    <p className="text-indigo-300/80 text-base mt-2 font-medium">
                        See the results of verifying your proposed schemes.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : error ? (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-400">
                        {error}
                    </div>
                ) : schemes.length === 0 ? (
                    <div className="text-center py-24 glass rounded-3xl border border-white/5 mx-auto">
                        <span className="text-6xl mb-6 block">📂</span>
                        <h3 className="text-2xl font-bold text-white mb-2">No proposed schemes yet.</h3>
                        <p className="text-slate-400 text-base mb-8">
                            Head over to the search page to propose a scheme!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {schemes.map((scheme) => (
                            <div key={scheme.id} className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-slate-900/50 transition-colors">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">{scheme.scheme_name}</h3>
                                    <div className="flex gap-4 text-sm text-slate-400">
                                        <span>📍 {scheme.state}</span>
                                        <span>🏢 {scheme.sector}</span>
                                        <span>🗂️ {scheme.category}</span>
                                    </div>
                                </div>
                                <div className="flex shrink-0 ml-4">
                                    {scheme.status === 'pending' && (
                                        <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                            ⏳ PENDING
                                        </span>
                                    )}
                                    {scheme.status === 'approved' && (
                                        <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                            ✅ ADDED
                                        </span>
                                    )}
                                    {scheme.status === 'rejected' && (
                                        <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                            ❌ REJECTED (FAKE/NOT FOUND)
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
