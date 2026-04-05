import { useNavigate } from 'react-router-dom';

const categoryColors = {
    'Schemes & Welfare': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    'Scholarships & Fellowships': { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
    'Educational Resources': { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', dot: 'bg-purple-400' },
    'Internships & Training': { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', dot: 'bg-orange-400' },
    'Health': { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-400' },
    default: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', dot: 'bg-indigo-400' },
};

const sectorIcons = {
    'Government': '🏛️',
    'NGO': '🌿',
    'Private': '🏢',
    default: '📋',
};

export default function SchemeCard({ scheme, index = 0 }) {
    const navigate = useNavigate();
    const colors = categoryColors[scheme.Oppurtunity_category] || categoryColors.default;
    const icon = sectorIcons[scheme.Sector] || sectorIcons.default;

    const delay = Math.min(index * 0.05, 0.4);

    const handleViewDetails = () => {
        navigate(`/scheme/${encodeURIComponent(scheme.Title)}`);
    };

    return (
        <div
            onClick={handleViewDetails}
            className="group relative glass rounded-2xl border border-slate-700 hover:border-indigo-500/50 shadow-lg hover:shadow-[0_8px_30px_rgba(99,102,241,0.2)] card-hover overflow-hidden fade-in-up cursor-pointer"
            style={{ animationDelay: `${delay}s` }}
        >
            {/* Background glow effect on hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-md transition duration-500 pointer-events-none"></div>

            {/* Top accent bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />

            <div className="p-6 relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-12 h-12 bg-slate-800/80 rounded-xl flex items-center justify-center text-2xl border border-slate-600 shadow-inner group-hover:scale-105 group-hover:bg-slate-700 transition-all">
                            {icon}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                            <h3 className="font-bold text-white text-base leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors">
                                {scheme.Title}
                            </h3>
                            <p className="text-sm text-slate-400 mt-1 truncate font-medium">{scheme.Organisation}</p>
                        </div>
                    </div>
                    {scheme.eligibility_percentage !== undefined && (
                        <div className="flex-shrink-0 flex flex-col items-center justify-center">
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                <svg className="w-12 h-12 -rotate-90">
                                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-700" />
                                    <circle
                                        cx="24" cy="24" r="20"
                                        stroke="currentColor" strokeWidth="4" fill="transparent"
                                        strokeDasharray="125.6"
                                        strokeDashoffset={125.6 - (125.6 * scheme.eligibility_percentage) / 100}
                                        className={`${scheme.eligibility_percentage === 100 ? 'text-emerald-500' : scheme.eligibility_percentage >= 50 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000 ease-in-out`}
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                                    {scheme.eligibility_percentage}%
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 font-medium">Match</span>
                        </div>
                    )}
                </div>

                {/* Category + State row */}
                <div className="flex flex-wrap gap-2 mb-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${colors.bg} ${colors.border} ${colors.text} shadow-sm`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} animate-pulse`} />
                        {scheme.Oppurtunity_category}
                    </span>
                    {scheme.State && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300 shadow-sm">
                            📍 {scheme.State.length > 20 ? 'All India' : scheme.State}
                        </span>
                    )}
                </div>

                {/* Eligibility info grid */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-6">
                    {scheme.Eligible_Caste && (
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <span className="text-slate-500">👥</span>
                            <span className="truncate">{scheme.Eligible_Caste}</span>
                        </div>
                    )}
                    {scheme.Education && (
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <span className="text-slate-500">🎓</span>
                            <span className="truncate">{scheme.Education}</span>
                        </div>
                    )}
                    {scheme.Gender_Eligibility && (
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <span className="text-slate-500">⚧</span>
                            <span className="truncate">{scheme.Gender_Eligibility}</span>
                        </div>
                    )}
                    {scheme.Eligible_Income && (
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <span className="text-slate-500">💰</span>
                            <span className="truncate">{scheme.Eligible_Income}</span>
                        </div>
                    )}
                </div>

                {/* Action button */}
                <button
                    onClick={(e) => { e.stopPropagation(); handleViewDetails(); }}
                    className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 text-slate-200 hover:text-white text-sm font-bold rounded-xl border border-slate-600 hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-lg group-hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                    View Details
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
            </div>
        </div>
    );
}
