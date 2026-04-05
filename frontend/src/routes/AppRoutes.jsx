import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LandingPage from '../pages/LandingPage';
import CallbackPage from '../pages/CallbackPage';
import ProfilePage from '../pages/ProfilePage';
import RecommendationPage from '../pages/RecommendationPage';
import SchemeDetailPage from '../pages/SchemeDetailPage';
import SearchSchemes from '../pages/SearchSchemes';
import ProtectedRoute from '../components/ProtectedRoute';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AppRoutes() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <Routes>
            {/* Public: Landing page */}
            <Route
                path="/"
                element={isAuthenticated ? <Navigate to="/recommendations" replace /> : <LandingPage />}
            />
            {/* OAuth callback */}
            <Route path="/callback" element={<CallbackPage />} />
            {/* Protected routes */}
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/recommendations"
                element={
                    <ProtectedRoute>
                        <RecommendationPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/scheme/:title"
                element={
                    <ProtectedRoute>
                        <SchemeDetailPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/search"
                element={
                    <ProtectedRoute>
                        <SearchSchemes />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
