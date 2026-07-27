import { Home, Heart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const BottomNav = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const isSavedActive = location.pathname === '/profile' && location.search === '?tab=saved';
    const isProfileActive = location.pathname === '/profile' && !isSavedActive;
    const isHomeActive = location.pathname === '/';

    const itemClass = (active: boolean) =>
        `flex flex-col items-center justify-center gap-1 flex-1 py-2.5 text-xs font-medium transition-colors ${active ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400 dark:text-gray-500'
        }`;

    return (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-stretch max-w-7xl mx-auto">
                <Link to="/" className={itemClass(isHomeActive)}>
                    <Home size={22} />
                    Home
                </Link>
                <Link to={isAuthenticated ? '/profile?tab=saved' : '/'} className={itemClass(isSavedActive)}>
                    <Heart size={22} />
                    Saved
                </Link>
                <Link to="/profile" className={itemClass(isProfileActive)}>
                    <User size={22} />
                    Profile
                </Link>
            </div>
        </nav>
    );
};
