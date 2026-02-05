import { useState } from 'react';
import { Search, Bell, Plus, Zap, Sun, Moon, LogIn, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSearch } from '../contexts/SearchContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';

type NavItem = 'hot' | 'new' | 'discussed';

interface HeaderProps {
    onPostClick: () => void;
}

export const Header = ({ onPostClick }: HeaderProps) => {
    const [activeNav, setActiveNav] = useState<NavItem>('hot');
    const { setQuery } = useSearch();
    const { theme, toggleTheme } = useTheme();
    const { user, isAuthenticated, signOut } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setQuery(value);
    };

    const openLogin = () => {
        setAuthMode('login');
        setIsAuthModalOpen(true);
    };

    const openSignup = () => {
        setAuthMode('signup');
        setIsAuthModalOpen(true);
    };

    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <>
            <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-4">
                        {/* Logo and Navigation */}
                        <div className="flex items-center gap-8">
                            {/* Logo */}
                            <a href="/" className="flex items-center gap-2 group">
                                <div className="bg-blue-600 rounded-lg p-2 group-hover:bg-blue-700 transition-colors">
                                    <Zap size={24} className="text-white" fill="white" />
                                </div>
                                <span className="text-xl font-bold text-gray-900 dark:text-white">DealFeed</span>
                            </a>

                            {/* Navigation */}
                            <nav className="hidden md:flex items-center gap-1">
                                <NavButton
                                    active={activeNav === 'hot'}
                                    onClick={() => setActiveNav('hot')}
                                >
                                    Hot
                                </NavButton>
                                <NavButton
                                    active={activeNav === 'new'}
                                    onClick={() => setActiveNav('new')}
                                >
                                    New
                                </NavButton>
                                <NavButton
                                    active={activeNav === 'discussed'}
                                    onClick={() => setActiveNav('discussed')}
                                >
                                    Discussed
                                </NavButton>
                            </nav>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-2xl mx-8 hidden sm:block">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    placeholder="Search deals, stores, products..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-3">
                            {/* Post Deal Button - only if authenticated */}
                            {isAuthenticated && (
                                <>
                                    <button
                                        onClick={onPostClick}
                                        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        <Plus size={20} />
                                        <span>Post Deal</span>
                                    </button>
                                    <button
                                        onClick={onPostClick}
                                        className="sm:hidden p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </>
                            )}

                            <div className="hidden md:flex items-center gap-2">
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors dark:text-gray-300 dark:hover:bg-gray-800"
                                    aria-label="Toggle theme"
                                >
                                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                                </button>
                                {isAuthenticated && (
                                    <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors dark:text-gray-300 dark:hover:bg-gray-800">
                                        <Bell size={20} />
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                    </button>
                                )}
                            </div>

                            {/* Auth Buttons or Profile */}
                            {isAuthenticated ? (
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-2 pl-2 pr-4 py-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors border border-gray-200 dark:border-gray-700"
                                    >
                                        <img
                                            src={user?.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                                            alt={user?.profile?.username || 'User'}
                                            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700"
                                        />
                                        <span className="font-medium text-sm hidden sm:block">
                                            {user?.profile?.username || 'User'}
                                        </span>
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors dark:text-gray-300 dark:hover:bg-gray-800"
                                        title="Wyloguj się"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={openLogin}
                                        className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                                    >
                                        <LogIn size={18} />
                                        <span>Zaloguj</span>
                                    </button>
                                    <button
                                        onClick={openSignup}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        <User size={18} />
                                        <span className="hidden sm:inline">Dołącz</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
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

// Helper component for navigation buttons
interface NavButtonProps {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

const NavButton = ({ active, onClick, children }: NavButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 font-medium rounded-lg transition-colors ${active
                ? 'text-gray-900 bg-gray-100 dark:bg-gray-800 dark:text-white'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
        >
            {children}
        </button>
    );
};