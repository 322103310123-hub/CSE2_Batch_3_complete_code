import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveUserDetails, getUserDetails, updateUserDetails } from '../services/api';
import Navbar from '../components/Navbar';
import CategoryModal from '../components/CategoryModal';
import LoadingSpinner from '../components/LoadingSpinner';

const EDUCATION_OPTIONS = ['Primary', 'Secondary', 'Senior Secondary', 'Graduate', 'Postgraduate', 'Doctoral/Professional', 'Any Qualification'];
const CASTE_OPTIONS = ['General', 'OBC', 'SC', 'ST', 'Minority', 'Other'];
const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const DISABILITY_OPTIONS = ['None', 'PwD', 'Visually Impaired', 'Hearing Impaired', 'Locomotor', 'Multiple'];

const InputField = ({ label, required, error, children }) => (
    <div className="mb-4">
        <label className="block text-sm font-bold text-slate-300 mb-2">
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {children}
        {error && <p className="text-rose-500 text-xs mt-1.5 font-medium">{error}</p>}
    </div>
);

const inputClass = "w-full px-4 py-3 bg-slate-800/50 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-500 hover:bg-slate-800/80";
const selectClass = `${inputClass} appearance-none cursor-pointer`;

const SectionCard = ({ icon, title, subtitle, children }) => (
    <div className="glass rounded-3xl border border-slate-700/60 shadow-xl p-8 mb-8 relative overflow-hidden group">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-500" />

        <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-700/50">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner group-hover:bg-slate-700 group-hover:border-slate-600 transition-all">
                    {icon}
                </div>
                <div>
                    <h2 className="text-lg font-extrabold text-white tracking-tight">{title}</h2>
                    {subtitle && <p className="text-sm text-slate-400 font-medium">{subtitle}</p>}
                </div>
            </div>
            {children}
        </div>
    </div>
);

