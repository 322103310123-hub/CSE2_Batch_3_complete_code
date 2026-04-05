import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { searchSchemes, proposeScheme } from '../services/api';
import Navbar from '../components/Navbar';
import SchemeCard from '../components/SchemeCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SearchSchemes() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const navigate = useNavigate();

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [proposeForm, setProposeForm] = useState({
        scheme_name: '',
        state: 'All India',
        sector: 'Government',
        category: 'Education'
    });
    const [proposeStatus, setProposeStatus] = useState({ type: '', message: '' });
    const [isProposing, setIsProposing] = useState(false);

    const fetchSearchResults = useCallback(async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError('');
        try {
            const res = await searchSchemes(query, user?.id || null);
            setResults(res.data.schemes || []);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to search for schemes.');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [query, user?.id]);

    useEffect(() => {
        fetchSearchResults();
    }, [fetchSearchResults]);

    const handleProposeSubmit = async (e) => {
        e.preventDefault();
        setIsProposing(true);
        setProposeStatus({ type: '', message: '' });
        
        try {
            const res = await proposeScheme(proposeForm);
            setProposeStatus({ type: 'success', message: res.data.message });
            setProposeForm({ scheme_name: '', state: 'All India', sector: 'Government', category: 'Education' });
        } catch (err) {
            setProposeStatus({ type: 'error', message: err.response?.data?.detail || 'Failed to submit scheme.' });
        } finally {
            setIsProposing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <Navbar />

            {/* Background embellishments */}
            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        Search Results
                    </h1>
                    <p className="text-indigo-300/80 text-base mt-1 font-medium">
                        Showing NLP semantic search results for "{query}"
                    </p>
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-40 fade-in-up">
                        <LoadingSpinner size="lg" />
                        <p className="mt-6 text-slate-400 text-sm font-medium animate-pulse">Running matcher against your query...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-8 text-center glass max-w-2xl mx-auto mt-10 fade-in-up">
                        <span className="text-5xl mb-4 block">❌</span>
                        <p className="text-rose-300 font-bold text-lg">{error}</p>
                    </div>
                )}

                {!loading && !error && results.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 fade-in-up">
                        {results.map((scheme, i) => (
                            <SchemeCard key={`${scheme.Title}-${i}`} scheme={scheme} index={i} />
                        ))}
                    </div>
                )}

                {!loading && !error && results.length === 0 && query && (
                    <div className="text-center py-24 glass rounded-3xl border border-white/5 max-w-2xl mx-auto fade-in-up">
                        <span className="text-6xl mb-6 block">🔍</span>
                        <h3 className="text-2xl font-bold text-white mb-2">No matching schemes found</h3>
                        <p className="text-slate-400 text-base mb-8 max-w-sm mx-auto">
                            We couldn't find any schemes that closely match your description. Try using different keywords.
                        </p>
                        <button onClick={() => navigate('/recommendations')}
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all">
                            Go back to Recommendations
                        </button>
                    </div>
                )}
                
                {/* Add a Scheme Section */}
                <div className="mt-20 max-w-3xl mx-auto glass rounded-3xl border border-white/5 p-8 relative overflow-hidden fade-in-up delay-200">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
                    <h2 className="text-2xl font-bold text-white mb-2 relative z-10 flex items-center gap-2">
                        Did we miss a scheme?
                    </h2>
                    <p className="text-slate-400 mb-8 relative z-10">
                        Help us improve! Submit a scheme below, and our agent will verify the details online and automatically add it to our database.
                    </p>

                    <form onSubmit={handleProposeSubmit} className="space-y-6 relative z-10">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Scheme Name</label>
                            <input 
                                type="text" 
                                required
                                value={proposeForm.scheme_name}
                                onChange={e => setProposeForm({...proposeForm, scheme_name: e.target.value})}
                                placeholder="Enter exact scheme name"
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">State</label>
                                <select 
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                                    value={proposeForm.state}
                                    onChange={e => setProposeForm({...proposeForm, state: e.target.value})}
                                >
                                    <option value="All India">All India</option>
                                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                                    <option value="Telangana">Telangana</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="Kerala">Kerala</option>
                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Sector</label>
                                <select 
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                                    value={proposeForm.sector}
                                    onChange={e => setProposeForm({...proposeForm, sector: e.target.value})}
                                >
                                    <option value="Government">Government Sector</option>
                                    <option value="Private">Private / Corporate</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                                <select 
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                                    value={proposeForm.category}
                                    onChange={e => setProposeForm({...proposeForm, category: e.target.value})}
                                >
                                    <option value="Education">Education</option>
                                    <option value="Health">Health</option>
                                </select>
                            </div>
                        </div>

                        {proposeStatus.message && (
                            <div className={`p-4 rounded-xl text-sm font-medium ${proposeStatus.type === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                {proposeStatus.message}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isProposing}
                            className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all w-full sm:w-auto
                                ${isProposing 
                                    ? 'bg-slate-700 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5'
                                }`}
                        >
                            {isProposing ? 'Submitting to Database...' : 'Submit Proposed Scheme'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
