import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRecommendations, getLikedSchemes } from '../services/api';
import Navbar from '../components/Navbar';
import SchemeCard from '../components/SchemeCard';
import CategoryModal from '../components/CategoryModal';
import FeedbackModal from '../components/FeedbackModal';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORY_FILTER_MAP = {
    health: (s, type) => type === 'health',
    education: (s, type) => type === 'education',
    job: (s) => s.Oppurtunity_category?.toLowerCase().includes('job') || s.Oppurtunity_category?.toLowerCase().includes('employment') || s.Oppurtunity_category?.toLowerCase().includes('internship'),
    legal: (s) => s.Title?.toLowerCase().includes('legal') || s.Organisation?.toLowerCase().includes('legal'),
    banking: (s) => s.Title?.toLowerCase().includes('bank') || s.Sector?.toLowerCase().includes('bank'),
    default: () => true,
};

const TAB_ALL = 'all';
const TAB_LIKED = 'liked';

export default function RecommendationPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const categoryFilter = searchParams.get('category');

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const tabParam = searchParams.get('tab') || 'exact';
    const [activeTab, setActiveTabState] = useState(tabParam);

    const setActiveTab = (tab) => {
        setActiveTabState(tab);
        setSearchParams(prev => {
            if (tab === 'exact') prev.delete('tab');
            else prev.set('tab', tab);
            return prev;
        }, { replace: true });
    };
    const [likedSchemes, setLikedSchemes] = useState([]);
    const [likedLoading, setLikedLoading] = useState(false);

    const exactRef = useRef(null);
    const partialRef = useRef(null);
    const likedRef = useRef(null);

    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const fetchRecommendations = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        setError('');
        try {
            const res = await getRecommendations(user.id);
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load recommendations. Make sure your profile is complete.');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const fetchLikedSchemes = useCallback(async () => {
        if (!user?.id) return;
        setLikedLoading(true);
        try {
            const res = await getLikedSchemes(user.id);
            setLikedSchemes(res.data || []);
        } catch {
            setLikedSchemes([]);
        } finally {
            setLikedLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchRecommendations();
        fetchLikedSchemes();
    }, [fetchRecommendations, fetchLikedSchemes]);

    // Feedback after 30 seconds of browsing
    useEffect(() => {
        const lastFeedback = localStorage.getItem('feedbackGiven');
        const shouldShow = !lastFeedback || Date.now() - parseInt(lastFeedback) > 7 * 24 * 60 * 60 * 1000;
        if (!shouldShow) return;
        const timer = setTimeout(() => setShowFeedback(true), 30000);
        return () => clearTimeout(timer);
    }, []);

    const applyFilter = (schemes, type) => {
        if (!categoryFilter) return schemes;
        const fn = CATEGORY_FILTER_MAP[categoryFilter] || CATEGORY_FILTER_MAP.default;
        return schemes.filter((s) => fn(s, type));
    };

    const educationSchemes = data ? applyFilter(data.education_recommendations?.opportunities || [], 'education') : [];
    const healthSchemes = data ? applyFilter(data.health_recommendations?.opportunities || [], 'health') : [];
    const allSchemes = [...educationSchemes, ...healthSchemes];

    const exactMatches = allSchemes.filter(s => s.eligibility_percentage === 100).sort((a, b) => b.eligibility_percentage - a.eligibility_percentage);
    const partialMatches = allSchemes.filter(s => s.eligibility_percentage < 100).sort((a, b) => b.eligibility_percentage - a.eligibility_percentage);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <Navbar />

            {/* Background embellishments */}
            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
                {/* Page Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 fade-in-up">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            {categoryFilter
                                ? `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Schemes`
                                : 'Your Recommendations'}
                        </h1>
                        <p className="text-indigo-300/80 text-base mt-1 font-medium">
                            {data
                                ? `${exactMatches.length + partialMatches.length} schemes matched your profile`
                                : 'Loading personalized results...'}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCategoryModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 border border-slate-700 hover:border-indigo-500/50 text-white rounded-full text-sm font-semibold hover:bg-slate-700 transition-all shadow-lg self-start"
                    >
                        <span className="text-indigo-400">🗂️</span> Change Category
                    </button>
                </div>

                {/* Modern Navigation Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 bg-slate-900/50 backdrop-blur-md p-1.5 rounded-2xl w-fit border border-white/5 shadow-xl fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <button
                        onClick={() => setActiveTab('exact')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'exact' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
                    >
                        🎯 Exact Matches
                        <span className={`${activeTab === 'exact' ? 'bg-indigo-800/50 text-indigo-100' : 'bg-slate-700 text-slate-300'} text-xs px-2 py-0.5 rounded-full`}>{exactMatches.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('remaining')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'remaining' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
                    >
                        ✨ Remaining Matches
                        <span className={`${activeTab === 'remaining' ? 'bg-indigo-800/50 text-indigo-100' : 'bg-slate-700 text-slate-300'} text-xs px-2 py-0.5 rounded-full`}>{partialMatches.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('liked')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'liked' ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
                    >
                        ❤️ Liked Schemes
                        <span className={`${activeTab === 'liked' ? 'bg-rose-800/50 text-rose-100' : 'bg-slate-700 text-slate-300'} text-xs px-2 py-0.5 rounded-full`}>{likedSchemes.length}</span>
                    </button>
                </div>

                {/* ─── ALL SCHEMES DATA ─── */}
                <>
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-40 fade-in-up">
                            <LoadingSpinner size="lg" />
                            <p className="mt-6 text-slate-400 text-sm font-medium animate-pulse">Running matcher against your profile...</p>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-8 text-center glass max-w-2xl mx-auto mt-10 fade-in-up">
                            <span className="text-5xl mb-4 block">🔍</span>
                            <p className="text-rose-300 font-bold text-lg">{error}</p>
                            <button
                                onClick={() => { window.location.href = '/profile'; }}
                                className="mt-6 px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-sm font-bold transition-all shadow-lg"
                            >
                                Complete Profile
                            </button>
                        </div>
                    )}

                    {!loading && !error && data && (
                        <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
                            {/* Advanced Stats bar */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                                {[
                                    { label: '100% Matches', value: exactMatches.length, icon: '🎯', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
                                    { label: 'Education (100%)', value: educationSchemes.filter(s => s.eligibility_percentage === 100).length, icon: '🎓', border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400' },
                                    { label: 'Health (100%)', value: healthSchemes.filter(s => s.eligibility_percentage === 100).length, icon: '🏥', border: 'border-rose-500/30', bg: 'bg-rose-500/10', text: 'text-rose-400' },
                                    { label: 'Liked', value: likedSchemes.length, icon: '❤️', border: 'border-pink-500/30', bg: 'bg-pink-500/10', text: 'text-pink-400' },
                                ].map(({ label, value, icon, border, bg, text }) => (
                                    <div key={label} className={`glass rounded-2xl p-4 border ${border} flex items-center gap-4`}>
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${bg}`}>
                                            {icon}
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
                                            <p className={`font-extrabold text-2xl ${text}`}>{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Section 1: Exact Matches */}
                            {activeTab === 'exact' && (
                                <section ref={exactRef} className="mb-14 scroll-mt-24 fade-in-up">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-2xl animate-bounce" style={{ animationDuration: '2s' }}>🎯</span>
                                        <h2 className="text-2xl font-extrabold text-white tracking-tight">100% Exact Matches</h2>
                                        <div className="ml-auto h-[1px] flex-1 max-w-[100px] sm:max-w-md bg-gradient-to-r from-emerald-500/50 to-transparent mx-4 hidden sm:block"></div>
                                    </div>
                                    {exactMatches.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {exactMatches.map((scheme, i) => (
                                                <SchemeCard key={`${scheme.Title}-${i}-e`} scheme={scheme} index={i} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 glass rounded-2xl border border-white/5 text-center">
                                            <p className="text-slate-400 text-sm">No 100% exact matches found. Check your profile details or partial matches below.</p>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Section 2: Partial Matches */}
                            {activeTab === 'remaining' && (
                                <section ref={partialRef} className="mb-14 scroll-mt-24 fade-in-up">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-2xl">✨</span>
                                        <h2 className="text-2xl font-extrabold text-white tracking-tight">Remaining Matches</h2>
                                        <div className="ml-auto h-[1px] flex-1 max-w-[100px] sm:max-w-md bg-gradient-to-r from-indigo-500/50 to-transparent mx-4 hidden sm:block"></div>
                                    </div>
                                    {partialMatches.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {partialMatches.map((scheme, i) => (
                                                <SchemeCard key={`${scheme.Title}-${i}-p`} scheme={scheme} index={i} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 glass rounded-2xl border border-white/5 text-center">
                                            <p className="text-slate-400 text-sm">No remaining matches found in this category.</p>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Section 3: Liked Schemes */}
                            {activeTab === 'liked' && (
                                <section ref={likedRef} className="mb-10 scroll-mt-24 fade-in-up">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-2xl">❤️</span>
                                        <h2 className="text-2xl font-extrabold text-white tracking-tight">Saved / Liked Schemes</h2>
                                        <div className="ml-auto h-[1px] flex-1 max-w-[100px] sm:max-w-md bg-gradient-to-r from-rose-500/50 to-transparent mx-4 hidden sm:block"></div>
                                    </div>
                                    {likedSchemes.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {likedSchemes.map((ls, i) => (
                                                <div
                                                    key={`${ls.scheme_title}-${i}`}
                                                    onClick={() => navigate(`/scheme/${encodeURIComponent(ls.scheme_title)}`)}
                                                    className="glass rounded-2xl border border-slate-700 shadow-lg p-6 cursor-pointer hover:border-rose-400/50 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)] transition-all group card-hover relative overflow-hidden"
                                                    style={{ animationDelay: `${i * 0.05}s` }}
                                                >
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-colors" />
                                                    <div className="flex items-start gap-4 relative z-10">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center flex-shrink-0 text-xl group-hover:bg-rose-500/20 transition-colors shadow-inner">
                                                            ❤️
                                                        </div>
                                                        <div className="flex-1 min-w-0 pt-0.5">
                                                            <p className="text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-rose-400 transition-colors">
                                                                {ls.scheme_title}
                                                            </p>
                                                            <p className="text-xs text-slate-400 mt-2 font-medium flex items-center gap-1">View Details <span className="group-hover:translate-x-1 transition-transform">→</span></p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-12 glass rounded-2xl border border-white/5 text-center">
                                            <span className="text-4xl mb-4 block animate-pulse">🤍</span>
                                            <p className="text-white font-bold text-lg mb-2">No Liked Schemes Yet</p>
                                            <p className="text-slate-400 text-sm">Open any scheme and click the heart button to save it here for quick access later.</p>
                                        </div>
                                    )}
                                </section>
                            )}

                            {allSchemes.length === 0 && (
                                <div className="text-center py-24 glass rounded-3xl border border-white/5 max-w-2xl mx-auto">
                                    <span className="text-6xl mb-6 block">🔍</span>
                                    <h3 className="text-2xl font-bold text-white mb-2">No matching schemes found</h3>
                                    <p className="text-slate-400 text-base mb-8 max-w-sm mx-auto">
                                        Try a different category or update your profile details for better matching.
                                    </p>
                                    <button onClick={() => setShowCategoryModal(true)}
                                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all">
                                        Try Another Category
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </>
            </div>

            {showCategoryModal && <CategoryModal onClose={() => setShowCategoryModal(false)} />}
            {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
        </div>
    );
}