export default function ProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState({
        user_id: user?.id || '',
        user_name: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'India',
        gender: '',
        age: '',
        education: '',
        caste: '',
        income: '',
        disability: 'None',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [isUpdate, setIsUpdate] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [apiError, setApiError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // On mount: check if profile already exists → prefill form
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getUserDetails();
                const allUsers = res.data;
                const existing = allUsers.find(u => u.user_id === user?.id);
                if (existing) {
                    setIsUpdate(true);
                    setForm({
                        user_id: existing.user_id,
                        user_name: existing.full_name || '',
                        email: existing.email || '',
                        phone: existing.phone || '',
                        address: existing.address || '',
                        city: existing.city || '',
                        state: existing.state || '',
                        zip_code: existing.zip_code || '',
                        country: existing.country || 'India',
                        gender: existing.gender || '',
                        age: existing.age?.toString() || '',
                        education: existing.education || '',
                        caste: existing.caste || '',
                        income: existing.income?.toString() || '',
                        disability: existing.disability || 'None',
                    });
                }
            } catch {
                // If fetch fails, just start fresh (create mode)
            } finally {
                setLoadingProfile(false);
            }
        };
        if (user?.id) fetchProfile();
        else setLoadingProfile(false);
    }, [user?.id]);

    const validate = () => {
        const errs = {};
        if (!form.user_name.trim()) errs.user_name = 'Name is required';
        if (!form.email.includes('@')) errs.email = 'Valid email required';
        if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Enter valid 10-digit phone';
        if (!form.city.trim()) errs.city = 'City is required';
        if (!form.state.trim()) errs.state = 'State is required';
        if (!form.gender) errs.gender = 'Gender is required';
        const age = parseInt(form.age);
        if (!age || age < 1 || age > 120) errs.age = 'Valid age (1–120) required';
        if (!form.education) errs.education = 'Education is required';
        if (!form.caste) errs.caste = 'Caste is required';
        const income = parseInt(form.income);
        if (isNaN(income) || income < 0) errs.income = 'Valid annual income required';
        return errs;
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        setApiError('');
        setSuccessMsg('');
        try {
            const payload = {
                ...form,
                age: parseInt(form.age),
                income: parseInt(form.income),
            };

            if (isUpdate) {
                await updateUserDetails(user.id, payload);
                setSuccessMsg('Profile updated successfully!');
                localStorage.setItem('profileSaved', 'true');
                setTimeout(() => navigate(`/recommendations${location.search}`), 1200);
            } else {
                await saveUserDetails(payload);
                setIsUpdate(true);
                localStorage.setItem('profileSaved', 'true');
                setShowCategoryModal(true);
            }
        } catch (err) {
            setApiError(err.response?.data?.detail || 'Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingProfile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-slate-400 font-medium animate-pulse">Loading profile data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <Navbar onCategoryClick={() => setShowCategoryModal(true)} />

            {/* Background embellishments */}
            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

            {/* Header */}
            <div className="relative pt-8 pb-12 px-6 overflow-hidden">
                <div className="max-w-3xl mx-auto relative z-10 fade-in-up">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20">
                            {isUpdate ? '✏️' : '👤'}
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">
                                {isUpdate ? 'Update Your Profile' : 'Complete Your Profile'}
                            </h1>
                            <p className="text-indigo-300/80 text-base mt-1 font-medium">
                                {isUpdate
                                    ? 'Keep your details up-to-date for accurate matching'
                                    : 'Help our engine find the absolute best schemes for you'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-3xl mx-auto px-6 pb-20 relative z-10">
                {apiError && (
                    <div className="mb-8 p-5 glass border border-rose-500/30 rounded-2xl text-sm text-rose-300 flex items-center gap-3 fade-in-up shadow-lg">
                        <span className="text-xl">⚠️</span> <span className="font-medium">{apiError}</span>
                    </div>
                )}
                {successMsg && (
                    <div className="mb-8 p-5 glass border border-emerald-500/30 rounded-2xl text-sm text-emerald-300 flex items-center gap-3 fade-in-up shadow-lg">
                        <span className="text-xl">✅</span> <span className="font-medium">{successMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="fade-in-up" style={{ animationDelay: '0.1s' }}>

                    {/* Section: Personal Info */}
                    <SectionCard icon="👤" title="Personal Information" subtitle="Basic contact and identity details">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                            <InputField label="Full Name" required error={errors.user_name}>
                                <input type="text" className={inputClass} value={form.user_name}
                                    onChange={e => handleChange('user_name', e.target.value)} placeholder="Your full name" />
                            </InputField>

                            <InputField label="Email Address" required error={errors.email}>
                                <input type="email" className={inputClass} value={form.email}
                                    onChange={e => handleChange('email', e.target.value)} placeholder="you@example.com" />
                            </InputField>

                            <InputField label="Phone Number" required error={errors.phone}>
                                <input type="tel" className={inputClass} value={form.phone}
                                    onChange={e => handleChange('phone', e.target.value)} placeholder="10-digit number" maxLength={10} />
                            </InputField>
                        </div>
                    </SectionCard>

                    {/* Section: Demographic Details */}
                    <SectionCard icon="🧑‍🤝‍🧑" title="Demographics" subtitle="Used to match schemes based on age and gender eligibility">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                            <InputField label="Gender" required error={errors.gender}>
                                <div className="relative">
                                    <select className={selectClass} value={form.gender} onChange={e => handleChange('gender', e.target.value)}>
                                        <option value="" className="text-slate-500">Select gender...</option>
                                        {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</div>
                                </div>
                            </InputField>

                            <InputField label="Age" required error={errors.age}>
                                <input type="number" className={inputClass} value={form.age}
                                    onChange={e => handleChange('age', e.target.value)} placeholder="Your age" min={1} max={120} />
                            </InputField>
                        </div>
                    </SectionCard>

                    {/* Section: Address */}
                    <SectionCard icon="📍" title="Location & Address" subtitle="Helps find state-specific and region-specific schemes">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                            <div className="sm:col-span-2">
                                <InputField label="Street Address">
                                    <input type="text" className={inputClass} value={form.address}
                                        onChange={e => handleChange('address', e.target.value)} placeholder="House, Street, Area..." />
                                </InputField>
                            </div>

                            <InputField label="City" required error={errors.city}>
                                <input type="text" className={inputClass} value={form.city}
                                    onChange={e => handleChange('city', e.target.value)} placeholder="Your city" />
                            </InputField>

                            <InputField label="State" required error={errors.state}>
                                <input type="text" className={inputClass} value={form.state}
                                    onChange={e => handleChange('state', e.target.value)} placeholder="Your state" />
                            </InputField>

                            <InputField label="Zip / PIN Code">
                                <input type="text" className={inputClass} value={form.zip_code}
                                    onChange={e => handleChange('zip_code', e.target.value)} placeholder="6-digit PIN code" maxLength={10} />
                            </InputField>

                            <InputField label="Country">
                                <input type="text" className={inputClass} value={form.country}
                                    onChange={e => handleChange('country', e.target.value)} disabled />
                            </InputField>
                        </div>
                    </SectionCard>

                    {/* Section: Eligibility Information */}
                    <SectionCard
                        icon="🧮"
                        title="Eligibility Factors"
                        subtitle="Critical for accurate scheme matching — education, income & social category"
                    >
                        <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-sm font-medium text-indigo-300 flex items-start gap-3">
                            <span className="mt-0.5 flex-shrink-0 text-lg">💡</span>
                            <p>This information is processed directly by our matching engine to find the exact schemes you qualify for and is never shared with third parties.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                            <InputField label="Education Level" required error={errors.education}>
                                <div className="relative">
                                    <select className={selectClass} value={form.education} onChange={e => handleChange('education', e.target.value)}>
                                        <option value="" className="text-slate-500">Select highest qualification...</option>
                                        {EDUCATION_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                                    </select>
                                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</div>
                                </div>
                            </InputField>

                            <InputField label="Social Category (Caste)" required error={errors.caste}>
                                <div className="relative">
                                    <select className={selectClass} value={form.caste} onChange={e => handleChange('caste', e.target.value)}>
                                        <option value="" className="text-slate-500">Select category...</option>
                                        {CASTE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</div>
                                </div>
                            </InputField>

                            <InputField label="Annual Family Income (₹)" required error={errors.income}>
                                <input type="number" className={inputClass} value={form.income}
                                    onChange={e => handleChange('income', e.target.value)} placeholder="e.g. 250000" min={0} />
                            </InputField>

                            <InputField label="Disability Status">
                                <div className="relative">
                                    <select className={selectClass} value={form.disability} onChange={e => handleChange('disability', e.target.value)}>
                                        {DISABILITY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</div>
                                </div>
                            </InputField>
                        </div>
                    </SectionCard>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-lg transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-70 flex items-center justify-center gap-3 border border-indigo-500/50 hover:border-indigo-400 scale-100 hover:scale-[1.02]"
                    >
                        {loading ? (
                            <>
                                <LoadingSpinner size="sm" color="white" />
                                {isUpdate ? 'Updating Profile...' : 'Saving Profile...'}
                            </>
                        ) : (
                            isUpdate ? '✏️ Update Profile' : '🚀 Save & Discover Schemes'
                        )}
                    </button>

                    <p className="text-center text-sm font-medium text-slate-500 mt-6 flex justify-center items-center gap-2">
                        🔒 Secured by industry-standard encryption.
                    </p>
                </form>
            </div>

            {/* Category Modal after save */}
            {showCategoryModal && (
                <CategoryModal
                    onClose={() => {
                        setShowCategoryModal(false);
                        navigate('/recommendations');
                    }}
                />
            )}
        </div>
    );
}
