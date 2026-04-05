import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const FeatureCard = ({ icon, title, desc, delay }) => (
    <div
        className="glass rounded-2xl p-6 card-hover fade-in-up group relative overflow-hidden"
        style={{ animationDelay: `${delay}s` }}
    >
        {/* Animated background glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500"></div>
        <div className="relative z-10">
            <div className="w-14 h-14 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                {icon}
            </div>
            <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
    </div>
);

const StepCard = ({ step, icon, title, desc, delay }) => (
    <div className="flex gap-5 items-start fade-in-up" style={{ animationDelay: `${delay}s` }}>
        <div className="relative">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_20px_rgba(124,58,237,0.3)] z-10 relative">
                {step}
            </div>
            {/* Connecting line line */}
        </div>
        <div className="pt-1">
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{icon}</span>
                <h3 className="font-bold text-white text-xl">{title}</h3>
            </div>
            <p className="text-slate-400 text-base">{desc}</p>
        </div>
    </div>
);

export default function LandingPage() {
    const navigate = useNavigate();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleGetStarted = () => {
        setIsLoggingIn(true);
        window.location.href = `${BASE_URL}/auth/google`;
    };

    const stats = [
        { value: '500+', label: 'Government Schemes' },
        { value: '2', label: 'Key Sectors' },
        { value: 'Smart', label: 'Powered Matching' },
        { value: '100%', label: 'Free to Use' },
    ];

    const features = [
        { icon: '🎯', title: 'Personalized Recommendations', desc: 'Our matching engine precisely connects government schemes to your profile — age, income, caste, education and more.', delay: 0.1 },
        { icon: '📋', title: 'Eligibility Matching', desc: 'No more guesswork. We check every scheme against your profile and only show you the ones you actually qualify for.', delay: 0.2 },
        { icon: '🏛️', title: 'Education & Health Sectors', desc: 'Covers scholarships, fellowships, health schemes, and welfare programs across all Indian states and central government.', delay: 0.3 },
        { icon: '❤️', title: 'Save & Track Schemes', desc: 'Like and save schemes you\'re interested in. Come back anytime to pick up where you left off.', delay: 0.4 },
        { icon: '💬', title: 'Community Comments', desc: 'Read tips and experiences from other applicants. Share your own insights to help fellow citizens.', delay: 0.5 },
        { icon: '⚡', title: 'Instant Results', desc: 'Fill in your profile once and get instant, tailored recommendations — no manual searching required.', delay: 0.6 },
    ];

    const steps = [
        { step: '1', icon: '🔑', title: 'Login with Google', desc: 'Secure, one-click sign-in. No password needed.', delay: 0.1 },
        { step: '2', icon: '👤', title: 'Complete Your Profile', desc: 'Tell us about your demographics, location and eligibility details.', delay: 0.3 },
        { step: '3', icon: '🎯', title: 'Discover Your Schemes', desc: 'Get your personalized list of government schemes you qualify for.', delay: 0.5 },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
            {/* ─── Navbar ─── */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-3 backdrop-blur-xl bg-slate-900/70 border-b border-white/10 shadow-lg' : 'py-5 bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-white text-lg">🏛️</span>
                        </div>
                        <div>
                            <span className="font-extrabold text-xl tracking-tight text-white">
                                SAHAAY
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleGetStarted}
                        disabled={isLoggingIn}
                        className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold rounded-full backdrop-blur-md transition-all disabled:opacity-70 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    >
                        {isLoggingIn ? 'Redirecting...' : 'Sign In'}
                    </button>
                </div>
            </nav>

            {/* ─── Hero Section ─── */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
                {/* Advanced Background Orbs */}
                <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-float" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] mix-blend-screen pointer-events-none animate-float" style={{ animationDelay: '-3s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-pink-600/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative max-w-5xl mx-auto px-6 text-center z-10 w-full">
                    {/* Badge */}
                    <div className="fade-in-up inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-indigo-300 mb-8 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <span className="font-medium tracking-wide">Smart Scheme Discovery</span>
                    </div>

                    <h1 className="fade-in-up text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight" style={{ animationDelay: '0.1s' }}>
                        Find Government Schemes
                        <br />
                        <span className="gradient-text">
                            Made for You
                        </span>
                    </h1>

                    <p className="fade-in-up text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light" style={{ animationDelay: '0.2s' }}>
                        Stop searching manually. We precisely match <strong className="text-white font-semibold">500+ government schemes</strong> to your
                        profile in seconds — scholarships, health benefits, welfare programs and more.
                    </p>

                    <div className="fade-in-up flex flex-col sm:flex-row gap-5 justify-center mt-4" style={{ animationDelay: '0.3s' }}>
                        <button
                            onClick={handleGetStarted}
                            disabled={isLoggingIn}
                            className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all duration-300 disabled:opacity-70 scale-100 hover:scale-105"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                            {isLoggingIn ? (
                                <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin relative z-10" />
                            ) : (
                                <div className="bg-white rounded-full p-1 relative z-10">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                </div>
                            )}
                            <span className="relative z-10">{isLoggingIn ? 'Redirecting to Google...' : 'Continue with Google'}</span>
                        </button>
                        <a
                            href="#how-it-works"
                            className="flex items-center justify-center gap-2 px-8 py-4 glass text-white font-semibold text-lg rounded-2xl hover:bg-slate-800/80 transition-all shadow-lg hover:shadow-xl"
                        >
                            Learn How It Works <span className="text-indigo-400 group-hover:translate-y-1 transition-transform">↓</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* ─── Stats Bar ─── */}
            <section className="relative z-20 -mt-10 mb-20">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="glass rounded-3xl p-8 grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-white/10 shadow-2xl">
                        {stats.map(({ value, label }, index) => (
                            <div key={label} className="text-center fade-in-up" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                                <p className="text-4xl font-extrabold text-white mb-2 tracking-tight">{value}</p>
                                <p className="text-indigo-300/80 text-sm font-medium uppercase tracking-wider">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Features ─── */}
            <section className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-slate-900/50 mix-blend-multiply" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16 fade-in-up">
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6">
                            Everything You Need
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                            From personalized matching to community insights — we've built every tool you need to navigate government schemes.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map(f => (
                            <FeatureCard key={f.title} {...f} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── How It Works ─── */}
            <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="text-center mb-16 fade-in-up">
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6">
                            3 Simple Steps
                        </h2>
                        <p className="text-slate-400 text-lg">
                            No complicated process. Just login, tell us about yourself, and discover your schemes.
                        </p>
                    </div>

                    <div className="glass rounded-3xl p-8 md:p-12 relative">
                        {/* Connecting vertical line for desktop */}
                        <div className="hidden md:block absolute left-[4.5rem] top-16 bottom-16 w-0.5 bg-gradient-to-b from-indigo-500/50 via-purple-500/50 to-transparent" />

                        <div className="space-y-12">
                            {steps.map((s) => (
                                <StepCard key={s.step} {...s} />
                            ))}
                        </div>
                    </div>

                    <div className="text-center mt-16 fade-in-up" style={{ animationDelay: '0.8s' }}>
                        <button
                            onClick={handleGetStarted}
                            disabled={isLoggingIn}
                            className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-full shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(139,92,246,0.6)] transition-all disabled:opacity-70 scale-100 hover:scale-105"
                        >
                            {isLoggingIn ? 'Redirecting...' : '🚀 Start Discovering Schemes'}
                        </button>
                    </div>
                </div>
            </section>

            {/* ─── CTA Banner ─── */}
            <section className="py-20 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
                <div className="max-w-4xl mx-auto relative z-10 text-center glass border border-white/10 rounded-3xl p-12 shadow-2xl">
                    <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-white leading-tight">
                        Don't Miss Out on Schemes<br />You Deserve
                    </h2>
                    <p className="text-indigo-200/80 mb-10 max-w-xl mx-auto text-lg">
                        Thousands of eligible Indian citizens miss government benefits simply because they don't know they exist. Find yours today.
                    </p>
                    <button
                        onClick={handleGetStarted}
                        disabled={isLoggingIn}
                        className="px-10 py-4 bg-white text-slate-900 font-bold text-lg rounded-2xl hover:bg-slate-100 transition-all disabled:opacity-70 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                        {isLoggingIn ? 'Redirecting...' : 'Get My Recommendations — It\'s Free'}
                    </button>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer className="py-8 px-6 border-t border-white/10 bg-slate-950 relative z-10">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-sm">🏛️</span>
                        </div>
                        <span className="font-semibold text-white tracking-wide">SAHAAY</span>
                    </div>
                    <p className="text-sm text-slate-500">© 2026 SAHAAY · Made for Indian Citizens · Built with ❤️</p>
                </div>
            </footer>
        </div>
    );
}
