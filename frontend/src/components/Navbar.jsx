import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { getAllSchemesData } from '../services/api';
import ProposedSchemesStatusModal from './ProposedSchemesStatusModal';

export default function Navbar({ onCategoryClick }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const isRecommendations = location.pathname === '/recommendations';
    const [searchQuery, setSearchQuery] = useState('');
    const [allSchemes, setAllSchemes] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const fetchSchemes = async () => {
            try {
                const res = await getAllSchemesData();
                const { education, health } = res.data;
                setAllSchemes([...(education || []), ...(health || [])]);
            } catch (err) {
                console.error("Failed to fetch schemes for search", err);
            }
        };
        fetchSchemes();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.trim().length > 1) {
            const lowerQuery = query.toLowerCase();
            const matches = allSchemes.filter(s => 
                (s.Title && s.Title.toLowerCase().includes(lowerQuery)) ||
                (s.Oppurtunity_category && s.Oppurtunity_category.toLowerCase().includes(lowerQuery)) ||
                (s.Organisation && s.Organisation.toLowerCase().includes(lowerQuery))
            ).slice(0, 6); // Keep it small
            setSuggestions(matches);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setShowSuggestions(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    return (
        <nav className="sticky top-0 z-40 glass border-b border-indigo-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/recommendations" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                            <span className="text-white text-sm font-bold">🏛️</span>
                        </div>
                        <div>
                            <span className={`font-extrabold text-xl sm:text-2xl hidden sm:block tracking-tight uppercase ${isRecommendations ? 'text-white' : 'text-indigo-600'}`}>
                                SAHAAY
                            </span>
                        </div>
                    </Link>

                    {/* Right side */}
                    <div className="flex items-center gap-3 flex-1 justify-end">
                        <div ref={searchRef} className="relative hidden md:flex mr-4 max-w-sm w-full">
                            <form onSubmit={handleSearch} className="w-full relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                    placeholder="Search schemes..."
                                    className="w-full pl-10 pr-4 py-1.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500 rounded-full text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">🔍</span>
                            </form>

                            {/* Dropdown Suggestions */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-50">
                                    <div className="max-h-80 overflow-y-auto py-2">
                                        {suggestions.map((s, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    navigate(`/scheme/${encodeURIComponent(s.Title)}`);
                                                    setShowSuggestions(false);
                                                    setSearchQuery('');
                                                }}
                                                className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                                            >
                                                <p className="text-sm font-semibold text-slate-800 line-clamp-1">{s.Title}</p>
                                                <p className="text-xs text-slate-500 truncate">{s.Organisation} • {s.Oppurtunity_category || 'General'}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div 
                                        onClick={handleSearch}
                                        className="bg-slate-50 border-t border-slate-100 p-2 text-center text-xs text-indigo-600 font-semibold cursor-pointer hover:bg-slate-100 transition-colors"
                                    >
                                        View all results for "{searchQuery}" →
                                    </div>
                                </div>
                            )}
                        </div>

                        {onCategoryClick && (
                            <button
                                onClick={onCategoryClick}
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                            >
                                <span>🗂️</span> Categories
                            </button>
                        )}

                        {/* User menu */}
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                            >
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">{initials}</span>
                                </div>
                                <span className="text-sm font-medium text-white hidden sm:block max-w-24 truncate">
                                    {user?.name?.split(' ')[0]}
                                </span>
                                <svg className={`w-4 h-4 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                    </div>
                                    <Link
                                        to={`/profile${location.search}`}
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                    >
                                        <span>✏️</span> Edit Profile
                                    </Link>
                                    {onCategoryClick && (
                                        <button
                                            onClick={() => { onCategoryClick(); setMenuOpen(false); }}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                        >
                                            <span>🗂️</span> Categories
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { setShowStatusModal(true); setMenuOpen(false); }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors"
                                    >
                                        <span>🤖</span> Track Submissions
                                    </button>
                                    <div className="border-t border-slate-100">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <span>🚪</span> Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {showStatusModal && <ProposedSchemesStatusModal onClose={() => setShowStatusModal(false)} />}
        </nav>
    );
}
