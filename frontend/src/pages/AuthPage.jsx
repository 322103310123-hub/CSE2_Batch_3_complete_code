import { useState } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function AuthPage() {
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleGoogleLogin = () => {
        setIsLoggingIn(true);
        window.location.href = `${BASE_URL}/auth/google`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900" />

            {/* Decorative blobs */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Card */}
            <div className="relative z-10 w-full max-w-md mx-4 fade-in-up">
                <div className="glass rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                    {/* Top gradient strip */}
                    <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <div className="p-8 sm:p-10">
                        {/* Logo + Title */}
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <span className="text-4xl">🏛️</span>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800">GovSchemes</h1>
                            <p className="text-slate-500 text-sm mt-1">Smart Scheme Recommendation</p>
                        </div>

                        {/* Value props */}
                        <div className="space-y-2.5 mb-8">
                            {[
                                { icon: '🎯', text: 'Personalized scheme recommendations' },
                                { icon: '📋', text: 'Eligibility matching across all sectors' },
                                { icon: '⚡', text: 'Instant results based on your profile' },
                            ].map(({ icon, text }) => (
                                <div key={text} className="flex items-center gap-3 text-sm text-slate-600">
                                    <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 text-base">
                                        {icon}
                                    </span>
                                    {text}
                                </div>
                            ))}
                        </div>

                        {/* Google Login Button */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoggingIn}
                            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white border-2 border-slate-200 rounded-2xl text-slate-700 font-semibold hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isLoggingIn ? (
                                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full spinner" />
                            ) : (
                                <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            )}
                            {isLoggingIn ? 'Redirecting...' : 'Continue with Google'}
                        </button>

                        <p className="text-center text-xs text-slate-400 mt-4">
                            By continuing, you agree to our Terms of Service & Privacy Policy
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-white/40 mt-6">
                    © 2026 SAHAAY · Made for Indian Citizens
                </p>
            </div>
        </div>
    );
}
