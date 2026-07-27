import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Shield, Zap, Sun, Moon, LogIn, User, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSearch } from '../contexts/SearchContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useUserRole } from '../hooks/useUserRole';
import { AuthModal } from './AuthModal';
import { NotificationDropdown } from './NotificationDropdown';
import { sanitizeUrl } from '../lib/sanitize';
import { CATEGORIES, type Category } from '../constants/categories';
import { CATEGORY_ICONS } from '../constants/categoryIcons';

export const Header = () => {
    const { setQuery, filters, setCategory } = useSearch();
    const { theme, toggleTheme } = useTheme();
    const { user, isAuthenticated, signOut } = useAuth();
    const { canModerate } = useUserRole();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        // Debounce search by 300ms
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setQuery(value);
        }, 300);
    };

    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const openLogin = () => {
        setAuthMode('login');
        setIsAuthModalOpen(true);
    };

    const openSignup = () => {
        setAuthMode('signup');
        setIsAuthModalOpen(true);
    };

    const handleSignOut = async () => {
        setProfileMenuOpen(false);
        await signOut();
    };

    return (
        <>
            <header className="sticky top-0 z-50 bg-gradient-to-br from-violet-700 via-purple-600 to-fuchsia-600 dark:from-violet-900 dark:via-purple-900 dark:to-fuchsia-900 rounded-b-3xl sm:rounded-b-[2.5rem] shadow-lg shadow-purple-950/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-3">
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                        {/* Logo */}
                        <a href="/" className="flex items-center gap-2 group shrink-0">
                            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2 group-hover:bg-white/25 transition-colors">
                                <Zap size={22} className="text-white" fill="white" />
                            </div>
                            <span className="hidden min-[400px]:inline text-lg sm:text-xl font-bold text-white">DealFeed</span>
                        </a>

                        {/* Search Bar */}
                        <div className="flex-1 min-w-0 max-w-2xl">
                            <div className="relative">
                                <Search
                                    className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-violet-400"
                                    size={18}
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    placeholder="Search deals, stores..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-950/90 border-transparent rounded-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/60 shadow-sm transition-all"
                                />
                            </div>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-white/90 hover:bg-white/20 rounded-full transition-colors"
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            </button>

                            {isAuthenticated && (
                                <>
                                    <NotificationDropdown />
                                    <Link
                                        to="/create-deal"
                                        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white text-violet-700 rounded-full hover:bg-violet-50 transition-colors font-semibold text-sm shadow-sm"
                                    >
                                        <Plus size={18} />
                                        <span>Dodaj ofertę</span>
                                    </Link>
                                    {canModerate && (
                                        <Link
                                            to="/admin"
                                            className="hidden sm:flex p-2 text-white/90 hover:bg-white/20 rounded-full transition-colors"
                                            title="Panel admina"
                                        >
                                            <Shield size={20} />
                                        </Link>
                                    )}
                                </>
                            )}

                            {isAuthenticated ? (
                                <div className="relative" ref={profileMenuRef}>
                                    <button
                                        onClick={() => setProfileMenuOpen((v) => !v)}
                                        className="flex items-center gap-1 p-0.5 rounded-full ring-2 ring-white/40 hover:ring-white/70 transition-all"
                                    >
                                        <img
                                            src={sanitizeUrl(user?.profile?.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                                            alt={user?.profile?.username || 'User'}
                                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white"
                                        />
                                    </button>
                                    {profileMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden py-1">
                                            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                    {user?.profile?.username || 'User'}
                                                </p>
                                            </div>
                                            <Link
                                                to="/create-deal"
                                                onClick={() => setProfileMenuOpen(false)}
                                                className="sm:hidden flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                                            >
                                                <Plus size={16} />
                                                Dodaj ofertę
                                            </Link>
                                            {canModerate && (
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setProfileMenuOpen(false)}
                                                    className="sm:hidden flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                                                >
                                                    <Shield size={16} />
                                                    Panel admina
                                                </Link>
                                            )}
                                            <Link
                                                to="/profile"
                                                onClick={() => setProfileMenuOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                                            >
                                                <User size={16} />
                                                Profil
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <LogIn size={16} className="rotate-180" />
                                                Wyloguj
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={openLogin}
                                        className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-white/90 hover:bg-white/15 rounded-full transition-colors font-medium text-sm"
                                    >
                                        <LogIn size={16} />
                                        <span>Zaloguj</span>
                                    </button>
                                    <button
                                        onClick={openSignup}
                                        className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-white text-violet-700 rounded-full hover:bg-violet-50 transition-colors font-semibold text-sm shadow-sm"
                                    >
                                        <User size={16} />
                                        <span>Dołącz</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Category quick filters */}
                    <nav className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1 lg:flex-wrap lg:overflow-visible lg:mx-0 lg:px-0 lg:pb-0">
                        <CategoryPill
                            active={!filters.category}
                            onClick={() => setCategory(undefined)}
                            icon={<Sparkles size={20} />}
                            label="All"
                        />
                        {CATEGORIES.map((category) => {
                            const Icon = CATEGORY_ICONS[category as Category];
                            return (
                                <CategoryPill
                                    key={category}
                                    active={filters.category === category}
                                    onClick={() => setCategory(category)}
                                    icon={<Icon size={20} />}
                                    label={category}
                                />
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authMode}
            />
        </>
    );
};

interface CategoryPillProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

const CategoryPill = ({ active, onClick, icon, label }: CategoryPillProps) => {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-1.5 min-w-[74px] px-3 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${active
                ? 'bg-white text-violet-700 shadow-sm'
                : 'bg-white/15 text-white hover:bg-white/25'
                }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
};
