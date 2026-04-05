export default function LoadingSpinner({ size = 'md', color = 'indigo' }) {
    const sizes = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-2',
        lg: 'w-14 h-14 border-4',
    };

    const colors = {
        indigo: 'border-indigo-500',
        white: 'border-white',
        purple: 'border-purple-500',
    };

    return (
        <div className="flex flex-col items-center gap-3">
            <div
                className={`${sizes[size]} ${colors[color]} border-t-transparent rounded-full spinner`}
            />
            {size === 'lg' && (
                <p className="text-sm text-indigo-400 font-medium animate-pulse">Loading...</p>
            )}
        </div>
    );
}
