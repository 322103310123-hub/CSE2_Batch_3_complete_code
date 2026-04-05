import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CallbackPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const email = params.get('email');
        const name = params.get('name');
        const id = params.get('id');
        const message = params.get('message');

        if (!token || !email || !id) {
            // OAuth failed or params missing — redirect back to login
            navigate('/', { replace: true });
            return;
        }

        login({ id, email, name: name || email, token });

        // If "User Created" → go to profile page first
        // If existing user ("Login Successful") → skip profile, go to recommendations
        const isNewUser = message && message.toLowerCase().includes('created');
        const profileSaved = localStorage.getItem('profileSaved');

        if (isNewUser || !profileSaved) {
            navigate('/profile', { replace: true });
        } else {
            navigate('/recommendations', { replace: true });
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
            <LoadingSpinner size="lg" />
            <p className="mt-6 text-lg font-semibold text-slate-700">Signing you in...</p>
            <p className="text-sm text-slate-400 mt-1">Please wait while we set things up</p>
        </div>
    );
}
