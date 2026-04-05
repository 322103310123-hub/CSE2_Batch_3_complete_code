import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSchemeByTitle, likeScheme, unlikeScheme, getLikedSchemes, postComment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CategoryModal from '../components/CategoryModal';
import LoadingSpinner from '../components/LoadingSpinner';

const DetailRow = ({ icon, label, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
            <span className="text-base mt-0.5 flex-shrink-0">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm text-slate-700 font-medium break-words">{value}</p>
            </div>
        </div>
    );
};

export default function SchemeDetailPage() {
    const { title } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const decodedTitle = decodeURIComponent(title);

    const [scheme, setScheme] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [liked, setLiked] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);

    // Comment state
    const [commentText, setCommentText] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [commentError, setCommentError] = useState('');

    useEffect(() => {
        const fetchScheme = async () => {
            setLoading(true);
            try {
                const res = await getSchemeByTitle(decodedTitle, user?.id || null);
                const { education_schemes, health_schemes, comments: fetchedComments } = res.data;
                const all = [...(education_schemes?.schemes || []), ...(health_schemes?.schemes || [])];
                if (all.length > 0) {
                    const exact = all.find(s => s.Title?.toLowerCase() === decodedTitle.toLowerCase());
                    setScheme(exact || all[0]);
                } else {
                    setError('Scheme not found.');
                }
                setComments(fetchedComments || []);
            } catch (err) {
                setError(err.response?.data?.detail || 'Failed to load scheme details.');
            } finally {
                setLoading(false);
            }
        };
        fetchScheme();
    }, [decodedTitle, user?.id]);

    // Check if scheme is liked by current user
    useEffect(() => {
        const checkLiked = async () => {
            if (!user?.id) return;
            try {
                const res = await getLikedSchemes(user.id);
                const liked = res.data.some(ls => ls.scheme_title === decodedTitle);
                setLiked(liked);
            } catch {
                // silently ignore
            }
        };
        checkLiked();
    }, [decodedTitle, user?.id]);

    const handleLike = async () => {
        if (!user?.id || likeLoading) return;
        setLikeLoading(true);
        try {
            if (liked) {
                await unlikeScheme(user.id, decodedTitle);
                setLiked(false);
            } else {
                await likeScheme(user.id, decodedTitle);
                setLiked(true);
            }
        } catch {
            // silently ignore like errors
        } finally {
            setLikeLoading(false);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try { await navigator.share({ title: decodedTitle, url }); } catch { }
        } else {
            await navigator.clipboard.writeText(url);
            setShareCopied(true);
            setTimeout(() => setShareCopied(false), 2000);
        }
    };

    const handlePostComment = async () => {
        if (!commentText.trim() || !user?.id) return;
        setCommentLoading(true);
        setCommentError('');
        try {
            await postComment(commentText.trim(), decodedTitle, user.id);
            // Optimistically add to comments list
            setComments(prev => [
                ...prev,
                {
                    user_name: user.name,
                    comment: commentText.trim(),
                    created_at: new Date().toISOString(),
                }
            ]);
            setCommentText('');
        } catch (err) {
            setCommentError(err.response?.data?.detail || 'Failed to post comment. Try again.');
        } finally {
            setCommentLoading(false);
        }
    };

    const getWhyRecommended = (s) => {
        if (!s) return [];
        const reasons = [];
        if (s.State === 'All India') reasons.push('Available across all of India');
        if (s.Eligible_Caste === 'All Categories') reasons.push('Open to all caste categories');
        if (s.Eligible_Income === 'No Income Limit') reasons.push('No income restrictions');
        if (s.Gender_Eligibility === 'All genders') reasons.push('Open to all genders');
        if (s.Disability_Eligibility === 'All') reasons.push('Inclusive of all disability categories');
        if (reasons.length === 0) reasons.push('Matches your eligibility criteria based on your profile');
        return reasons;
    };

    const eligibilityDetails = scheme?.eligibility_details || null;
    const dynamicMatches = eligibilityDetails?.matched_reasons || getWhyRecommended(scheme);
    const dynamicUnmatches = eligibilityDetails?.unmatched_reasons || [];

    const categoryColorMap = {
        'Schemes & Welfare': 'bg-emerald-100 text-emerald-700',
        'Scholarships & Fellowships': 'bg-blue-100 text-blue-700',
        'Educational Resources': 'bg-purple-100 text-purple-700',
        'Internships & Training': 'bg-orange-100 text-orange-700',
        default: 'bg-indigo-100 text-indigo-700',
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch { return ''; }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar onCategoryClick={() => setShowCategoryModal(true)} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-5 transition-colors"
                >
                    ← Back to Recommendations
                </button>

                {loading && (
                    <div className="flex justify-center py-32">
                        <LoadingSpinner size="lg" />
                    </div>
                )}

                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                        <span className="text-4xl mb-3 block">⚠️</span>
                        <p className="text-red-700 font-medium">{error}</p>
                        <button onClick={() => navigate('/recommendations')}
                            className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium">
                            Back to Recommendations
                        </button>
                    </div>
                )}

                {!loading && scheme && (
                    <div className="lg:grid lg:grid-cols-3 lg:gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-5">
                            {/* Header Card */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${categoryColorMap[scheme.Oppurtunity_category] || categoryColorMap.default}`}>
                                                    {scheme.Oppurtunity_category}
                                                </span>
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                                                    {scheme.Sector}
                                                </span>
                                            </div>
                                            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
                                                {scheme.Title}
                                            </h1>
                                            <p className="text-slate-500 text-sm mt-1">{scheme.Organisation}</p>
                                        </div>
                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={handleLike}
                                                disabled={likeLoading}
                                                title={liked ? 'Unlike this scheme' : 'Like this scheme'}
                                                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all disabled:opacity-60
                                                    ${liked
                                                        ? 'bg-rose-50 border-rose-300 text-rose-500'
                                                        : 'bg-white border-slate-200 text-slate-400 hover:border-rose-300 hover:text-rose-500'}`}
                                            >
                                                {likeLoading ? (
                                                    <div className="w-3 h-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    liked ? '❤️' : '🤍'
                                                )}
                                            </button>
                                            <button
                                                onClick={handleShare}
                                                title="Share"
                                                className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-400 hover:border-indigo-300 hover:text-indigo-500 flex items-center justify-center transition-all"
                                            >
                                                {shareCopied ? '✓' : '↗'}
                                            </button>
                                        </div>
                                    </div>

                                    {shareCopied && (
                                        <p className="text-xs text-indigo-600 mt-2 text-right">Link copied to clipboard!</p>
                                    )}
                                </div>
                            </div>

                            {/* Description / Overview */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span>📋</span> About this Scheme
                                </h2>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    This scheme — <strong>{scheme.Title}</strong> — is offered by{' '}
                                    <em>{scheme.Organisation}</em> under the <em>{scheme.Sector}</em> sector.
                                    It falls under the category of <em>{scheme.Oppurtunity_category}</em> and
                                    is available {scheme.State === 'All India' ? 'across all of India' : `in ${scheme.State}`}.
                                </p>
                                <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                    <p className="text-sm text-indigo-700 font-medium">📌 Key Highlight</p>
                                    <p className="text-xs text-indigo-600 mt-1">
                                        Eligible for {scheme.Eligible_Agegroup} age group •{' '}
                                        {scheme.Gender_Eligibility} •{' '}
                                        Income: {scheme.Eligible_Income}
                                    </p>
                                </div>
                            </div>

                            {/* Why Recommended / Why Not Recommended */}
                            {(dynamicMatches.length > 0 || dynamicUnmatches.length > 0) && (
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                    {/* Matched Criteria */}
                                    {dynamicMatches.length > 0 && (
                                        <div className="mb-6 last:mb-0">
                                            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                <span>🎯</span> Why This Is Recommended For You
                                            </h2>
                                            <ul className="space-y-2.5">
                                                {dynamicMatches.map((res, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50">
                                                        <span className="text-emerald-500 mt-0.5 flex-shrink-0 bg-emerald-100 w-5 h-5 flex items-center justify-center rounded-full text-xs">✓</span>
                                                        <span className="pt-0.5">{res}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Unmatched / Partial Criteria */}
                                    {dynamicUnmatches.length > 0 && (
                                        <div>
                                            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2 pt-5 border-t border-slate-100">
                                                <span>⚠️</span> Why This Scheme Might Not Be A Perfect Fit
                                            </h2>
                                            <p className="text-xs text-slate-500 mb-3 px-1">Based on your saved profile, you seem to be missing some criteria for this scheme:</p>
                                            <ul className="space-y-2.5">
                                                {dynamicUnmatches.map((res, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/50">
                                                        <span className="text-amber-500 mt-0.5 flex-shrink-0 bg-amber-100 w-5 h-5 flex items-center justify-center rounded-full text-xs">✕</span>
                                                        <span className="pt-0.5">{res}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Comments Section (Dynamic) */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span>💬</span> Community Comments
                                    <span className="ml-auto text-xs text-slate-400 font-normal">{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
                                </h2>

                                {/* Add Comment */}
                                <div className="mb-5">
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-indigo-600">
                                            {user?.name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1">
                                            <textarea
                                                value={commentText}
                                                onChange={e => setCommentText(e.target.value)}
                                                placeholder="Share your experience or tips for applying..."
                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none bg-slate-50"
                                                rows={2}
                                                maxLength={255}
                                            />
                                            <div className="flex items-center justify-between mt-1.5">
                                                <span className="text-xs text-slate-400">{commentText.length}/255</span>
                                                <button
                                                    onClick={handlePostComment}
                                                    disabled={!commentText.trim() || commentLoading}
                                                    className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {commentLoading ? 'Posting...' : 'Post Comment'}
                                                </button>
                                            </div>
                                            {commentError && (
                                                <p className="text-red-500 text-xs mt-1">{commentError}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Comments List */}
                                {comments.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400">
                                        <span className="text-3xl mb-2 block">💬</span>
                                        <p className="text-sm">No comments yet. Be the first to share your experience!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {comments.map((c, i) => (
                                            <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                                                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-indigo-600">
                                                    {(c.user_name || 'U')[0].toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <p className="text-xs font-semibold text-slate-700">{c.user_name || 'Anonymous'}</p>
                                                        {c.created_at && (
                                                            <p className="text-[10px] text-slate-400">{formatDate(c.created_at)}</p>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-600 break-words">{c.comment}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="mt-5 lg:mt-0 space-y-5">
                            {/* Apply CTA */}
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white">
                                <p className="text-sm font-semibold mb-1">Ready to Apply?</p>
                                <p className="text-xs text-indigo-200 mb-4">
                                    Visit the official website to start your application
                                </p>
                                <a
                                    href={scheme.Apply_Link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full py-3 bg-white text-indigo-700 font-bold text-sm rounded-xl text-center hover:bg-indigo-50 transition-colors shadow-sm"
                                >
                                    Apply Now →
                                </a>
                                <p className="text-[10px] text-indigo-300 mt-2 text-center break-all">
                                    {scheme.Apply_Link}
                                </p>
                            </div>

                            {/* Eligibility Details */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                <h3 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-1.5">
                                    <span>📊</span> Eligibility Details
                                </h3>
                                <DetailRow icon="📍" label="State" value={scheme.State} />
                                <DetailRow icon="⚧" label="Gender" value={scheme.Gender_Eligibility} />
                                <DetailRow icon="💰" label="Income" value={scheme.Eligible_Income} />
                                <DetailRow icon="👥" label="Caste" value={scheme.Eligible_Caste} />
                                <DetailRow icon="🎓" label="Education" value={scheme.Education} />
                                <DetailRow icon="🧑" label="Age Group" value={scheme.Eligible_Agegroup} />
                                <DetailRow icon="♿" label="Disability" value={scheme.Disability_Eligibility} />
                                <DetailRow icon="🌏" label="Country" value={scheme.Country} />
                            </div>

                            {/* Customer Care */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                <h3 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-1.5">
                                    <span>📞</span> Customer Care Support
                                </h3>
                                <div className="space-y-2.5 text-xs text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <span>📞</span>
                                        <span>Toll-free: <strong>1800-11-0001</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>📧</span>
                                        <span>helpdesk@gov.in</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>🕐</span>
                                        <span>Mon–Sat, 9am – 6pm IST</span>
                                    </div>
                                    <a
                                        href={scheme.Apply_Link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 flex items-center gap-1.5 text-indigo-600 font-medium hover:underline"
                                    >
                                        🌐 Visit Official Website
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showCategoryModal && <CategoryModal onClose={() => setShowCategoryModal(false)} />}
        </div>
    );
}
